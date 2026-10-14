// What the model is asked and how its answer becomes a progress check. Plain TypeScript without
// Deno APIs, so it can be tested outside the Edge runtime.

export const POSES = ['front', 'side', 'back'] as const;
type Pose = (typeof POSES)[number];

/** Muscle groups a check scores, in the app's order. */
const GROUPS = ['shoulders', 'chest', 'arms', 'back', 'core', 'legs'] as const;
type Group = (typeof GROUPS)[number];

const PHOTO_ISSUES = [
  'none',
  'dark',
  'blurry',
  'not_full_body',
  'wrong_pose',
  'no_person',
  'clothing',
] as const;
type PhotoIssue = Exclude<(typeof PHOTO_ISSUES)[number], 'none'>;

export interface AnalysisProfile {
  sex: string | null;
  /** ISO date (YYYY-MM-DD). */
  birth_date: string | null;
  height_cm: number | null;
  experience: string | null;
}

/** A row of weight_entries, oldest first. */
export interface WeightEntryRow {
  /** The user's calendar day (YYYY-MM-DD). */
  date: string;
  weight_kg: number;
}

interface Metrics {
  bodyFat: number;
  proportions: number;
  definition: number;
}

export interface PreviousCheck {
  id: string;
  created_at: string;
  group_scores: Partial<Record<Group, number>>;
  metrics: Partial<Metrics>;
}

interface CheckResult {
  score: number;
  groupScores: Record<Group, number>;
  metrics: Metrics;
}

type Analysis =
  | { status: 'ok'; result: CheckResult }
  | { status: 'retake'; issues: { pose: Pose; issue: PhotoIssue }[] };

/** The model's answer, forced by SCHEMA. */
export interface ModelOutput {
  photos: { pose: Pose; issue: PhotoIssue | 'none' }[];
  body_fat_percent: number;
  groups: Record<Group, number>;
  proportions: number;
  definition: number;
}

export const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['photos', 'body_fat_percent', 'groups', 'proportions', 'definition'],
  properties: {
    photos: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['pose', 'issue'],
        properties: {
          pose: { type: 'string', enum: [...POSES] },
          issue: { type: 'string', enum: [...PHOTO_ISSUES] },
        },
      },
    },
    body_fat_percent: { type: 'number' },
    groups: {
      type: 'object',
      additionalProperties: false,
      required: [...GROUPS],
      properties: Object.fromEntries(GROUPS.map((g) => [g, { type: 'integer' }])),
    },
    proportions: { type: 'integer' },
    definition: { type: 'integer' },
  },
};

export const INSTRUCTIONS = `You assess body-composition photos for a strength-training app. You get three photos of the same adult (front, side, back), their profile and, if there is one, the values and photos of their previous check.

First check every photo of this check and set its issue (the previous check's photos are only for comparison):
- "no_person": no person visible.
- "not_full_body": the head or the body down to the knees is cut off. Missing feet or lower legs are fine (small rooms).
- "wrong_pose": the person does not face the camera (front), stand sideways (side) or turn their back to the camera (back) as labelled.
- "dark": too dark or too strongly backlit to judge the body.
- "blurry": too blurry to judge the body.
- "clothing": clothes too loose to see the body's shape (fitted sportswear or underwear is fine).
- "none": the photo is usable.
Be lenient: flag a photo only if the problem keeps you from judging the body.

Then estimate from what is visible in this check's photos (with the lower legs cut off, judge the legs by the thighs):
- body_fat_percent: estimated body fat in percent, one decimal.
- groups: development of each muscle group from 0 to 100, judged for the person's sex. 20 = clearly untrained, 50 = average untrained adult, 70 = visibly trained recreational lifter, 85 = advanced lifter, 95 or more = elite natural athlete.
- proportions: 0 to 100, balance of the physique: upper against lower body, left against right, shoulders against waist.
- definition: 0 to 100, how visible the separation between muscles is (mostly a matter of leanness).

Consistency matters more than precision: users repeat the check every few weeks and compare the results. If there is a previous check, compare each pose with its previous photo, start from the previous values and change a value only where the photos show a clear visible difference; a small but clear change is worth 1 to 3 points. Different lighting, camera distance or angle, pump, posture or a full stomach are not progress. Never comment on attractiveness. If a photo is unusable, still fill in your best estimates; they are ignored.`;

const round = (value: number, min: number, max: number) =>
  Math.round(Math.min(max, Math.max(min, value)));

const DAY_MS = 86_400_000;

/**
 * Whole years someone born on `birthDate` (YYYY-MM-DD) is on `today`, as the app counts them
 * (`ageFrom` in src/shared/data/profile.ts), here on the UTC date.
 */
export function ageFrom(birthDate: string, today: Date) {
  const [year, month, day] = birthDate.split('-').map(Number);
  const todayMonth = today.getUTCMonth() + 1;
  const hadBirthday = todayMonth > month || (todayMonth === month && today.getUTCDate() >= day);
  return today.getUTCFullYear() - year - (hadBirthday ? 0 : 1);
}

const WEIGHT_TREND_DAYS = 30;

/** The first day of weight entries to read: enough to settle the trend before the 30 days. */
export const weightHistorySince = (now: Date) =>
  new Date(now.getTime() - 120 * DAY_MS).toISOString().slice(0, 10);

const dayNumber = (date: string) => Math.round(Date.parse(`${date}T00:00:00Z`) / DAY_MS);
const kg = (value: number) => `${Math.round(value * 10) / 10} kg`;

/**
 * The latest weigh-in and how the smoothed trend moved over the last 30 days, as the app's
 * weight history shows it: each weigh-in moves the trend 10 % toward the scale, a gap of n days
 * counting n times.
 */
export function weightText(entries: WeightEntryRow[], now: Date) {
  const last = entries.at(-1);
  if (!last) return null;
  const since = Math.round(now.getTime() / DAY_MS) - WEIGHT_TREND_DAYS;
  let trend = entries[0].weight_kg;
  let trendAtStart: number | null = null;
  entries.forEach((e, i) => {
    if (i) {
      const days = Math.max(1, dayNumber(e.date) - dayNumber(entries[i - 1].date));
      trend += (1 - 0.9 ** days) * (e.weight_kg - trend);
    }
    if (dayNumber(e.date) <= since) trendAtStart = trend;
  });
  const change =
    trendAtStart === null
      ? ''
      : `, ${trend - trendAtStart >= 0 ? '+' : '−'}${kg(Math.abs(trend - trendAtStart))} over ${WEIGHT_TREND_DAYS} days`;
  return `weight ${kg(last.weight_kg)} on ${last.date} (trend ${kg(trend)}${change})`;
}

/** The text before the photos: who is in them and what the last check found. */
export function contextText(
  profile: AnalysisProfile | null,
  weights: WeightEntryRow[],
  previous: PreviousCheck | null,
  now: Date,
) {
  const facts = [
    profile?.sex && profile.sex !== 'unspecified' ? `sex ${profile.sex}` : null,
    profile?.birth_date ? `${ageFrom(profile.birth_date, now)} years` : null,
    profile?.height_cm ? `${profile.height_cm} cm` : null,
    weightText(weights, now),
    profile?.experience ? `training experience ${profile.experience}` : null,
  ].filter(Boolean);
  const lines = [`Profile: ${facts.length ? facts.join(', ') : 'unknown'}.`];
  if (previous) {
    const days = Math.round((now.getTime() - Date.parse(previous.created_at)) / DAY_MS);
    const { bodyFat, proportions, definition } = previous.metrics;
    const values = [
      bodyFat !== undefined ? `body fat ${bodyFat} %` : null,
      proportions !== undefined ? `proportions ${proportions}` : null,
      definition !== undefined ? `definition ${definition}` : null,
      ...GROUPS.map((g) =>
        previous.group_scores[g] !== undefined ? `${g} ${previous.group_scores[g]}` : null,
      ),
    ].filter(Boolean);
    lines.push(`Previous check, ${days} days ago: ${values.join(', ')}.`);
  } else {
    lines.push('This is the first check.');
  }
  lines.push('Each photo is labelled with its pose and the check it is from.');
  return lines.join('\n');
}

export type Photos = Record<Pose, string>;

/**
 * The model's input: the context, then pose by pose the previous check's photo (where there is
 * one) right before this check's, so each pair can be compared directly.
 */
export function modelInput(context: string, photos: Photos, previous: Partial<Photos>) {
  const image = (url: string) => ({ type: 'input_image', image_url: url, detail: 'high' });
  return [
    { type: 'input_text', text: context },
    ...POSES.flatMap((pose) => [
      ...(previous[pose]
        ? [{ type: 'input_text', text: `${pose}, previous check:` }, image(previous[pose])]
        : []),
      { type: 'input_text', text: `${pose}, this check:` },
      image(photos[pose]),
    ]),
  ];
}

/** Overall score: muscle groups weigh 60 %, proportions and definition 20 % each. */
function overallScore(groups: Record<Group, number>, proportions: number, definition: number) {
  const mean = GROUPS.reduce((sum, g) => sum + groups[g], 0) / GROUPS.length;
  return round(0.6 * mean + 0.2 * proportions + 0.2 * definition, 0, 100);
}

/** Photos the model could not judge ask for a retake; otherwise the clamped values and score. */
export function toAnalysis(output: ModelOutput): Analysis {
  const issues = output.photos.flatMap((p) =>
    p.issue !== 'none' && POSES.includes(p.pose) ? [{ pose: p.pose, issue: p.issue }] : [],
  );
  if (issues.length) return { status: 'retake', issues };
  const groupScores = Object.fromEntries(
    GROUPS.map((g) => [g, round(output.groups[g], 0, 100)]),
  ) as Record<Group, number>;
  const proportions = round(output.proportions, 0, 100);
  const definition = round(output.definition, 0, 100);
  const bodyFat = Math.round(Math.min(60, Math.max(3, output.body_fat_percent)) * 10) / 10;
  return {
    status: 'ok',
    result: {
      score: overallScore(groupScores, proportions, definition),
      groupScores,
      metrics: { bodyFat, proportions, definition },
    },
  };
}

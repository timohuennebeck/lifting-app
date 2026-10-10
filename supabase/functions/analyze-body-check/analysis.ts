// What the model is asked and how its answer becomes a body check. Plain TypeScript without
// Deno APIs, so it can be tested outside the Edge runtime.

export const POSES = ['front', 'side', 'back'] as const;
export type Pose = (typeof POSES)[number];

/** Muscle groups a check scores, in the app's order. */
export const GROUPS = ['shoulders', 'chest', 'arms', 'back', 'core', 'legs'] as const;
export type Group = (typeof GROUPS)[number];

export const PHOTO_ISSUES = [
  'none',
  'dark',
  'blurry',
  'not_full_body',
  'wrong_pose',
  'no_person',
  'clothing',
] as const;
export type PhotoIssue = Exclude<(typeof PHOTO_ISSUES)[number], 'none'>;

export interface AnalysisProfile {
  sex: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  experience: string | null;
}

export interface Metrics {
  bodyFat: number;
  proportions: number;
  definition: number;
}

export interface PreviousCheck {
  created_at: string;
  group_scores: Partial<Record<Group, number>>;
  metrics: Partial<Metrics>;
}

export interface CheckResult {
  score: number;
  groupScores: Record<Group, number>;
  metrics: Metrics;
}

export type Analysis =
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

export const INSTRUCTIONS = `You assess body-composition photos for a strength-training app. You get three photos of the same adult (front, side, back), their profile and, if there is one, the values of their previous check.

First check every photo and set its issue:
- "no_person": no person visible.
- "not_full_body": the body is not visible from head to feet.
- "wrong_pose": the person does not face the camera (front), stand sideways (side) or turn their back to the camera (back) as labelled.
- "dark": too dark or too strongly backlit to judge the body.
- "blurry": too blurry to judge the body.
- "clothing": clothes too loose to see the body's shape (fitted sportswear or underwear is fine).
- "none": the photo is usable.
Be lenient: flag a photo only if the problem keeps you from judging the body.

Then estimate from what is visible:
- body_fat_percent: estimated body fat in percent, one decimal.
- groups: development of each muscle group from 0 to 100, judged for the person's sex. 20 = clearly untrained, 50 = average untrained adult, 70 = visibly trained recreational lifter, 85 = advanced lifter, 95 or more = elite natural athlete.
- proportions: 0 to 100, balance of the physique: upper against lower body, left against right, shoulders against waist.
- definition: 0 to 100, how visible the separation between muscles is (mostly a matter of leanness).

Consistency matters more than precision: users repeat the check every few weeks and compare the results. If there is a previous check, start from its values and change a value only where you see a clear visible difference. Lighting, pump, posture or a full stomach are not progress. Never comment on attractiveness. If a photo is unusable, still fill in your best estimates; they are ignored.`;

const round = (value: number, min: number, max: number) =>
  Math.round(Math.min(max, Math.max(min, value)));

const DAY_MS = 86_400_000;

/** The text before the photos: who is in them and what the last check found. */
export function contextText(
  profile: AnalysisProfile | null,
  previous: PreviousCheck | null,
  now: Date,
) {
  const facts = [
    profile?.sex && profile.sex !== 'unspecified' ? `sex ${profile.sex}` : null,
    profile?.age ? `${profile.age} years` : null,
    profile?.height_cm ? `${profile.height_cm} cm` : null,
    profile?.weight_kg ? `${profile.weight_kg} kg` : null,
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
  lines.push('The photos follow in the order front, side, back.');
  return lines.join('\n');
}

/** Overall score: muscle groups weigh 60 %, proportions and definition 20 % each. */
export function overallScore(
  groups: Record<Group, number>,
  proportions: number,
  definition: number,
) {
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

interface ResponseContent {
  type: string;
  text?: string;
  refusal?: string;
}

interface ResponsesApiResult {
  status?: string;
  output?: { type: string; content?: ResponseContent[] }[];
}

/** The answer text of a Responses API result, or why there is none. */
export function readResponse(
  body: ResponsesApiResult,
): { text: string } | { refusal: string } | { incomplete: string } {
  if (body.status && body.status !== 'completed') return { incomplete: body.status };
  for (const item of body.output ?? []) {
    if (item.type !== 'message') continue;
    for (const content of item.content ?? []) {
      if (content.type === 'refusal') return { refusal: content.refusal ?? '' };
      if (content.type === 'output_text' && content.text) return { text: content.text };
    }
  }
  return { incomplete: 'no_text' };
}

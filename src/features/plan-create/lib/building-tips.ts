import type { EquipmentAccess } from '@/shared/data/profile';
import { storage } from '@/shared/lib/storage';

export type TipTopic = 'training' | 'recovery' | 'nutrition' | 'progress' | 'myth' | 'app';

interface TipDef {
  id: string;
  topic: TipTopic;
  /** Shown only with this equipment; all when left out. */
  equipment?: readonly EquipmentAccess[];
}

/** The tips the building screen shows while the plan is made; texts in planCreate:building.tips. */
export const BUILDING_TIPS = [
  { id: 'supersets', topic: 'training' },
  { id: 'dropSets', topic: 'training' },
  { id: 'reserve', topic: 'training' },
  { id: 'setsPerSession', topic: 'training' },
  { id: 'overheadTriceps', topic: 'training', equipment: ['gym'] },
  { id: 'seatedLegCurl', topic: 'training', equipment: ['gym'] },
  { id: 'deepSquats', topic: 'training' },
  { id: 'deadliftStance', topic: 'training', equipment: ['gym', 'home'] },
  { id: 'longerRest', topic: 'recovery' },
  { id: 'iceBath', topic: 'recovery' },
  { id: 'recoveryTime', topic: 'recovery' },
  { id: 'cardioOrder', topic: 'recovery' },
  { id: 'proteinFood', topic: 'nutrition' },
  { id: 'casein', topic: 'nutrition' },
  { id: 'creatine', topic: 'nutrition' },
  { id: 'deficitProtein', topic: 'nutrition' },
  { id: 'salt', topic: 'progress' },
  { id: 'glycogen', topic: 'progress' },
  { id: 'fatKcal', topic: 'progress' },
  { id: 'doubleProgression', topic: 'progress' },
  { id: 'mobility', topic: 'myth' },
  { id: 'age', topic: 'myth' },
  { id: 'spotReduction', topic: 'myth' },
  { id: 'anabolicWindow', topic: 'myth' },
  { id: 'swap', topic: 'app' },
  { id: 'plates', topic: 'app', equipment: ['gym', 'home'] },
  { id: 'kai', topic: 'app' },
] as const satisfies readonly TipDef[];

export type BuildingTip = (typeof BUILDING_TIPS)[number];
export type TipId = BuildingTip['id'];

/** At most this many tips about the app in one wait. */
const APP_TIPS_PER_WAIT = 1;
const SEEN_KEY = 'building-tips-seen';

/** A tip stays up long enough to read it: a base plus a little per character. */
export const tipMs = (text: string) => Math.max(4500, 2000 + 60 * text.length);

function shuffled<T>(items: readonly T[], random: () => number) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Reorders so no two tips in a row share a topic, where the tips allow it: the next tip of
 * another topic in the given order, unless one topic has so many left that it must go now.
 */
function spreadTopics(tips: BuildingTip[]) {
  const rest = [...tips];
  const out: BuildingTip[] = [];
  const left = (topic: TipTopic) => rest.filter((tip) => tip.topic === topic).length;
  while (rest.length) {
    const prev = out.at(-1)?.topic;
    const others = rest.filter((tip) => tip.topic !== prev);
    const most = others.reduce<BuildingTip | undefined>(
      (best, tip) => (!best || left(tip.topic) > left(best.topic) ? tip : best),
      undefined,
    );
    const forced = most && left(most.topic) * 2 >= rest.length ? most : undefined;
    const next = forced ?? others[0] ?? rest[0];
    out.push(...rest.splice(rest.indexOf(next), 1));
  }
  return out;
}

/** The tips that suit the equipment. */
const eligibleTips = (equipment: EquipmentAccess) =>
  BUILDING_TIPS.filter(
    (tip: BuildingTip) => !('equipment' in tip) || tip.equipment.some((e) => e === equipment),
  );

/**
 * The tips for one wait, in order: those not seen yet first (shuffled, topics spread, one about
 * the app at most), then the seen ones, so a long wait never runs out. `seen` holds tip ids.
 */
export function tipQueue(
  equipment: EquipmentAccess,
  seen: readonly string[],
  random: () => number = Math.random,
): BuildingTip[] {
  const eligible = eligibleTips(equipment);
  const fresh = eligible.filter((tip) => !seen.includes(tip.id));
  // All seen: the round starts over.
  const unseen = fresh.length ? fresh : eligible;
  let apps = 0;
  const first = shuffled(unseen, random).filter(
    (tip) => tip.topic !== 'app' || apps++ < APP_TIPS_PER_WAIT,
  );
  const later = shuffled(
    eligible.filter((tip) => !first.includes(tip) && tip.topic !== 'app'),
    random,
  );
  return [...spreadTopics(first), ...spreadTopics(later)];
}

/**
 * Where a wait starts in the current round, and how many tips the round has: "4 / 25" counts
 * on from the tips already seen, the first tip of a new round is 1.
 */
export function tipRound(equipment: EquipmentAccess, seen: readonly string[]) {
  const eligible = eligibleTips(equipment);
  const seenCount = eligible.filter((tip) => seen.includes(tip.id)).length;
  return { start: seenCount < eligible.length ? seenCount : 0, total: eligible.length };
}

/** The ids of the tips shown so far in this round, kept on the device. */
export function seenTips(): string[] {
  const raw = storage.getString(SEEN_KEY);
  return raw ? (JSON.parse(raw) as string[]) : [];
}

/** Remembers a tip as shown; once every tip for this equipment was, the round starts over. */
export function markTipSeen(id: TipId, equipment: EquipmentAccess) {
  const seen = new Set(seenTips()).add(id);
  const all = eligibleTips(equipment).every((tip) => seen.has(tip.id));
  storage.set(SEEN_KEY, JSON.stringify(all ? [] : [...seen]));
}

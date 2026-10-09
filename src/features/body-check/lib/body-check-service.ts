import { File } from 'expo-file-system';

import type { Profile } from '@/shared/data/profile';
import { wait } from '@/shared/lib/async';
import { clamp } from '@/shared/lib/math';

import type { StoredPhoto } from './photo-files';
import { GROUPS, POSES, type BodyGroup, type BodyPose } from './poses';

export interface CheckPhotoInput extends StoredPhoto {
  pose: BodyPose;
}

export interface BodyCheckMetrics {
  /** Estimated body fat in percent. */
  bodyFat: number;
  /** 0–100 */
  proportions: number;
  /** 0–100 */
  definition: number;
}

export type GroupScores = Record<BodyGroup, number>;

export interface BodyCheckResult {
  score: number;
  groupScores: GroupScores;
  metrics: BodyCheckMetrics;
}

export interface PreviousCheck {
  score: number;
  groupScores: Partial<GroupScores>;
  metrics: Partial<BodyCheckMetrics>;
}

export type AnalysisProfile = Pick<Profile, 'sex' | 'age' | 'weightKg' | 'heightCm' | 'experience'>;

export type PhotoIssue = 'blurry';

// Starting values of a first check, as in design 08d-A.
const BASE_GROUPS: GroupScores = {
  shoulders: 81,
  chest: 78,
  arms: 76,
  back: 70,
  core: 68,
  legs: 61,
};
const BASE_METRICS: BodyCheckMetrics = { bodyFat: 15, proportions: 88, definition: 66 };
const EXPERIENCE_OFFSET = { none: -6, beginner: -3, intermediate: 0, advanced: 4 } as const;
const MAX_SCORE = 98;
const MOCK_LATENCY_MS = 1500;

/** Overall score: muscle groups weigh 60 %, proportions and definition 20 % each. */
function overallScore(groups: GroupScores, metrics: BodyCheckMetrics) {
  const mean = GROUPS.reduce((sum, g) => sum + groups[g], 0) / GROUPS.length;
  return Math.round(
    clamp(0.6 * mean + 0.2 * metrics.proportions + 0.2 * metrics.definition, 0, 100),
  );
}

function firstCheck(profile: AnalysisProfile | null): Omit<BodyCheckResult, 'score'> {
  const offset = EXPERIENCE_OFFSET[profile?.experience ?? 'intermediate'];
  const groupScores = { ...BASE_GROUPS };
  for (const g of GROUPS) groupScores[g] = clamp(BASE_GROUPS[g] + offset, 20, MAX_SCORE);
  let bodyFat = profile?.sex === 'female' ? BASE_METRICS.bodyFat + 8 : BASE_METRICS.bodyFat;
  if (profile?.weightKg && profile.heightCm) {
    const bmi = profile.weightKg / (profile.heightCm / 100) ** 2;
    bodyFat += clamp((bmi - 24) * 1.2, -3, 10);
  }
  if ((profile?.age ?? 0) > 40) bodyFat += 2;
  return {
    groupScores,
    metrics: {
      bodyFat: Math.round(bodyFat * 10) / 10,
      proportions: BASE_METRICS.proportions,
      definition: clamp(BASE_METRICS.definition + offset, 20, MAX_SCORE),
    },
  };
}

/** A follow-up check improves slightly on the previous one (deterministic). */
function nextCheck(previous: PreviousCheck): Omit<BodyCheckResult, 'score'> {
  const groupScores = { ...BASE_GROUPS };
  GROUPS.forEach((g, i) => {
    const before = previous.groupScores[g] ?? BASE_GROUPS[g];
    groupScores[g] = Math.min(MAX_SCORE, before + 1 + ((i + previous.score) % 3));
  });
  const m = { ...BASE_METRICS, ...previous.metrics };
  return {
    groupScores,
    metrics: {
      bodyFat: Math.max(6, Math.round((m.bodyFat - 0.5) * 10) / 10),
      proportions: Math.min(MAX_SCORE, m.proportions + 1),
      definition: Math.min(MAX_SCORE, m.definition + 2),
    },
  };
}

/**
 * Scores a body check from its four photos. MOCKED: values are derived from the
 * profile and the previous check, not from the images. Replace the body with a
 * call to an Edge Function that receives the photos and returns the same shape.
 */
export async function analyzeBodyCheck(
  photos: CheckPhotoInput[],
  profile: AnalysisProfile | null,
  previous: PreviousCheck | null,
): Promise<BodyCheckResult> {
  if (POSES.some((pose) => !photos.some((p) => p.pose === pose))) {
    throw new Error('A body check needs one photo per pose');
  }
  await wait(MOCK_LATENCY_MS);
  const { groupScores, metrics } = previous ? nextCheck(previous) : firstCheck(profile);
  return { score: overallScore(groupScores, metrics), groupScores, metrics };
}

// JPEG bytes per pixel below this mean little detail (blur, darkness) at our quality.
const MIN_BYTES_PER_PIXEL = 0.035;

/**
 * Quick on-device quality check of a stored shot. Heuristic stand-in: very small
 * JPEGs for their size are usually blurry or too dark. Replace with a real check.
 */
export function assessPhoto(photo: StoredPhoto): PhotoIssue | null {
  try {
    const bytes = new File(photo.uri).size;
    return bytes / (photo.width * photo.height) < MIN_BYTES_PER_PIXEL ? 'blurry' : null;
  } catch {
    return null;
  }
}

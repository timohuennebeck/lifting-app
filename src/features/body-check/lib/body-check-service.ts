import { FunctionsFetchError, FunctionsHttpError } from '@supabase/supabase-js';
import { File } from 'expo-file-system';

import { supabase } from '@/shared/data/supabase';
import { uploadJpeg } from '@/shared/data/supabase-storage';

import { PHOTO_BUCKET, type StoredPhoto, storagePathOf } from './photo-files';
import { POSES, type BodyGroup, type BodyPose } from './poses';

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

/** Why a photo can't be used: the on-device check finds blur, the analysis the rest. */
export type PhotoIssue = 'blurry' | 'dark' | 'notFullBody' | 'wrongPose' | 'noPerson' | 'clothing';

export interface PhotoRejection {
  pose: BodyPose;
  issue: PhotoIssue;
}

export type AnalysisOutcome =
  | { status: 'ok'; result: BodyCheckResult }
  /** The analysis could not judge these photos; nothing was scored. */
  | { status: 'retake'; issues: PhotoRejection[] };

export type AnalysisFailure = 'offline' | 'limit' | 'notAdult' | 'refused' | 'failed';

export class AnalysisError extends Error {
  constructor(readonly reason: AnalysisFailure) {
    super(`Body-check analysis failed: ${reason}`);
  }
}

const SERVER_ISSUES: Record<string, PhotoIssue> = {
  blurry: 'blurry',
  dark: 'dark',
  not_full_body: 'notFullBody',
  wrong_pose: 'wrongPose',
  no_person: 'noPerson',
  clothing: 'clothing',
};

const SERVER_ERRORS: Record<string, AnalysisFailure> = {
  limit: 'limit',
  not_adult: 'notAdult',
  refused: 'refused',
};

interface ServerAnalysis {
  status: 'ok' | 'retake';
  result?: BodyCheckResult;
  issues?: { pose: BodyPose; issue: string }[];
}

function errorCode(text: string): string | undefined {
  try {
    return JSON.parse(text)?.error;
  } catch {
    return undefined;
  }
}

async function failureOf(error: unknown): Promise<AnalysisFailure> {
  if (error instanceof FunctionsFetchError) return 'offline';
  if (error instanceof FunctionsHttpError) {
    const response = error.context as Response;
    const text = await response.text().catch(() => '');
    // Names the answer in the app's log; the function's own log has the details.
    console.warn(`analyze-body-check answered ${response.status}: ${text.slice(0, 300)}`);
    return SERVER_ERRORS[errorCode(text) ?? ''] ?? 'failed';
  }
  console.warn('analyze-body-check could not be called', error);
  return 'failed';
}

/** Puts the photos where the analysis reads them (and where the saved check keeps them). */
async function uploadPhotos(
  checkId: string,
  userId: string,
  photos: Record<BodyPose, StoredPhoto>,
) {
  try {
    await Promise.all(
      POSES.map((pose) =>
        uploadJpeg(PHOTO_BUCKET, storagePathOf(userId, checkId, pose), new File(photos[pose].uri)),
      ),
    );
  } catch (error) {
    console.warn('Uploading the body-check photos failed', error);
    throw new AnalysisError('offline');
  }
}

/** Removes a check's photos from storage; best effort, offline they stay. */
export function removeUploadedPhotos(checkId: string, userId: string) {
  void supabase.storage
    .from(PHOTO_BUCKET)
    .remove(POSES.map((pose) => storagePathOf(userId, checkId, pose)));
}

/**
 * Uploads the three photos and has the analyze-body-check Edge Function score them. Needs a
 * connection; throws an AnalysisError with the reason otherwise.
 */
export async function analyzeBodyCheck(
  checkId: string,
  userId: string,
  photos: Record<BodyPose, StoredPhoto>,
): Promise<AnalysisOutcome> {
  await uploadPhotos(checkId, userId, photos);
  const { data, error } = await supabase.functions.invoke<ServerAnalysis>('analyze-body-check', {
    body: { checkId },
  });
  if (error) throw new AnalysisError(await failureOf(error));
  if (data?.status === 'ok' && data.result) return { status: 'ok', result: data.result };
  if (data?.status === 'retake' && data.issues?.length) {
    return {
      status: 'retake',
      issues: data.issues.map((i) => ({ pose: i.pose, issue: SERVER_ISSUES[i.issue] ?? 'blurry' })),
    };
  }
  throw new AnalysisError('failed');
}

// JPEG bytes per pixel below this mean little detail (blur, darkness) at our quality.
const MIN_BYTES_PER_PIXEL = 0.035;

/**
 * Quick on-device check of a stored shot before anything is uploaded: very small JPEGs for
 * their size are usually blurry or too dark. The analysis judges the photos properly.
 */
export function assessPhoto(photo: StoredPhoto): PhotoIssue | null {
  try {
    const bytes = new File(photo.uri).size;
    return bytes / (photo.width * photo.height) < MIN_BYTES_PER_PIXEL ? 'blurry' : null;
  } catch {
    return null;
  }
}

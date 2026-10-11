import { FunctionsFetchError, FunctionsHttpError } from '@supabase/supabase-js';
import { File } from 'expo-file-system';

import { db } from '@/shared/data/powersync/database';
import { supabase } from '@/shared/data/supabase';
import { uploadJpeg } from '@/shared/data/supabase-storage';
import { wait } from '@/shared/lib/async';
import { averageBrightness } from '@/shared/lib/jpeg';

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

/** Why a photo can't be used: the on-device check finds darkness and blur, the analysis the rest. */
export type PhotoIssue = 'blurry' | 'dark' | 'notFullBody' | 'wrongPose' | 'noPerson' | 'clothing';

export interface PhotoRejection {
  pose: BodyPose;
  issue: PhotoIssue;
}

export type AnalysisOutcome =
  | { status: 'ok'; result: BodyCheckResult }
  /** The analysis could not judge these photos; nothing was scored. */
  | { status: 'retake'; issues: PhotoRejection[] };

export type AnalysisFailure = 'offline' | 'limit' | 'notAdult' | 'notPro' | 'refused' | 'failed';

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
  not_pro: 'notPro',
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

/**
 * Removes a check's photos from storage: every file in its folder, so a check from the four-pose
 * days loses its left and right photos too. Best effort; offline they stay.
 */
export function removeUploadedPhotos(checkId: string, userId: string) {
  const bucket = supabase.storage.from(PHOTO_BUCKET);
  const folder = `${userId}/${checkId}`;
  void bucket
    .list(folder)
    .then(({ data }) => {
      const paths = (data ?? []).map((file) => `${folder}/${file.name}`);
      return paths.length ? bucket.remove(paths) : null;
    })
    .catch((error) => console.warn('Removing body-check photos failed', error));
}

/** How long the analysis waits for a profile change to reach the server. */
const PROFILE_UPLOAD_TIMEOUT_MS = 30_000;

/**
 * Waits (bounded) until no profile change is left in PowerSync's upload queue, since the analysis
 * checks the birth date on the server: right after sign-up the profile is still on its way there,
 * behind the onboarding plan. False when one is still waiting.
 */
async function profileUploaded() {
  const deadline = Date.now() + PROFILE_UPLOAD_TIMEOUT_MS;
  try {
    while (
      await db.getOptional(
        "SELECT 1 FROM ps_crud WHERE json_extract(data, '$.type') = 'profiles' LIMIT 1",
      )
    ) {
      if (Date.now() >= deadline) return false;
      await wait(500);
    }
  } catch (error) {
    console.warn('Reading the upload queue failed', error);
  }
  return true;
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
  const profileSynced = await profileUploaded();
  const { data, error } = await supabase.functions.invoke<ServerAnalysis>('analyze-body-check', {
    body: { checkId },
  });
  if (error) {
    const reason = await failureOf(error);
    // The server may not have the birth date yet: worth another try, not the 18+ message.
    throw new AnalysisError(reason === 'notAdult' && !profileSynced ? 'failed' : reason);
  }
  if (data?.status === 'ok' && data.result) return { status: 'ok', result: data.result };
  if (data?.status === 'retake' && data.issues?.length) {
    return {
      status: 'retake',
      issues: data.issues.map((i) => ({ pose: i.pose, issue: SERVER_ISSUES[i.issue] ?? 'blurry' })),
    };
  }
  throw new AnalysisError('failed');
}

// Average brightness (0–255) of the whole shot below which it's too dark. Measured on the
// whole frame, not the person: the camera exposes for the whole frame, so it only stays this
// dark when there isn't enough light, whatever the skin tone or clothes. Backlight is left to
// the analysis.
const MIN_BRIGHTNESS = 45;
// JPEG bytes per pixel below this mean little detail (usually blur) at our quality.
const MIN_BYTES_PER_PIXEL = 0.035;

async function isDark(photo: StoredPhoto) {
  try {
    return (await averageBrightness(photo.uri)) < MIN_BRIGHTNESS;
  } catch (error) {
    console.warn('Measuring the photo brightness failed', error);
    return false;
  }
}

function isBlurry(photo: StoredPhoto) {
  try {
    return new File(photo.uri).size / (photo.width * photo.height) < MIN_BYTES_PER_PIXEL;
  } catch {
    return false;
  }
}

/**
 * Quick on-device check of a stored shot before anything is uploaded: too dark, or so little
 * detail that it's probably blurry. The analysis judges the photos properly.
 */
export async function assessPhoto(photo: StoredPhoto): Promise<PhotoIssue | null> {
  if (await isDark(photo)) return 'dark';
  return isBlurry(photo) ? 'blurry' : null;
}

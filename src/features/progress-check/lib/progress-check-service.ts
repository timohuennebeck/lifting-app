import { FunctionsFetchError, FunctionsHttpError } from '@supabase/supabase-js';
import { File } from 'expo-file-system';

import { db } from '@/shared/data/powersync/database';
import { supabase } from '@/shared/data/supabase';
import { uploadJpeg } from '@/shared/data/supabase-storage';
import { wait } from '@/shared/lib/async';
import { averageBrightness } from '@/shared/lib/jpeg';

import { PHOTO_BUCKET, type StoredPhoto, storagePathOf } from './photo-files';
import { POSES, type CheckGroup, type Pose } from './poses';

export interface ProgressCheckMetrics {
  /** Estimated body fat in percent. */
  bodyFat: number;
  /** 0–100 */
  proportions: number;
  /** 0–100 */
  definition: number;
}

export type GroupScores = Record<CheckGroup, number>;

export interface ProgressCheckResult {
  score: number;
  groupScores: GroupScores;
  metrics: ProgressCheckMetrics;
}

/** Why a photo can't be used: the device finds darkness and blur, the assessment the rest. */
export type PhotoIssue = 'blurry' | 'dark' | 'notFullBody' | 'wrongPose' | 'noPerson' | 'clothing';

export interface PhotoRejection {
  pose: Pose;
  issue: PhotoIssue;
}

type AssessmentOutcome =
  | { status: 'ok'; result: ProgressCheckResult }
  /** The assessment could not judge these photos; nothing was scored. */
  | { status: 'retake'; issues: PhotoRejection[] };

type AssessmentFailure = 'offline' | 'limit' | 'notAdult' | 'notPro' | 'refused' | 'failed';

export class AssessmentError extends Error {
  constructor(readonly reason: AssessmentFailure) {
    super(`Progress-check assessment failed: ${reason}`);
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

const SERVER_ERRORS: Record<string, AssessmentFailure> = {
  limit: 'limit',
  not_adult: 'notAdult',
  not_pro: 'notPro',
  refused: 'refused',
};

interface ServerAssessment {
  status: 'ok' | 'retake';
  result?: ProgressCheckResult;
  issues?: { pose: Pose; issue: string }[];
}

function errorCode(text: string): string | undefined {
  try {
    return JSON.parse(text)?.error;
  } catch {
    return undefined;
  }
}

async function failureOf(error: unknown): Promise<AssessmentFailure> {
  if (error instanceof FunctionsFetchError) return 'offline';
  if (error instanceof FunctionsHttpError) {
    const response = error.context as Response;
    const text = await response.text().catch(() => '');
    // Names the answer in the app's log; the function's own log has the details.
    console.warn(`assess-progress answered ${response.status}: ${text.slice(0, 300)}`);
    return SERVER_ERRORS[errorCode(text) ?? ''] ?? 'failed';
  }
  console.warn('assess-progress could not be called', error);
  return 'failed';
}

/** Puts the photos where the assessment reads them (and where the saved check keeps them). */
async function uploadPhotos(checkId: string, userId: string, photos: Record<Pose, StoredPhoto>) {
  try {
    await Promise.all(
      POSES.map((pose) =>
        uploadJpeg(PHOTO_BUCKET, storagePathOf(userId, checkId, pose), new File(photos[pose].uri)),
      ),
    );
  } catch (error) {
    console.warn('Uploading the progress-check photos failed', error);
    throw new AssessmentError('offline');
  }
}

/** Removes a check's photos from storage. Best effort; offline they stay. */
export function removeUploadedPhotos(checkId: string, userId: string) {
  void supabase.storage
    .from(PHOTO_BUCKET)
    .remove(POSES.map((pose) => storagePathOf(userId, checkId, pose)))
    .then(({ error }) => {
      if (error) throw error;
    })
    .catch((error) => console.warn('Removing progress-check photos failed', error));
}

/** How long the assessment waits for a profile change to reach the server. */
const PROFILE_UPLOAD_TIMEOUT_MS = 30_000;

/**
 * Waits (bounded) until no profile change is left in PowerSync's upload queue, since the assessment
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
 * Uploads the three photos and has the assess-progress Edge Function score them. Needs a
 * connection; throws an AssessmentError with the reason otherwise.
 */
export async function assessProgress(
  checkId: string,
  userId: string,
  photos: Record<Pose, StoredPhoto>,
): Promise<AssessmentOutcome> {
  await uploadPhotos(checkId, userId, photos);
  const profileSynced = await profileUploaded();
  const { data, error } = await supabase.functions.invoke<ServerAssessment>('assess-progress', {
    body: { checkId },
  });
  if (error) {
    const reason = await failureOf(error);
    // The server may not have the birth date yet: worth another try, not the 18+ message.
    throw new AssessmentError(reason === 'notAdult' && !profileSynced ? 'failed' : reason);
  }
  if (data?.status === 'ok' && data.result) return { status: 'ok', result: data.result };
  if (data?.status === 'retake' && data.issues?.length) {
    return {
      status: 'retake',
      issues: data.issues.map((i) => ({ pose: i.pose, issue: SERVER_ISSUES[i.issue] ?? 'blurry' })),
    };
  }
  throw new AssessmentError('failed');
}

// Average brightness (0–255) of the whole shot below which it's too dark. Measured on the
// whole frame, not the person: the camera exposes for the whole frame, so it only stays this
// dark when there isn't enough light, whatever the skin tone or clothes. Backlight is left to
// the assessment.
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
 * detail that it's probably blurry. The assessment judges the photos properly.
 */
export async function assessPhoto(photo: StoredPhoto): Promise<PhotoIssue | null> {
  if (await isDark(photo)) return 'dark';
  return isBlurry(photo) ? 'blurry' : null;
}

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { newId } from '@/shared/data/json';
import { mmkvStorage } from '@/shared/lib/storage';
import { useSessionStore } from '@/shared/stores/session-store';

import {
  type ProgressCheckResult,
  type PhotoIssue,
  type PhotoRejection,
  removeUploadedPhotos,
} from '../lib/progress-check-service';
import {
  deleteAbandonedDrafts,
  deleteDrafts,
  deleteFile,
  type StoredPhoto,
} from '../lib/photo-files';
import { nextMissingPose, POSES, TIMER_STEPS, type Pose, type TimerSeconds } from '../lib/poses';

export interface Shot extends StoredPhoto {
  issue: PhotoIssue | null;
  /** The assessment could not judge this photo: it has to be retaken. */
  rejected?: boolean;
}

type CameraFacing = 'front' | 'back';
export type Shots = Partial<Record<Pose, Shot>>;

/** Whether every pose has its photo. */
export const hasAllShots = (shots: Shots): shots is Record<Pose, Shot> =>
  POSES.every((pose) => shots[pose]);

interface ProgressCheckState {
  /** Id of the check being recorded; also names its photo folder. */
  checkId: string | null;
  shots: Shots;
  /** Pose the camera is shooting. */
  pose: Pose;
  /** Pose whose photo the camera shows full screen; null while shooting. */
  viewPose: Pose | null;
  /** Retaking one photo: once taken, the camera shows it instead of moving on. */
  retaking: boolean;
  /** The photos were uploaded for an assessment (and are removed if the check is discarded). */
  uploaded: boolean;
  result: ProgressCheckResult | null;
  /** Persisted camera preferences. */
  timer: TimerSeconds;
  /** One shutter tap takes every photo: each one starts the next pose's countdown. */
  auto: boolean;
  facing: CameraFacing;
  start: () => void;
  setPose: (pose: Pose) => void;
  addShot: (pose: Pose, shot: Shot) => void;
  /** Shows a taken photo full screen, or (null) goes back to shooting. */
  view: (pose: Pose | null) => void;
  retake: (pose: Pose) => void;
  /** Drops a taken photo; the camera shoots that pose next. */
  removeShot: (pose: Pose) => void;
  setUploaded: () => void;
  /** Marks the photos the assessment rejected and shows the first of them. */
  rejectShots: (rejections: PhotoRejection[]) => void;
  setResult: (result: ProgressCheckResult) => void;
  cycleTimer: () => void;
  toggleAuto: () => void;
  toggleFacing: () => void;
  /** Drops the draft and deletes its photos. */
  discard: () => void;
  /** Forgets the draft after it was saved (files stay). */
  clear: () => void;
}

const EMPTY = {
  checkId: null,
  shots: {},
  pose: 'front',
  viewPose: null,
  retaking: false,
  uploaded: false,
  result: null,
} as const;

/** Removes a discarded check's uploaded photos. */
function removeUploads(checkId: string) {
  const userId = useSessionStore.getState().session?.user.id;
  if (userId) removeUploadedPhotos(checkId, userId);
}

/** Draft of the running progress check plus the camera's timer, auto and lens preferences. */
export const useProgressCheckStore = create<ProgressCheckState>()(
  persist(
    (set, get) => ({
      ...EMPTY,
      timer: TIMER_STEPS[0],
      auto: false,
      facing: 'front',
      start: () => {
        get().discard();
        const checkId = newId();
        set({ checkId });
        deleteAbandonedDrafts(checkId);
      },
      // Shooting another pose ends a retake and leaves a photo shown full screen.
      setPose: (pose) => set({ pose, retaking: false, viewPose: null }),
      addShot: (pose, shot) => {
        const s = get();
        const replaced = s.shots[pose];
        if (replaced) deleteFile(replaced.uri);
        const shots = { ...s.shots, [pose]: shot };
        set({
          shots,
          result: null,
          retaking: false,
          pose: nextMissingPose(shots, pose) ?? pose,
          viewPose: s.retaking ? pose : s.viewPose,
        });
      },
      view: (viewPose) => set({ viewPose }),
      retake: (pose) => set({ pose, retaking: true, viewPose: null }),
      removeShot: (pose) => {
        const s = get();
        const removed = s.shots[pose];
        if (!removed) return;
        deleteFile(removed.uri);
        const shots = { ...s.shots };
        delete shots[pose];
        // Another photo shown full screen stays; the removed one goes back to the camera.
        set({
          shots,
          result: null,
          retaking: false,
          pose,
          viewPose: s.viewPose === pose ? null : s.viewPose,
        });
      },
      setUploaded: () => set({ uploaded: true }),
      rejectShots: (rejections) => {
        const shots = { ...get().shots };
        for (const { pose, issue } of rejections) {
          const shot = shots[pose];
          if (shot) shots[pose] = { ...shot, issue, rejected: true };
        }
        set({ shots, viewPose: rejections[0]?.pose ?? null });
      },
      setResult: (result) => set({ result }),
      // Auto needs a countdown to turn to the next pose: no timer means no auto, and turning
      // auto on brings the shortest timer back.
      cycleTimer: () =>
        set((s) => {
          const timer = TIMER_STEPS[(TIMER_STEPS.indexOf(s.timer) + 1) % TIMER_STEPS.length];
          return { timer, auto: s.auto && timer > 0 };
        }),
      toggleAuto: () =>
        set((s) => (s.auto ? { auto: false } : { auto: true, timer: s.timer || TIMER_STEPS[0] })),
      toggleFacing: () => set((s) => ({ facing: s.facing === 'front' ? 'back' : 'front' })),
      discard: () => {
        const { checkId, uploaded } = get();
        if (checkId) deleteDrafts(checkId);
        if (checkId && uploaded) removeUploads(checkId);
        set(EMPTY);
      },
      clear: () => set(EMPTY),
    }),
    {
      name: 'progress-check-camera',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (s) => ({ timer: s.timer, auto: s.auto, facing: s.facing }),
    },
  ),
);

/** Starts a fresh check; call before opening the camera. */
export const startProgressCheck = () => useProgressCheckStore.getState().start();

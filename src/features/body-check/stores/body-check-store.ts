import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { newId } from '@/shared/data/json';
import { mmkvStorage } from '@/shared/lib/storage';
import { useSessionStore } from '@/shared/stores/session-store';

import {
  type BodyCheckResult,
  type PhotoIssue,
  type PhotoRejection,
  removeUploadedPhotos,
} from '../lib/body-check-service';
import {
  deleteAbandonedDrafts,
  deleteDrafts,
  deleteFile,
  type StoredPhoto,
} from '../lib/photo-files';
import {
  nextMissingPose,
  POSES,
  TIMER_STEPS,
  type BodyPose,
  type TimerSeconds,
} from '../lib/poses';

export interface Shot extends StoredPhoto {
  issue: PhotoIssue | null;
  /** The analysis could not judge this photo: it has to be retaken. */
  rejected?: boolean;
}

export type CameraFacing = 'front' | 'back';
export type Shots = Partial<Record<BodyPose, Shot>>;

/** Whether every pose has its photo. */
export const hasAllShots = (shots: Shots): shots is Record<BodyPose, Shot> =>
  POSES.every((pose) => shots[pose]);

interface BodyCheckState {
  /** Id of the check being recorded; also names its photo folder. */
  checkId: string | null;
  shots: Shots;
  /** Pose the camera is shooting. */
  pose: BodyPose;
  /** Pose whose photo the camera shows full screen; null while shooting. */
  viewPose: BodyPose | null;
  /** Retaking one photo: once taken, the camera shows it instead of moving on. */
  retaking: boolean;
  /** The photos were uploaded for an analysis (and are removed if the check is discarded). */
  uploaded: boolean;
  result: BodyCheckResult | null;
  /** Persisted camera preferences. */
  timer: TimerSeconds;
  /** One shutter tap takes every photo: each one starts the next pose's countdown. */
  auto: boolean;
  facing: CameraFacing;
  start: () => void;
  setPose: (pose: BodyPose) => void;
  addShot: (pose: BodyPose, shot: Shot) => void;
  /** Shows a taken photo full screen, or (null) goes back to shooting. */
  view: (pose: BodyPose | null) => void;
  retake: (pose: BodyPose) => void;
  setUploaded: () => void;
  /** Marks the photos the analysis rejected and shows the first of them. */
  rejectShots: (rejections: PhotoRejection[]) => void;
  setResult: (result: BodyCheckResult) => void;
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

/** Draft of the running body check plus the camera's timer, auto and lens preferences. */
export const useBodyCheckStore = create<BodyCheckState>()(
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
      name: 'body-check-camera',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (s) => ({ timer: s.timer, auto: s.auto, facing: s.facing }),
    },
  ),
);

/** Starts a fresh check; call before opening the camera. */
export const startBodyCheck = () => useBodyCheckStore.getState().start();

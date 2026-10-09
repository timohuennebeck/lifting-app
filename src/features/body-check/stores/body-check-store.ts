import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { newId } from '@/shared/data/json';
import { zustandStorage } from '@/shared/lib/storage';

import type { BodyCheckResult, PhotoIssue } from '../lib/body-check-service';
import {
  deleteAbandonedDrafts,
  deleteDrafts,
  deleteFile,
  type StoredPhoto,
} from '../lib/photo-files';
import { nextMissingPose, TIMER_STEPS, type BodyPose, type TimerSeconds } from '../lib/poses';

export interface Shot extends StoredPhoto {
  issue: PhotoIssue | null;
}

export type CameraFacing = 'front' | 'back';
export type Shots = Partial<Record<BodyPose, Shot>>;

interface BodyCheckState {
  /** Id of the check being recorded; also names its photo folder. */
  checkId: string | null;
  shots: Shots;
  /** Pose the camera is shooting. */
  pose: BodyPose;
  /** Pose picked on the review screen; null until the user picks one. */
  reviewPose: BodyPose | null;
  /** The camera was opened from the review screen to replace one photo. */
  retaking: boolean;
  result: BodyCheckResult | null;
  /** Persisted camera preferences. */
  timer: TimerSeconds;
  facing: CameraFacing;
  start: () => void;
  setPose: (pose: BodyPose) => void;
  addShot: (pose: BodyPose, shot: Shot) => void;
  selectReviewPose: (pose: BodyPose) => void;
  retake: (pose: BodyPose) => void;
  setResult: (result: BodyCheckResult) => void;
  cycleTimer: () => void;
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
  reviewPose: null,
  retaking: false,
  result: null,
} as const;

/** Draft of the running body check plus the camera's timer and lens preferences. */
export const useBodyCheckStore = create<BodyCheckState>()(
  persist(
    (set, get) => ({
      ...EMPTY,
      timer: TIMER_STEPS[0],
      facing: 'front',
      start: () => {
        get().discard();
        const checkId = newId();
        set({ checkId });
        deleteAbandonedDrafts(checkId);
      },
      setPose: (pose) => set({ pose }),
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
          reviewPose: s.retaking ? pose : s.reviewPose,
        });
      },
      selectReviewPose: (reviewPose) => set({ reviewPose }),
      retake: (pose) => set({ pose, retaking: true }),
      setResult: (result) => set({ result }),
      cycleTimer: () =>
        set((s) => ({
          timer: TIMER_STEPS[(TIMER_STEPS.indexOf(s.timer) + 1) % TIMER_STEPS.length],
        })),
      toggleFacing: () => set((s) => ({ facing: s.facing === 'front' ? 'back' : 'front' })),
      discard: () => {
        const { checkId } = get();
        if (checkId) deleteDrafts(checkId);
        set(EMPTY);
      },
      clear: () => set(EMPTY),
    }),
    {
      name: 'body-check-camera',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (s) => ({ timer: s.timer, facing: s.facing }),
    },
  ),
);

/** Starts a fresh check; call before opening the camera. */
export const startBodyCheck = () => useBodyCheckStore.getState().start();

import { router } from 'expo-router';
import { createContext, type ReactNode, useContext, useRef } from 'react';

import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import { useImportStore } from '@/features/plan-import/stores/import-store';
import type { Profile, ProfilePatch } from '@/shared/data/profile';
import type { PlanDraft } from '@/shared/data/templates';
import { haptics } from '@/shared/lib/haptics';
import { requireUserId } from '@/shared/stores/session-store';

import { saveActivePlan } from '../data/save-plan';

/** The flow's steps where onboarding has them; the app has the same under /plan. */
type PlanStep =
  | '/has-plan'
  | '/import'
  | '/import/options'
  | '/import/sheets'
  | '/import/camera'
  | '/import/review'
  | '/import/reading'
  | '/import/confirm'
  | '/import/picker'
  | '/create/goal'
  | '/create/focus'
  | '/create/equipment'
  | '/create/home-equipment'
  | '/create/days'
  | '/create/duration'
  | '/create/building'
  | '/create/plan-name';

const InAppContext = createContext(false);

/** Marks the plan flow's screens as opened from the app (Training → "Programm erstellen"). */
export function InAppPlanFlow({ children }: { children: ReactNode }) {
  return <InAppContext value>{children}</InAppContext>;
}

/**
 * Opens the plan flow from the app: a fresh import, and the profile's answers as the generator's
 * starting point (the onboarding draft holds the flow's answers, as in onboarding).
 */
export function openPlanFlow(profile: Profile | null | undefined) {
  useImportStore.getState().reset();
  useOnboardingStore.getState().update({
    plan: null,
    customExercises: [],
    ...(profile && {
      experience: profile.experience,
      goal: profile.goal,
      focus: profile.focus,
      equipment: profile.equipment,
      homeEquipment: profile.homeEquipment,
      trainingDays: profile.trainingDays,
      ...(profile.sessionMinutes ? { sessionMinutes: profile.sessionMinutes } : {}),
    }),
  });
  router.push('/plan/has-plan');
}

/**
 * The plan flow (has a plan? → import or create) runs in onboarding and in the app. Its screens
 * go to the next step with `step`, and hand over the plan with `finish`: onboarding goes on to
 * its promise, the app saves it as the plan Today follows and returns to Training. A plan made
 * from the answers hands them over too: the app keeps them in the profile, so the next plan
 * starts from them (onboarding saves the whole draft at sign-up).
 */
export function usePlanFlow() {
  const inApp = useContext(InAppContext);
  const saving = useRef(false);

  const step = <S extends PlanStep>(path: S) => (inApp ? (`/plan${path}` as const) : path);

  async function finish(plan: PlanDraft, answers?: ProfilePatch) {
    const { draft, update } = useOnboardingStore.getState();
    if (!inApp) {
      update({ plan });
      router.push('/promise');
      return;
    }
    if (saving.current) return;
    saving.current = true;
    try {
      await saveActivePlan(requireUserId(), plan, draft.customExercises, answers);
      haptics.success();
      router.dismissTo('/training');
    } catch (error) {
      console.warn('Saving the plan failed', error);
      haptics.error();
    }
    saving.current = false;
  }

  return { inApp, step, finish };
}

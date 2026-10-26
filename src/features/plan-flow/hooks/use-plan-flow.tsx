import { router } from 'expo-router';
import { createContext, type ReactNode, useContext, useRef } from 'react';

import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import type { ImportedPlan } from '@/features/plan-import/lib/plan-import-service';
import { useImportStore } from '@/features/plan-import/stores/import-store';
import type { Profile, ProfilePatch } from '@/shared/data/profile';
import { clampSessions, type PlanDraft } from '@/shared/data/plans';
import { attempt, singleFlight } from '@/shared/lib/async';
import { haptics } from '@/shared/lib/haptics';
import { requireUserId } from '@/shared/stores/session-store';

import { loadPlanForEditing, savePlanEdits } from '../data/plan-edits';
import { saveActivePlan } from '../data/save-plan';

/** The flow's steps where onboarding has them; the app has the same under /plan. */
type PlanStep =
  | '/has-plan'
  | '/import'
  | '/import/options'
  | '/import/sheets'
  | '/import/camera'
  | '/import/voice'
  | '/import/review'
  | '/import/reading'
  | '/import/confirm'
  | '/import/picker'
  | '/import/sets'
  | '/create/goal'
  | '/create/focus'
  | '/create/equipment'
  | '/create/home-equipment'
  | '/create/sessions'
  | '/create/split'
  | '/create/duration'
  | '/create/building'
  | '/create/plan-name';

const InAppContext = createContext(false);

/** Marks the plan flow's screens as opened from the app (the "+" sheet or Training). */
export function InAppPlanFlow({ children }: { children: ReactNode }) {
  return <InAppContext value>{children}</InAppContext>;
}

/**
 * Opens the plan flow from the app: a fresh import, and the profile's answers (with the current
 * plan's workouts per week) as the AI's starting point. The onboarding draft holds the flow's
 * answers, as in onboarding.
 */
export function openPlanFlow(profile: Profile | null | undefined, sessionsPerWeek?: number) {
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
      ...(profile.sessionMinutes ? { sessionMinutes: profile.sessionMinutes } : {}),
      split: profile.split,
    }),
    ...(sessionsPerWeek ? { sessionsPerWeek: clampSessions(sessionsPerWeek) } : {}),
  });
  router.push('/plan/has-plan');
}

/**
 * Opens saved plan `planId` ("Bearbeiten" on Training) in the editor a new plan ends in
 * (ConfirmScreen): its workouts can be changed, moved and added to, and saving writes them back
 * to it (`usePlanFlow().saveEdits`).
 */
export function openPlanEditor(planId: string) {
  return singleFlight('plan-editor', () =>
    attempt('Opening the plan failed', async () => {
      const plan = await loadPlanForEditing(planId);
      if (!plan) return;
      useImportStore.getState().editSaved(planId, plan);
      router.push('/plan/import/confirm');
    }),
  );
}

/**
 * The plan flow (has a plan? → import or create) runs in onboarding and in the app. Its screens
 * go to the next step with `step`, and hand over the plan with `finish`: onboarding goes on to
 * its promise, the app saves it as the plan Training follows and returns to the Training tab. A
 * plan made from the answers hands them over too: the app keeps them in the profile, so the next
 * plan starts from them (onboarding saves the whole draft at sign-up). A saved plan opened in the
 * editor (`openPlanEditor`) is written back with `saveEdits`.
 */
export function usePlanFlow() {
  const inApp = useContext(InAppContext);
  const saving = useRef(false);

  const step = <S extends PlanStep>(path: S) => (inApp ? (`/plan${path}` as const) : path);

  // One save at a time; once saved, back to the Training tab.
  async function saveAndLeave(task: () => Promise<unknown>) {
    if (saving.current) return;
    saving.current = true;
    const saved = await attempt('Saving the plan failed', task);
    if (saved) {
      haptics.success();
      router.dismissTo('/');
    }
    saving.current = false;
  }

  async function finish(plan: PlanDraft, answers?: ProfilePatch) {
    const { draft, update } = useOnboardingStore.getState();
    if (!inApp) {
      update({ plan });
      router.push('/promise');
      return;
    }
    await saveAndLeave(() => saveActivePlan(requireUserId(), plan, draft.customExercises, answers));
  }

  const saveEdits = (planId: string, plan: ImportedPlan) =>
    saveAndLeave(() => savePlanEdits(requireUserId(), planId, plan));

  return { inApp, step, finish, saveEdits };
}

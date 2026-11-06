import { router } from 'expo-router';
import { createContext, type ReactNode, useContext, useRef } from 'react';

import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import type { ImportedPlan } from '@/features/plan-import/lib/plan-import-service';
import { useImportStore } from '@/features/plan-import/stores/import-store';
import { useWorkoutImportStore } from '@/features/workout-import/stores/workout-import-store';
import type { Profile, ProfilePatch } from '@/shared/data/profile';
import type { PlanDraft } from '@/shared/data/plans';
import { newId } from '@/shared/data/json';
import { i18n } from '@/shared/i18n';
import { attempt, singleFlight } from '@/shared/lib/async';
import { haptics } from '@/shared/lib/haptics';
import { requireUserId } from '@/shared/stores/session-store';

import { loadPlanForEditing, savePlanEdits } from '../data/plan-edits';
import { saveActivePlan } from '../data/save-plan';

/** The flow's steps where onboarding has them; the app has the same under /plan. */
type PlanStep =
  | '/import'
  | '/import/file'
  | '/import/sheets'
  | '/import/reading'
  | '/import/found'
  | '/import/check'
  | '/import/dates'
  | '/import/imported'
  | '/import/voice'
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

/** Marks the plan flow's screens as opened from the app (the "+" sheet, Training, settings). */
export function InAppPlanFlow({ children }: { children: ReactNode }) {
  return <InAppContext value>{children}</InAppContext>;
}

/**
 * A fresh plan session in the app: no import, and the profile's answers (with the current plan's
 * workouts per week) as the AI's starting point. The onboarding draft holds the flow's answers,
 * as in onboarding.
 */
function startPlanSession(profile: Profile | null | undefined, sessionsPerWeek?: number) {
  useImportStore.getState().reset();
  useWorkoutImportStore.getState().reset();
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
    ...(sessionsPerWeek ? { sessionsPerWeek } : {}),
  });
}

/**
 * Opens the plan flow from the app (the "+" sheet, Training, the settings' import): a workout file
 * to import, or "Ich starte neu" to have a plan made.
 */
export function openPlanFlow(profile: Profile | null | undefined, sessionsPerWeek?: number) {
  startPlanSession(profile, sessionsPerWeek);
  router.push('/plan/import');
}

/** Opens the editor a new plan ends in with one empty routine, to build a plan by hand. */
export function openOwnPlan(profile: Profile | null | undefined, sessionsPerWeek?: number) {
  startPlanSession(profile, sessionsPerWeek);
  useImportStore.getState().setPlan({
    name: i18n.t('planImport:confirm.ownPlan'),
    routines: [
      { key: newId(), name: i18n.t('planImport:confirm.newRoutine', { number: 1 }), exercises: [] },
    ],
    newExercises: [],
  });
  router.push('/plan/import/confirm');
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
 * The plan flow (a workout file to import, or a plan made for the user) runs in onboarding and in
 * the app. Its screens go to the next step with `step`, and hand over the plan with `finish`:
 * onboarding goes on to its promise, the app saves it as the plan Training follows and returns to
 * the Training tab; an import without a plan ends with `done` (its history saved already). A
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

  /** Leaves the flow without a plan: onboarding goes on, the app goes back to Training. */
  function done() {
    if (!inApp) {
      useOnboardingStore.getState().update({ plan: null });
      router.push('/promise');
      return;
    }
    haptics.success();
    router.dismissTo('/');
  }

  return { inApp, step, finish, saveEdits, done };
}

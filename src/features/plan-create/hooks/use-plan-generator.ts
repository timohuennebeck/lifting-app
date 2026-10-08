import { useTranslation } from 'react-i18next';

import { type OnboardingDraft, useDraft } from '@/features/onboarding/stores/onboarding-store';

import { type DayKind, type GeneratePlanInput, generatePlan, splitFor } from '../lib/generate-plan';

const DAY_KINDS: DayKind[] = ['full', 'upper', 'lower', 'push', 'pull', 'legs'];

function inputFromDraft(draft: OnboardingDraft): GeneratePlanInput {
  return {
    goal: draft.goal ?? 'hypertrophy',
    focus: draft.focus,
    equipment: draft.equipment ?? 'gym',
    trainingDays: draft.trainingDays.length ? draft.trainingDays : [0, 2, 4],
    sessionMinutes: draft.sessionMinutes,
    experience: draft.experience,
    complaints: draft.complaints,
  };
}

/** Plan generator bound to the onboarding answers, with localized day and plan names. */
export function usePlanGenerator() {
  const { t } = useTranslation('planCreate');
  const draft = useDraft();
  const input = inputFromDraft(draft);
  const dayCount = new Set(input.trainingDays).size;
  const split = splitFor(dayCount, input.experience);
  const suggestions = [
    t(`splits.${split.kind}`),
    t('planName.goalSplit', { goal: t(`goalShort.${input.goal}`), count: dayCount }),
    t('planName.myPlan'),
  ];
  const days = Object.fromEntries(DAY_KINDS.map((k) => [k, t(`dayNames.${k}`)])) as Record<
    DayKind,
    string
  >;

  function generate(overrides: Partial<GeneratePlanInput> = {}, name = suggestions[0]) {
    return generatePlan({ ...input, ...overrides }, { name, days });
  }

  return { input, split, suggestions, generate };
}

import { Stack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useDraft } from '@/features/onboarding/stores/onboarding-store';
import { usePlanRun } from '@/features/plan-import/hooks/use-plan-run';
import { useNow } from '@/shared/hooks/use-now';

import { BuildingCaption } from '../components/building/building-caption';
import { TipRow } from '../components/building/tip-row';
import { answersFromDraft } from '../lib/plan-answers';

/** Seconds each line of what is being done stays; the last one stays until the plan is there. */
const LINE_SECONDS = 3;

/**
 * 00·P1: the AI makes the plan from the answers (generate-plan) while training tips run; the
 * editor opens with its first exercise and the rest fills in there (ConfirmScreen), the name
 * comes after. How long that takes isn't known, so the screen shows the time waited, not a share.
 */
export function BuildingScreen() {
  const { t } = useTranslation('planCreate');
  const draft = useDraft();
  // The answers as the screen opened; a new draft object doesn't start another plan.
  const [input] = useState(() => answersFromDraft(draft));
  usePlanRun(input);
  const [startedAt] = useState(Date.now);
  const now = useNow(1000);

  const seconds = Math.max(0, Math.floor((now - startedAt) / 1000));
  const lines = t('building.lines', { returnObjects: true });

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false, animation: 'fade' }} />
      <View className="flex-1 bg-bg">
        <View className="flex-1 justify-center px-8 pb-48">
          <TipRow equipment={input.equipment} />
        </View>
        <BuildingCaption
          line={lines[Math.min(lines.length - 1, Math.floor(seconds / LINE_SECONDS))]}
          elapsed={t('building.elapsed', { count: seconds })}
        />
      </View>
    </>
  );
}

import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useDraft, useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { haptics } from '@/shared/lib/haptics';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { DialRing } from '@/shared/ui/dial-ring';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Screen } from '@/shared/ui/screen';
import { SegmentedControl } from '@/shared/ui/segmented-control';
import { StepHeader } from '@/shared/ui/step-header';
import { Text } from '@/shared/ui/text';

import { StepTitle } from '../components/step-title';
import { CREATE_STEPS } from '../lib/flow';

/** Default weekdays for a given number of sessions (Mon-based). */
const PRESET_DAYS: Record<number, number[]> = {
  1: [0],
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 3, 4],
  6: [0, 1, 2, 3, 4, 5],
  7: [0, 1, 2, 3, 4, 5, 6],
};

type Mode = 'days' | 'dial';

export function DaysScreen() {
  const { t } = useTranslation(['planCreate', 'common']);
  const { trainingDays } = useDraft();
  const update = useUpdateDraft();
  const [mode, setMode] = useState<Mode>('days');
  const short = t('common:weekdays.short', { returnObjects: true });
  const long = t('common:weekdays.long', { returnObjects: true });
  const days = [...trainingDays].sort((a, b) => a - b);
  const count = days.length;
  const summary = count ? days.map((d) => short[d]).join(' · ') : t('planCreate:days.none');

  function toggleDay(day: number) {
    update({
      trainingDays: days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort(),
    });
  }

  function onDial(fraction: number) {
    const next = Math.min(7, Math.max(1, Math.round(fraction * 7) || 7));
    if (next === count) return;
    haptics.select();
    update({ trainingDays: PRESET_DAYS[next] });
  }

  const big = (
    <View className="flex-row items-baseline gap-2.5">
      <Text variant="display">{t('planCreate:days.times', { count })}</Text>
      <Text variant="overline" tone="subtle" className="tracking-[1.6px]">
        {t('planCreate:days.perWeek')}
      </Text>
    </View>
  );

  return (
    <Screen
      // The dial's drag gesture must not compete with a scroll view.
      scroll={mode === 'days'}
      header={<StepHeader step={4} total={CREATE_STEPS} />}
      footer={
        <Button
          label={t('common:actions.continue')}
          disabled={!count}
          onPress={() => router.push('/create/duration')}
        />
      }
    >
      <StepTitle title={t('planCreate:days.title')} />
      <SegmentedControl
        className="mx-4 mt-5 w-48"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'days', label: t('planCreate:days.modes.days') },
          { value: 'dial', label: t('planCreate:days.modes.dial') },
        ]}
      />
      <View className="mx-4 mt-4 rounded-[28px] border border-white/12 px-[18px] pt-[22px] pb-5">
        {mode === 'days' ? (
          <>
            {big}
            <View className="mt-[22px] flex-row gap-1.5">
              {long.map((label, day) => {
                const on = days.includes(day);
                return (
                  <PressableScale
                    key={day}
                    haptic="select"
                    accessibilityRole="checkbox"
                    accessibilityLabel={label}
                    accessibilityState={{ checked: on }}
                    onPress={() => toggleDay(day)}
                    className={cn(
                      'h-[150px] flex-1 items-center justify-end rounded-full pb-4',
                      on ? 'bg-accent' : 'bg-pill',
                    )}
                  >
                    <Text variant="caption" tone={on ? 'onAccent' : 'subtle'}>
                      {short[day]}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          </>
        ) : (
          <View className="items-center">
            <DialRing fraction={count / 7} onChange={onDial}>
              <Text className="font-inter-semibold text-[80px] leading-[80px] text-fg">
                {t('planCreate:days.times', { count })}
              </Text>
              <Text variant="overline" tone="subtle" className="mt-1 text-xs tracking-[1.7px]">
                {t('planCreate:days.perWeek')}
              </Text>
            </DialRing>
          </View>
        )}
        <Text
          variant="label"
          tone="accent"
          className={cn('mt-4', mode === 'dial' && 'text-center')}
        >
          {summary}
        </Text>
      </View>
      <Text variant="caption" tone="subtle" className="px-5 pt-3.5 font-inter">
        {mode === 'days' ? t('planCreate:days.hintDays') : t('planCreate:days.hintDial')}
      </Text>
    </Screen>
  );
}

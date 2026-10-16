import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ageFrom } from '@/shared/data/profile';
import { Button } from '@/shared/ui/button';
import { DateWheel } from '@/shared/ui/date-wheel';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';

import { ABOUT_STEPS } from '../lib/flow';
import { useDraft, useUpdateDraft } from '../stores/onboarding-store';

/** Ages that can be given, in whole years; the profile's database check has the same minimum. */
const AGE_RANGE = { min: 14, max: 99 } as const;
/** The wheels start on 1 January of the year someone this old was born. */
const START_AGE = 25;

export function BirthDateScreen() {
  const { t } = useTranslation('onboarding');
  const { t: tc } = useTranslation();
  const { birthDate } = useDraft();
  const update = useUpdateDraft();
  const thisYear = new Date().getFullYear();
  const [value, setValue] = useState(birthDate ?? `${thisYear - START_AGE}-01-01`);
  // Only a turned wheel counts as an answer, so nobody passes the 18+ gate on the start date.
  // Coming back shows the date given before.
  const [picked, setPicked] = useState(birthDate != null);
  const age = ageFrom(value);
  const tooYoung = age < AGE_RANGE.min;

  // The draft only holds an allowed date, so Continue and the account step can rely on it.
  const pick = (next: string) => {
    setValue(next);
    setPicked(true);
    update({ birthDate: ageFrom(next) >= AGE_RANGE.min ? next : null });
  };

  return (
    <StepScreen
      step={3}
      total={ABOUT_STEPS}
      title={t('birthDate.title')}
      footer={
        <Button
          label={tc('actions.continue')}
          disabled={!picked || tooYoung}
          onPress={() => router.push('/units')}
        />
      }
    >
      <View className="gap-3 px-4 pt-8">
        <DateWheel
          value={value}
          onChange={pick}
          minYear={thisYear - AGE_RANGE.max}
          maxYear={thisYear - AGE_RANGE.min}
        />
        {/* Kept in place before the first pick so the wheels don't move. */}
        <Text
          variant="label"
          tone={picked && tooYoung ? 'danger' : 'subtle'}
          accessibilityLiveRegion="polite"
          className="text-center"
        >
          {!picked
            ? ' '
            : tooYoung
              ? t('birthDate.tooYoung', { min: AGE_RANGE.min })
              : t('birthDate.age', { count: age })}
        </Text>
      </View>
    </StepScreen>
  );
}

import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { CM_PER_INCH, feetInches } from '@/features/settings/lib/body-units';
import { Button } from '@/shared/ui/button';
import { RulerPicker } from '@/shared/ui/ruler-picker';

import { MeasureValue, StepButtons } from '../components/measure-value';
import { OnboardingStep } from '../components/onboarding-step';
import { ABOUT_STEPS, HEIGHT_CM, HEIGHT_IN } from '../lib/flow';
import { useDraft, useUpdateDraft } from '../stores/onboarding-store';

export function HeightScreen() {
  const { t } = useTranslation('onboarding');
  const { t: tc } = useTranslation();
  const { heightCm, unitSystem } = useDraft();
  const update = useUpdateDraft();
  const imperial = unitSystem === 'imperial';

  // Imperial users scroll in inches; the draft always stores whole centimetres.
  const range = imperial ? HEIGHT_IN : HEIGHT_CM;
  const value = imperial ? Math.round(heightCm / CM_PER_INCH) : heightCm;
  const setValue = (next: number) => {
    const v = Math.min(range.max, Math.max(range.min, next));
    update({ heightCm: imperial ? Math.round(v * CM_PER_INCH) : v });
  };

  return (
    <OnboardingStep
      step={6}
      total={ABOUT_STEPS}
      title={t('height.title')}
      footer={<Button label={tc('actions.continue')} onPress={() => router.push('/experience')} />}
    >
      <View className="flex-row items-center gap-5 pt-[30px] pr-5 pl-7">
        <View className="flex-1 gap-[22px]">
          <MeasureValue
            value={imperial ? feetInches(value) : String(value)}
            unit={imperial ? undefined : tc('units.cm')}
          />
          <StepButtons
            onDecrease={() => setValue(value - 1)}
            onIncrease={() => setValue(value + 1)}
          />
        </View>
        <RulerPicker
          vertical
          value={value}
          onChange={setValue}
          min={range.min}
          max={range.max}
          step={1}
          majorEvery={imperial ? 12 : 10}
          midEvery={imperial ? 6 : 5}
          className="h-[330px]"
        />
      </View>
    </OnboardingStep>
  );
}

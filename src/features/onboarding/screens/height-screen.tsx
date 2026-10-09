import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { HEIGHT_CM, HEIGHT_IN } from '@/shared/data/profile';
import { CM_PER_INCH, feetInches } from '@/shared/lib/format';
import { clamp } from '@/shared/lib/math';
import { Button } from '@/shared/ui/button';
import { RulerPicker } from '@/shared/ui/ruler-picker';
import { StepScreen } from '@/shared/ui/step-screen';

import { MeasureValue, StepButtons } from '../components/measure-value';
import { ABOUT_STEPS } from '../lib/flow';
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
    const v = clamp(next, range.min, range.max);
    update({ heightCm: imperial ? Math.round(v * CM_PER_INCH) : v });
  };

  return (
    <StepScreen
      step={6}
      total={ABOUT_STEPS}
      title={t('height.title')}
      footer={<Button label={tc('actions.continue')} onPress={() => router.push('/experience')} />}
    >
      <View className="flex-row items-center gap-5 pt-7.5 pr-5 pl-7">
        <View className="flex-1 gap-5.5">
          <MeasureValue
            value={imperial ? feetInches(value) : String(value)}
            amount={value}
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
          className="h-82.5"
        />
      </View>
    </StepScreen>
  );
}

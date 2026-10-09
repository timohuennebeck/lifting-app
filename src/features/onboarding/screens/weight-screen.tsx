import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { bodyWeightFromDisplay, bodyWeightRange, bodyWeightToDisplay } from '@/shared/data/profile';
import { formatNumber, weightUnit } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { RulerPicker } from '@/shared/ui/ruler-picker';
import { StepScreen } from '@/shared/ui/step-screen';

import { MeasureValue, StepButtons } from '../components/measure-value';
import { ABOUT_STEPS } from '../lib/flow';
import { useDraft, useUpdateDraft } from '../stores/onboarding-store';

export function WeightScreen() {
  const { t } = useTranslation('onboarding');
  const { t: tc } = useTranslation();
  const { weightKg, unitSystem } = useDraft();
  const update = useUpdateDraft();
  const imperial = unitSystem === 'imperial';

  // The ruler works in the display unit; the draft always stores kg.
  const range = bodyWeightRange(unitSystem);
  const value = bodyWeightToDisplay(weightKg, unitSystem);
  const setValue = (next: number) => update({ weightKg: bodyWeightFromDisplay(next, unitSystem) });

  return (
    <StepScreen
      step={5}
      total={ABOUT_STEPS}
      title={t('weight.title')}
      footer={<Button label={tc('actions.continue')} onPress={() => router.push('/height')} />}
    >
      <View className="mx-4 mt-6 items-center py-5">
        <MeasureValue
          value={imperial ? String(value) : formatNumber(value, 1)}
          amount={value}
          unit={tc(`units.${weightUnit(unitSystem)}`)}
        />
        <RulerPicker
          value={value}
          onChange={setValue}
          min={range.min}
          max={range.max}
          step={range.step}
          majorEvery={10}
          midEvery={imperial ? 5 : 2}
          className="mt-5"
        />
        <StepButtons
          className="mt-5"
          onDecrease={() => setValue(value - range.step)}
          onIncrease={() => setValue(value + range.step)}
        />
      </View>
    </StepScreen>
  );
}

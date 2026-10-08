import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { formatNumber, kgToLb, lbToKg } from '@/shared/lib/format';
import { clamp } from '@/shared/lib/math';
import { Button } from '@/shared/ui/button';
import { RulerPicker } from '@/shared/ui/ruler-picker';
import { StepScreen } from '@/shared/ui/step-screen';

import { MeasureValue, StepButtons } from '../components/measure-value';
import { ABOUT_STEPS, WEIGHT_KG, WEIGHT_LB } from '../lib/flow';
import { useDraft, useUpdateDraft } from '../stores/onboarding-store';

const roundTenth = (v: number) => Math.round(v * 10) / 10;

export function WeightScreen() {
  const { t } = useTranslation('onboarding');
  const { t: tc } = useTranslation();
  const { weightKg, unitSystem } = useDraft();
  const update = useUpdateDraft();
  const imperial = unitSystem === 'imperial';

  // The ruler works in the display unit; the draft always stores kg.
  const range = imperial ? WEIGHT_LB : WEIGHT_KG;
  const value = imperial ? Math.round(kgToLb(weightKg)) : weightKg;
  const setValue = (next: number) => {
    const v = clamp(next, range.min, range.max);
    update({ weightKg: roundTenth(imperial ? lbToKg(v) : v) });
  };

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
          unit={tc(imperial ? 'units.lb' : 'units.kg')}
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

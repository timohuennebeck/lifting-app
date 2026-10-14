import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useDraft } from '@/features/onboarding/stores/onboarding-store';
import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { Button } from '@/shared/ui/button';
import { Chip } from '@/shared/ui/chip';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';
import { PLAN_NAME_MAX } from '@/shared/lib/limits';

import { usePlanGenerator } from '../hooks/use-plan-generator';
import { CREATE_STEPS } from '../lib/flow';

export function PlanNameScreen() {
  const { t } = useTranslation(['planCreate', 'common', 'training']);
  const { plan } = useDraft();
  const { inApp, finish } = usePlanFlow();
  const { suggestions, generate } = usePlanGenerator();
  const [name, setName] = useState(plan?.name ?? suggestions[0]);
  const trimmed = name.trim();

  function submit() {
    if (trimmed) void finish({ ...(plan ?? generate()), name: trimmed });
  }

  return (
    <StepScreen
      step={6}
      total={CREATE_STEPS}
      title={t('planCreate:planName.title')}
      scroll
      footer={
        <Button
          // In the app the plan is saved here; onboarding goes on.
          label={inApp ? t('training:create.createProgram') : t('common:actions.continue')}
          disabled={!trimmed}
          onPress={submit}
        />
      }
    >
      <View className="gap-2.5 px-4 pt-7">
        <TextField
          value={name}
          onChangeText={setName}
          accessibilityLabel={t('planCreate:planName.label')}
          placeholder={t('planCreate:planName.placeholder')}
          maxLength={PLAN_NAME_MAX}
          clearable
          autoFocus
          autoCapitalize="sentences"
          returnKeyType="done"
          onSubmitEditing={submit}
        />
        <Text variant="caption" tone="subtle" className="self-end px-2">
          {t('planCreate:planName.counter', { count: name.length, max: PLAN_NAME_MAX })}
        </Text>
      </View>
      <View className="gap-3 px-5 pt-3.5">
        <Text variant="overline" tone="subtle" className="text-xs tracking-[1.7px]">
          {t('planCreate:planName.suggestions')}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {suggestions.map((s) => (
            <Chip
              key={s}
              label={s}
              selected={name === s}
              onPress={() => setName(s)}
              className="h-11 px-4"
            />
          ))}
        </View>
      </View>
    </StepScreen>
  );
}

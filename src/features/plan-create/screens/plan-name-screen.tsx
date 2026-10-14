import { Redirect } from 'expo-router';
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

import { useCreateStep } from '../hooks/use-create-step';
import { profileAnswers } from '../lib/plan-answers';

export function PlanNameScreen() {
  const { t } = useTranslation(['planCreate', 'common', 'training']);
  const counter = useCreateStep('planName');
  const draft = useDraft();
  const { plan } = draft;
  const { inApp, step, finish } = usePlanFlow();
  // The plan's own name (the AI's, or one given in the editor) and a neutral one.
  const suggestions = [...new Set([plan?.name, t('planCreate:planName.myPlan')])].filter(
    (s): s is string => !!s,
  );
  const [name, setName] = useState(suggestions[0]);
  const trimmed = name.trim();

  // The plan comes from the editor before (ConfirmScreen).
  if (!plan) return <Redirect href={step('/create/building')} />;

  function submit() {
    if (trimmed && plan) void finish({ ...plan, name: trimmed }, profileAnswers(draft));
  }

  return (
    <StepScreen
      {...counter}
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

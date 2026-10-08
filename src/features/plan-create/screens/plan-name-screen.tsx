import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useDraft, useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { Button } from '@/shared/ui/button';
import { Chip } from '@/shared/ui/chip';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';

import { usePlanGenerator } from '../hooks/use-plan-generator';
import { CREATE_STEPS, PLAN_NAME_MAX } from '../lib/flow';

export function PlanNameScreen() {
  const { t } = useTranslation(['planCreate', 'common']);
  const { plan } = useDraft();
  const update = useUpdateDraft();
  const { suggestions, generate } = usePlanGenerator();
  const [name, setName] = useState(plan?.name ?? suggestions[0]);
  const trimmed = name.trim();

  function submit() {
    if (!trimmed) return;
    update({ plan: { ...(plan ?? generate()), name: trimmed } });
    router.push('/promise');
  }

  return (
    <StepScreen
      step={6}
      total={CREATE_STEPS}
      title={t('planCreate:planName.title')}
      scroll
      footer={<Button label={t('common:actions.continue')} disabled={!trimmed} onPress={submit} />}
    >
      <View className="gap-2.5 px-4 pt-7">
        <TextField
          value={name}
          onChangeText={setName}
          accessibilityLabel={t('planCreate:planName.label')}
          placeholder={t('planCreate:planName.placeholder')}
          maxLength={PLAN_NAME_MAX}
          clearable
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

import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { haptics } from '@/shared/lib/haptics';
import { requireUserId } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';
import { ROUTINE_NAME_MAX } from '@/shared/lib/limits';

import { createRoutine } from '../data/routine-mutations';

/**
 * Names a new empty routine, then opens it. It goes into the plan `planId` ("Training
 * hinzufügen" under a plan), else into Meine Trainings.
 */
export function NewRoutineScreen() {
  const { planId } = useLocalSearchParams<{ planId?: string }>();
  // Not `??` inside the `try`, which the React Compiler can't compile.
  const target = planId ?? null;
  const { t } = useTranslation('training');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const valid = name.trim().length > 0;

  const create = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      const id = await createRoutine(requireUserId(), name, target);
      haptics.success();
      router.replace(`/routine/${id}`);
    } catch (error) {
      console.warn('Creating the routine failed', error);
      haptics.error();
    }
    setSaving(false);
  };

  return (
    <Screen
      scroll
      header={<ScreenHeader />}
      footer={
        <Button
          label={t('create.createRoutine')}
          disabled={!valid}
          loading={saving}
          onPress={create}
        />
      }
    >
      <Text variant="title" className="px-5 pt-5 normal-case">
        {t('newRoutine.title')}
      </Text>
      <TextField
        className="px-4 pt-6"
        label={t('newRoutine.name')}
        value={name}
        onChangeText={setName}
        placeholder={t('newRoutine.namePlaceholder')}
        clearable
        maxLength={ROUTINE_NAME_MAX}
        returnKeyType="done"
        onSubmitEditing={create}
      />
    </Screen>
  );
}

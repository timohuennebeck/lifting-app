import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@/shared/ui/button';

export interface AddRoutineButtonProps {
  planId: string;
}

/** "Training hinzufügen" under a plan's routines: names a new one for that plan. */
export function AddRoutineButton({ planId }: AddRoutineButtonProps) {
  const { t } = useTranslation('training');
  return (
    <Button
      label={t('list.addRoutine')}
      icon="plus"
      size="sm"
      variant="secondary"
      className="mx-4 mt-3 self-start"
      onPress={() => router.push({ pathname: '/routine/new', params: { planId } })}
    />
  );
}

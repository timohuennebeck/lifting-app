import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { attempt } from '@/shared/lib/async';
import { haptics } from '@/shared/lib/haptics';
import { requireUserId } from '@/shared/stores/session-store';

import { createRoutine } from '../data/routine-mutations';

/**
 * Makes an empty routine with a placeholder name and opens it, where it is renamed and filled.
 * It goes into the plan `planId`, else outside a plan (Einzeltrainings).
 */
export function useCreateRoutine() {
  const { t } = useTranslation('training');
  const [creating, setCreating] = useState(false);

  const create = async (planId: string | null = null) => {
    if (creating) return;
    setCreating(true);
    await attempt('Creating the routine failed', async () => {
      const id = await createRoutine(requireUserId(), t('create.untitledRoutine'), planId);
      haptics.success();
      router.push({ pathname: '/routine/[id]', params: { id, created: '1' } });
    });
    setCreating(false);
  };

  return { create, creating };
}

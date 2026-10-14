import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCurrentPlan } from '@/shared/data/plans';
import type { RoutineSummary } from '@/shared/data/routines';
import { useLastDefined } from '@/shared/hooks/use-last-defined';
import { attempt } from '@/shared/lib/async';
import { haptics } from '@/shared/lib/haptics';
import { ROUTINE_NAME_MAX } from '@/shared/lib/limits';
import { requireUserId } from '@/shared/stores/session-store';
import { afterSheetClose } from '@/shared/ui/sheet';
import { TextInputSheet } from '@/shared/ui/text-input-sheet';

import { copyRoutine, deleteRoutine, renameRoutine } from '../data/routine-mutations';
import { RoutineOptionsSheet } from './routine-options-sheet';

export type RoutineMenuTarget = Pick<
  RoutineSummary,
  'id' | 'name' | 'planId' | 'exerciseCount' | 'estimatedMinutes'
>;

export interface RoutineMenuProps {
  /** The routine whose "⋯" is open; null when closed. */
  routine: RoutineMenuTarget | null;
  onClose: () => void;
  /** Runs before the routine is deleted, e.g. to leave its page. */
  onDelete?: () => void;
}

/**
 * A routine's "⋯": rename, copy (out of its plan into Meine Trainings, or from there into the
 * current plan) or delete.
 */
export function RoutineMenu({ routine, onClose, onDelete }: RoutineMenuProps) {
  const { t } = useTranslation(['training', 'common']);
  const shown = useLastDefined(routine);
  const [renaming, setRenaming] = useState<RoutineMenuTarget | null>(null);
  const renameShown = useLastDefined(renaming);
  const { plan } = useCurrentPlan();

  const copyTo = async (planId: string | null) => {
    onClose();
    if (!routine) return;
    const copied = await attempt('Copying the routine failed', () =>
      copyRoutine(requireUserId(), routine.id, planId),
    );
    if (copied) haptics.success();
  };

  let copy;
  if (shown?.planId) {
    copy = {
      title: t('options.copyToLibrary'),
      description: t('options.copyToLibraryHint'),
      onCopy: () => copyTo(null),
    };
  } else if (plan) {
    copy = {
      title: t('options.copyToPlan', { plan: plan.name }),
      description: t('options.copyToPlanHint'),
      onCopy: () => copyTo(plan.id),
    };
  }

  return (
    <>
      <RoutineOptionsSheet
        visible={!!routine}
        onClose={onClose}
        name={shown?.name ?? ''}
        exerciseCount={shown?.exerciseCount ?? 0}
        minutes={shown?.estimatedMinutes ?? 0}
        onRename={() => {
          onClose();
          afterSheetClose(() => setRenaming(routine));
        }}
        copy={copy}
        onDelete={async () => {
          onClose();
          if (!routine) return;
          onDelete?.();
          if (await attempt('Deleting the routine failed', () => deleteRoutine(routine.id))) {
            haptics.success();
          }
        }}
      />
      <TextInputSheet
        visible={!!renaming}
        onClose={() => setRenaming(null)}
        title={t('options.renameTitle')}
        initialValue={renameShown?.name}
        maxLength={ROUTINE_NAME_MAX}
        placeholder={t('options.namePlaceholder')}
        ctaLabel={t('common:actions.save')}
        onSubmit={async (name) => {
          const target = renaming;
          if (target)
            await attempt('Renaming the routine failed', () => renameRoutine(target.id, name));
          setRenaming(null);
        }}
      />
    </>
  );
}

import { useTranslation } from 'react-i18next';

import { useResetOnOpen } from '@/shared/hooks/use-reset-on-open';
import { ChoiceSheet } from '@/shared/ui/choice-sheet';
import { deleteIcon } from '@/shared/ui/minus-glyph';

type WorkoutOption = 'delete';

export interface WorkoutOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  name: string;
  /** When it was done and how long it took, under the name. */
  subtitle: string;
  /** The day it was done, for the delete hint. */
  date: string;
  onDelete: () => void;
}

/** "⋯" options of a finished workout: for now only deleting it, selected from the start. */
export function WorkoutOptionsSheet({
  visible,
  onClose,
  name,
  subtitle,
  date,
  onDelete,
}: WorkoutOptionsSheetProps) {
  const { t } = useTranslation(['workout', 'common']);
  const [option, setOption] = useResetOnOpen<WorkoutOption>(visible, 'delete');

  return (
    <ChoiceSheet
      visible={visible}
      onClose={onClose}
      title={name}
      subtitle={subtitle}
      value={option}
      onChange={setOption}
      onConfirm={onDelete}
      options={[
        {
          value: 'delete',
          tone: 'danger',
          title: t('summary.delete'),
          description: t('summary.deleteHint', { name, date }),
          cta: t('common:actions.delete'),
          renderIcon: deleteIcon,
        },
      ]}
    />
  );
}

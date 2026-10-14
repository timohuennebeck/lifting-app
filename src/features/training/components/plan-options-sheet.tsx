import { useTranslation } from 'react-i18next';

import { useResetOnOpen } from '@/shared/hooks/use-reset-on-open';
import { colors } from '@/shared/lib/theme';
import { ChoiceSheet } from '@/shared/ui/choice-sheet';
import { deleteIcon } from '@/shared/ui/minus-glyph';

import { RenameGlyph } from './glyphs';

type PlanOption = 'rename' | 'delete';

export interface PlanOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  name: string;
  routineCount: number;
  onRename: () => void;
  onDelete: () => void;
}

/** "⋯" of a plan: rename, or delete it with its routines. */
export function PlanOptionsSheet({
  visible,
  onClose,
  name,
  routineCount,
  onRename,
  onDelete,
}: PlanOptionsSheetProps) {
  const { t } = useTranslation(['training', 'common']);
  const [option, setOption] = useResetOnOpen<PlanOption>(visible, 'rename');

  return (
    <ChoiceSheet
      visible={visible}
      onClose={onClose}
      title={name}
      subtitle={t('plan.routineCount', { count: routineCount })}
      value={option}
      onChange={setOption}
      onConfirm={(value) => (value === 'rename' ? onRename() : onDelete())}
      options={[
        {
          value: 'rename',
          title: t('plan.rename'),
          description: t('plan.renameHint', { name }),
          cta: t('common:actions.rename'),
          renderIcon: (active) => <RenameGlyph color={active ? colors.onAccent : colors.fgMid} />,
        },
        {
          value: 'delete',
          tone: 'danger',
          title: t('plan.delete'),
          description: t('plan.deleteHint', { name }),
          cta: t('common:actions.delete'),
          renderIcon: deleteIcon,
        },
      ]}
    />
  );
}

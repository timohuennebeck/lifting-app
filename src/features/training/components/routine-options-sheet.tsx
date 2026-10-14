import { useTranslation } from 'react-i18next';

import { useResetOnOpen } from '@/shared/hooks/use-reset-on-open';
import { colors } from '@/shared/lib/theme';
import { ChoiceSheet } from '@/shared/ui/choice-sheet';
import { deleteIcon } from '@/shared/ui/minus-glyph';

import { RenameGlyph, RoutineGlyph } from './glyphs';

const glyphColor = (active: boolean) => (active ? colors.onAccent : colors.fgMid);

export type RoutineOption = 'rename' | 'copy' | 'delete';

export interface RoutineOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  name: string;
  exerciseCount: number;
  minutes: number;
  onRename: () => void;
  /** Where a copy goes: into the plan from the library, or out of a plan into the library. */
  copy?: { title: string; description: string; onCopy: () => void };
  onDelete: () => void;
}

/** "⋯" options of a routine: rename, copy or delete (03·0b·M). */
export function RoutineOptionsSheet({
  visible,
  onClose,
  name,
  exerciseCount,
  minutes,
  onRename,
  copy,
  onDelete,
}: RoutineOptionsSheetProps) {
  const { t } = useTranslation(['training', 'common']);
  const [option, setOption] = useResetOnOpen<RoutineOption>(visible, 'rename');

  return (
    <ChoiceSheet
      visible={visible}
      onClose={onClose}
      title={name}
      subtitle={t('options.meta', { count: exerciseCount, minutes })}
      value={option}
      onChange={setOption}
      onConfirm={(value) => {
        if (value === 'rename') onRename();
        else if (value === 'copy') copy?.onCopy();
        else onDelete();
      }}
      options={[
        {
          value: 'rename',
          title: t('options.rename'),
          description: t('options.renameHint', { name }),
          cta: t('common:actions.rename'),
          renderIcon: (active) => <RenameGlyph color={glyphColor(active)} />,
        },
        ...(copy
          ? [
              {
                value: 'copy' as const,
                title: copy.title,
                description: copy.description,
                cta: t('options.copy'),
                renderIcon: (active: boolean) => <RoutineGlyph color={glyphColor(active)} />,
              },
            ]
          : []),
        {
          value: 'delete',
          tone: 'danger',
          title: t('options.delete'),
          description: t('options.deleteHint', { name }),
          cta: t('common:actions.delete'),
          renderIcon: deleteIcon,
        },
      ]}
    />
  );
}

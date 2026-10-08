import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { colors } from '@/shared/lib/theme';
import { ChoiceSheet } from '@/shared/ui/choice-sheet';

import { MinusGlyph, RenameGlyph } from './glyphs';

type TemplateOption = 'rename' | 'delete';

export interface TemplateOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  name: string;
  exerciseCount: number;
  minutes: number;
  onRename: () => void;
  onDelete: () => void;
}

/** "⋯" options of a training: rename or delete (03·0b·M). */
export function TemplateOptionsSheet({
  visible,
  onClose,
  name,
  exerciseCount,
  minutes,
  onRename,
  onDelete,
}: TemplateOptionsSheetProps) {
  const { t } = useTranslation(['training', 'common']);
  const [option, setOption] = useState<TemplateOption>('rename');

  return (
    <ChoiceSheet
      visible={visible}
      onClose={onClose}
      title={name}
      subtitle={t('options.meta', { count: exerciseCount, minutes })}
      value={option}
      onChange={setOption}
      onConfirm={(value) => (value === 'rename' ? onRename() : onDelete())}
      options={[
        {
          value: 'rename',
          title: t('options.rename'),
          description: t('options.renameHint', { name }),
          cta: t('common:actions.rename'),
          renderIcon: (active) => <RenameGlyph color={active ? colors.onAccent : '#D6D6D1'} />,
        },
        {
          value: 'delete',
          tone: 'danger',
          title: t('options.delete'),
          description: t('options.deleteHint', { name }),
          cta: t('common:actions.delete'),
          renderIcon: (active) => <MinusGlyph color={active ? colors.bg : colors.fg} />,
        },
      ]}
    />
  );
}

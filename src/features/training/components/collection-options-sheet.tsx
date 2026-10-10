import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { colors } from '@/shared/lib/theme';
import { ChoiceSheet } from '@/shared/ui/choice-sheet';
import { MinusGlyph } from '@/shared/ui/minus-glyph';

import { RenameGlyph } from './glyphs';

type CollectionOption = 'rename' | 'delete';

export interface CollectionOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  name: string;
  templateCount: number;
  onRename: () => void;
  /** Continues to the delete sheet, which asks what happens to the templates. */
  onDelete: () => void;
}

/** "⋯" of a collection: rename or delete, like a training's options. */
export function CollectionOptionsSheet({
  visible,
  onClose,
  name,
  templateCount,
  onRename,
  onDelete,
}: CollectionOptionsSheetProps) {
  const { t } = useTranslation(['training', 'common']);
  const [option, setOption] = useState<CollectionOption>('rename');
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setOption('rename');
  }

  return (
    <ChoiceSheet
      visible={visible}
      onClose={onClose}
      title={name}
      subtitle={t('collections.templateCount', { count: templateCount })}
      value={option}
      onChange={setOption}
      onConfirm={(value) => (value === 'rename' ? onRename() : onDelete())}
      options={[
        {
          value: 'rename',
          title: t('options.rename'),
          description: t('options.renameHint', { name }),
          cta: t('common:actions.rename'),
          renderIcon: (active) => <RenameGlyph color={active ? colors.onAccent : colors.fgMid} />,
        },
        {
          value: 'delete',
          tone: 'danger',
          title: t('collections.deleteKeep'),
          description: t('collections.deleteHint'),
          cta: t('common:actions.continue'),
          renderIcon: (active) => <MinusGlyph color={active ? colors.bg : colors.fg} />,
        },
      ]}
    />
  );
}

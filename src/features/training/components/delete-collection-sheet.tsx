import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { ChoiceSheet } from '@/shared/ui/choice-sheet';

import { type DeleteCollectionMode, deleteCollection } from '../data/template-mutations';
import { MinusGlyph } from './glyphs';

export interface DeleteCollectionSheetProps {
  collection: { id: string; name: string; templateCount: number } | null;
  onClose: () => void;
}

/** Confirms deleting a collection, with or without its templates (01·V·A·4). */
export function DeleteCollectionSheet({ collection, onClose }: DeleteCollectionSheetProps) {
  const { t } = useTranslation(['training', 'common']);
  const [mode, setMode] = useState<DeleteCollectionMode>('keepTemplates');
  const [busy, setBusy] = useState(false);
  // Keep the last target so the copy doesn't blank out during the exit animation.
  const [shown, setShown] = useState(collection);
  if (collection && collection !== shown) {
    setShown(collection);
    setMode('keepTemplates');
  }

  const confirm = async (value: DeleteCollectionMode) => {
    if (!collection) return;
    setBusy(true);
    try {
      await deleteCollection(collection.id, value);
      haptics.success();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const icon = (active: boolean) => <MinusGlyph color={active ? colors.bg : colors.fg} />;
  return (
    <ChoiceSheet
      visible={!!collection}
      onClose={onClose}
      title={t('collections.deleteTitle', { name: shown?.name ?? '' })}
      subtitle={t('collections.deleteSubtitle', { count: shown?.templateCount ?? 0 })}
      value={mode}
      onChange={setMode}
      onConfirm={confirm}
      loading={busy}
      options={[
        {
          value: 'keepTemplates',
          tone: 'danger',
          title: t('collections.deleteKeep'),
          description: t('collections.deleteKeepHint'),
          cta: t('common:actions.delete'),
          renderIcon: icon,
        },
        {
          value: 'withTemplates',
          tone: 'danger',
          title: t('collections.deleteAll'),
          description: t('collections.deleteAllHint'),
          cta: t('common:actions.delete'),
          renderIcon: icon,
        },
      ]}
    />
  );
}

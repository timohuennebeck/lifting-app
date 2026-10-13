import { useTranslation } from 'react-i18next';

import { requireUserId } from '@/shared/stores/session-store';
import { TextInputSheet } from '@/shared/ui/text-input-sheet';
import { PLAN_NAME_MAX } from '@/shared/lib/limits';

import { createCollection } from '../data/template-mutations';

export interface NewCollectionSheetProps {
  visible: boolean;
  onClose: () => void;
  onCreated: (collectionId: string) => void;
}

/** Name prompt that creates a collection (01·V·A·2). */
export function NewCollectionSheet({ visible, onClose, onCreated }: NewCollectionSheetProps) {
  const { t } = useTranslation(['training', 'common']);
  return (
    <TextInputSheet
      visible={visible}
      onClose={onClose}
      title={t('collections.newTitle')}
      maxLength={PLAN_NAME_MAX}
      placeholder={t('collections.namePlaceholder')}
      ctaLabel={t('common:actions.create')}
      onSubmit={async (name) => onCreated(await createCollection(requireUserId(), name))}
    />
  );
}

import { useTranslation } from 'react-i18next';

import { ChoiceSheet } from '@/shared/ui/choice-sheet';
import { deleteIcon } from '@/shared/ui/minus-glyph';

export interface DeleteChatsSheetProps {
  /** How many chats it deletes: one from its "…", or the chosen ones. */
  count: number;
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
}

/** Deleting chats, as deleting the account: the one, red option comes selected. */
export function DeleteChatsSheet({ count, visible, onClose, onDelete }: DeleteChatsSheetProps) {
  const { t } = useTranslation(['coach', 'common']);
  return (
    <ChoiceSheet
      visible={visible}
      onClose={onClose}
      title={t('coach:history.deleteSheet.title', { count })}
      subtitle={t('coach:history.deleteSheet.subtitle')}
      value="delete"
      onChange={() => {}}
      onConfirm={onDelete}
      options={[
        {
          value: 'delete',
          tone: 'danger',
          title: t('coach:history.deleteSheet.option', { count }),
          description: t('coach:history.deleteSheet.body', { count }),
          cta: t('common:actions.delete'),
          renderIcon: deleteIcon,
        },
      ]}
    />
  );
}

import { useTranslation } from 'react-i18next';

import { colors } from '@/shared/lib/theme';
import { ChoiceSheet } from '@/shared/ui/choice-sheet';
import { MinusGlyph } from '@/shared/ui/minus-glyph';

export interface DeleteAccountSheetProps {
  visible: boolean;
  onClose: () => void;
  /** A store subscription keeps running after the account is gone: say so. */
  subscribed: boolean;
  deleting: boolean;
  onDelete: () => void;
}

/** "Konto löschen": the one, red option comes selected; the CTA deletes everything for good. */
export function DeleteAccountSheet({
  visible,
  onClose,
  subscribed,
  deleting,
  onDelete,
}: DeleteAccountSheetProps) {
  const { t } = useTranslation('profile');
  return (
    <ChoiceSheet
      visible={visible}
      onClose={deleting ? () => {} : onClose}
      title={t('settings.deleteConfirm.title')}
      subtitle={t('settings.deleteConfirm.subtitle')}
      value="delete"
      onChange={() => {}}
      onConfirm={onDelete}
      loading={deleting}
      note={subscribed ? t('settings.deleteConfirm.subscription') : undefined}
      options={[
        {
          value: 'delete',
          tone: 'danger',
          title: t('settings.deleteConfirm.option'),
          description: t('settings.deleteConfirm.body'),
          cta: t('settings.deleteAccount'),
          renderIcon: (active) => <MinusGlyph color={active ? colors.bg : colors.fg} />,
        },
      ]}
    />
  );
}

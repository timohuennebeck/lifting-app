import { useTranslation } from 'react-i18next';

import { MinusGlyph } from '@/features/training/components/glyphs';
import { colors } from '@/shared/lib/theme';
import { ChoiceSheet } from '@/shared/ui/choice-sheet';

export interface DeleteCheckSheetProps {
  visible: boolean;
  onClose: () => void;
  /** "Check 2" and its date, for the title. */
  title: string;
  subtitle: string;
  onDelete: () => void;
}

/** "⋯" of a saved check: its one option, deleting, comes selected as in the other sheets. */
export function DeleteCheckSheet({
  visible,
  onClose,
  title,
  subtitle,
  onDelete,
}: DeleteCheckSheetProps) {
  const { t } = useTranslation(['bodyCheck', 'common']);
  return (
    <ChoiceSheet
      visible={visible}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      value="delete"
      onChange={() => {}}
      onConfirm={onDelete}
      options={[
        {
          value: 'delete',
          tone: 'danger',
          title: t('result.delete'),
          description: t('result.deleteHint'),
          cta: t('common:actions.delete'),
          renderIcon: (active) => <MinusGlyph color={active ? colors.bg : colors.fg} />,
        },
      ]}
    />
  );
}

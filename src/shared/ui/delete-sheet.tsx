import { useTranslation } from 'react-i18next';

import { ChoiceSheet } from './choice-sheet';
import { deleteIcon } from './minus-glyph';

export interface DeleteSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  /** The red option: what goes, and what deleting it means. */
  option: string;
  description: string;
  /** The button; "Löschen" unless it says more. */
  cta?: string;
  note?: string;
  loading?: boolean;
  onDelete: () => void;
}

/** Deleting something: its one, red option comes selected and the button deletes it. */
export function DeleteSheet({ option, description, cta, onDelete, ...sheet }: DeleteSheetProps) {
  const { t } = useTranslation('common');
  return (
    <ChoiceSheet
      {...sheet}
      value="delete"
      onChange={() => {}}
      onConfirm={onDelete}
      options={[
        {
          value: 'delete',
          tone: 'danger',
          title: option,
          description,
          cta: cta ?? t('actions.delete'),
          renderIcon: deleteIcon,
        },
      ]}
    />
  );
}

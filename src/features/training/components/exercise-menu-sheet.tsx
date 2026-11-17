import { useTranslation } from 'react-i18next';

import { ActionSheet } from '@/shared/ui/action-sheet';
import type { IconName } from '@/shared/ui/icon';

export type ExerciseMenuAction =
  'editSets' | 'superset' | 'unsuperset' | 'swap' | 'moveUp' | 'moveDown' | 'remove';

export interface ExerciseMenuSheetProps {
  visible: boolean;
  onClose: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onAction: (action: ExerciseMenuAction) => void;
  /** Actions to leave out, e.g. "editSets" where sets can't be edited. */
  hidden?: ExerciseMenuAction[];
  /** In a superset: "Remove from superset" shows instead of "Superset with …". */
  paired?: boolean;
}

const ACTIONS: { action: ExerciseMenuAction; icon?: IconName }[] = [
  { action: 'editSets', icon: 'pencil' },
  { action: 'superset', icon: 'link' },
  { action: 'unsuperset', icon: 'link' },
  { action: 'swap', icon: 'swap' },
  { action: 'moveUp', icon: 'arrow-up' },
  { action: 'moveDown', icon: 'chevron-down' },
  // The app's usual remove mark: a minus.
  { action: 'remove' },
];

/** Per-exercise "⋯" menu: edit sets, superset, swap, reorder, remove. */
export function ExerciseMenuSheet({
  visible,
  onClose,
  canMoveUp,
  canMoveDown,
  onAction,
  hidden = [],
  paired = false,
}: ExerciseMenuSheetProps) {
  const { t } = useTranslation('training');
  const items = ACTIONS.filter(
    ({ action }) =>
      !hidden.includes(action) &&
      action !== (paired ? 'superset' : 'unsuperset') &&
      (action !== 'moveUp' || canMoveUp) &&
      (action !== 'moveDown' || canMoveDown),
  ).map(({ action, icon }) => ({ action, icon, label: t(`exerciseMenu.${action}`) }));
  return <ActionSheet visible={visible} onClose={onClose} items={items} onAction={onAction} />;
}

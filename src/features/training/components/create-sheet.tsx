import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { colors } from '@/shared/lib/theme';
import { ChoiceSheet } from '@/shared/ui/choice-sheet';

import { PlanGlyph, RoutineGlyph } from './glyphs';

type CreateKind = 'routine' | 'plan';

export interface CreateSheetProps {
  visible: boolean;
  onClose: () => void;
  onCreateRoutine: () => void;
  onCreatePlan: () => void;
}

const glyphColor = (active: boolean) => (active ? colors.onAccent : colors.fgMid);

/** "+" sheet: a new routine, or a plan, which is made, imported or built (01·V·A·6). */
export function CreateSheet({ visible, onClose, onCreateRoutine, onCreatePlan }: CreateSheetProps) {
  const { t } = useTranslation('training');
  const [kind, setKind] = useState<CreateKind>('routine');

  return (
    <ChoiceSheet
      visible={visible}
      onClose={onClose}
      value={kind}
      onChange={setKind}
      onConfirm={(value) => (value === 'routine' ? onCreateRoutine() : onCreatePlan())}
      options={[
        {
          value: 'routine',
          title: t('create.routine'),
          description: t('create.routineHint'),
          cta: t('create.createRoutine'),
          renderIcon: (active) => <RoutineGlyph color={glyphColor(active)} />,
        },
        {
          value: 'plan',
          title: t('create.plan'),
          description: t('create.planHint'),
          cta: t('create.createPlan'),
          renderIcon: (active) => <PlanGlyph color={glyphColor(active)} />,
        },
      ]}
    />
  );
}

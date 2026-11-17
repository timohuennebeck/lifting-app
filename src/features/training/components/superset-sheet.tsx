import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { ExerciseThumb } from '@/features/exercises/components/exercise-thumb';
import { useExerciseName } from '@/shared/data/exercises';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { CheckCircle } from '@/shared/ui/check-item';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

/** An exercise the superset can be made with. */
export interface SupersetCandidate {
  /** The routine or workout exercise's id. */
  key: string;
  exerciseId: string;
  /** Under its name, e.g. "Next exercise · 3 sets". */
  detail: string;
  /** Greyed out, e.g. a workout exercise already done. */
  disabled?: boolean;
}

export interface SupersetSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Under the title: what happens, e.g. which exercise becomes A1. */
  hint: string;
  candidates: SupersetCandidate[];
  /** Picked when the sheet opens. */
  initialKey: string | null;
  onConfirm: (key: string) => void;
  /** "Pick a new exercise": opens the exercise picker. */
  onPickNew?: () => void;
  /** Shown for an exercise already in a superset: takes it out. */
  onRemove?: () => void;
}

interface CandidateRowProps {
  candidate: SupersetCandidate;
  selected: boolean;
  onPress: () => void;
}

function CandidateRow({ candidate, selected, onPress }: CandidateRowProps) {
  const { i18n } = useTranslation();
  const name = useExerciseName(candidate.exerciseId, i18n.language);
  return (
    <PressableScale
      haptic="select"
      disabled={candidate.disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled: candidate.disabled }}
      onPress={onPress}
      className={cn('h-18 flex-row items-center gap-3.5 px-1', candidate.disabled && 'opacity-40')}
    >
      <ExerciseThumb exerciseId={candidate.exerciseId} name={name} className="h-14 w-10.5" />
      <View className="min-w-0 flex-1">
        <Text variant="label" numberOfLines={1} className="text-base leading-5">
          {name}
        </Text>
        <Text
          variant="caption"
          tone="subtle"
          numberOfLines={1}
          className="mt-0.5 font-inter-medium"
        >
          {candidate.detail}
        </Text>
      </View>
      <CheckCircle checked={selected} size={24} glyph={11} />
    </PressableScale>
  );
}

/** The sheet's content, mounted with it: the pick starts afresh each time it opens. */
function SupersetSheetBody({
  hint,
  candidates,
  initialKey,
  onConfirm,
  onPickNew,
  onRemove,
}: Omit<SupersetSheetProps, 'visible' | 'onClose'>) {
  const { t } = useTranslation('training');
  const [picked, setPicked] = useState(initialKey);
  return (
    <View>
      <Text variant="label" tone="subtle" className="-mt-2 px-1 pb-3 font-inter">
        {hint}
      </Text>
      <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
        {candidates.map((c) => (
          <CandidateRow
            key={c.key}
            candidate={c}
            selected={picked === c.key}
            onPress={() => setPicked(c.key)}
          />
        ))}
        {onPickNew ? (
          <PressableScale
            haptic="tap"
            onPress={onPickNew}
            className="h-16 flex-row items-center gap-3.5 px-1"
          >
            <View className="size-10.5 items-center justify-center rounded-full bg-control">
              <Icon name="plus" size={14} color={colors.fg} />
            </View>
            <Text variant="label" className="flex-1 text-base">
              {t('supersetSheet.pickNew')}
            </Text>
            <Icon name="chevron-right" size={7} color={colors.dim} />
          </PressableScale>
        ) : null}
      </ScrollView>
      <View className="gap-2.5 pt-3.5">
        <Button
          label={t('supersetSheet.confirm')}
          disabled={!picked}
          onPress={() => picked && onConfirm(picked)}
        />
        {onRemove ? (
          <Button label={t('supersetSheet.remove')} variant="secondary" onPress={onRemove} />
        ) : null}
      </View>
    </View>
  );
}

/**
 * "Superset with …": picks the exercise to do back to back with this one, from the others of the
 * routine or workout (or a new one from the picker).
 */
export function SupersetSheet({ visible, onClose, ...body }: SupersetSheetProps) {
  const { t } = useTranslation('training');
  return (
    <Sheet visible={visible} onClose={onClose} title={t('supersetSheet.title')}>
      <SupersetSheetBody {...body} />
    </Sheet>
  );
}

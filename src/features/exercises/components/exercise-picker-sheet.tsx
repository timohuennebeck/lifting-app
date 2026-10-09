import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Sheet } from '@/shared/ui/sheet';

import { ExerciseLibrary, ExerciseSearchBar } from './exercise-library';

export interface ExercisePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (exerciseId: string) => void;
  /** Already used exercises are listed under "Selected" with a check and can't be picked. */
  excludeIds?: string[];
  title?: string;
  /** Row icon: plus when adding (default), arrows when swapping an exercise. */
  mode?: 'add' | 'swap';
  /** Exercises behind the "Muscles worked" tiles; defaults to `excludeIds`. */
  muscleItems?: { exerciseId: string; sets: number }[];
}

/** The exercise library in a sheet: one tap picks an exercise (plans and templates). */
export function ExercisePickerSheet({
  visible,
  onClose,
  onSelect,
  excludeIds = [],
  title,
  mode = 'add',
  muscleItems,
}: ExercisePickerSheetProps) {
  const { t } = useTranslation('exercises');
  const [query, setQuery] = useState('');
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={title ?? t('picker.title')}
      snapPoints={['92%']}
      footer={<ExerciseSearchBar query={query} onChangeQuery={setQuery} onDone={onClose} />}
    >
      <ExerciseLibrary
        query={query}
        selectedIds={excludeIds}
        mode={mode}
        muscleItems={muscleItems}
        onPick={(id) => {
          onSelect(id);
          setQuery('');
        }}
      />
    </Sheet>
  );
}

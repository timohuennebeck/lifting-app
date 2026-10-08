import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { EXERCISE_IDS, type ExerciseId } from '@/shared/data/exercises';

import { type MuscleGroupId, primaryGroup, primaryMuscle } from '../lib/muscle-groups';

export interface ExerciseOption {
  id: ExerciseId;
  name: string;
  /** Muscle with the highest share, for grouping and subtitles. */
  primaryMuscle: string;
  group: MuscleGroupId;
  /** Upper-case first letter without accents, for the A–Z index. */
  letter: string;
}

// NFD splits "Ü" into "U" + combining mark, so the first char is the bare letter.
const letterOf = (name: string) => name.normalize('NFD').charAt(0).toUpperCase();

/** Localized, alphabetically sorted exercise list filtered by search text and muscle group. */
export function useExerciseSearch(query: string, group?: MuscleGroupId | null) {
  const { t, i18n } = useTranslation(['exercises', 'muscles']);
  return useMemo(() => {
    const q = query.trim().toLocaleLowerCase(i18n.language);
    return EXERCISE_IDS.map((id): ExerciseOption => {
      const muscle = primaryMuscle(id);
      const name = t(`exercises:${id}.name`);
      return {
        id,
        name,
        primaryMuscle: muscle ? t(`muscles:names.${muscle}`) : '',
        group: primaryGroup(id),
        letter: letterOf(name),
      };
    })
      .filter((o) => !q || o.name.toLocaleLowerCase(i18n.language).includes(q))
      .filter((o) => !group || o.group === group)
      .sort((a, b) => a.name.localeCompare(b.name, i18n.language));
  }, [query, group, t, i18n.language]);
}

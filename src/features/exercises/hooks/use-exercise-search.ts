import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { EXERCISE_IDS, type ExerciseId, getExercise } from '@/shared/data/exercises';

export interface ExerciseOption {
  id: ExerciseId;
  name: string;
  /** Muscle with the highest share, for grouping and subtitles. */
  primaryMuscle: string;
}

/** Localized, alphabetically sorted exercise list filtered by a search string. */
export function useExerciseSearch(query: string) {
  const { t, i18n } = useTranslation(['exercises', 'muscles']);
  return useMemo(() => {
    const q = query.trim().toLocaleLowerCase(i18n.language);
    return EXERCISE_IDS.map((id): ExerciseOption => {
      const muscles = Object.entries(getExercise(id)?.muscles ?? {}).sort((a, b) => b[1] - a[1]);
      return {
        id,
        name: t(`exercises:${id}.name`),
        primaryMuscle: muscles[0] ? t(`muscles:names.${muscles[0][0] as 'chest'}`) : '',
      };
    })
      .filter((o) => !q || o.name.toLocaleLowerCase(i18n.language).includes(q))
      .sort((a, b) => a.name.localeCompare(b.name, i18n.language));
  }, [query, t, i18n.language]);
}

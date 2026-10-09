import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { activeExerciseIds, exerciseName, useCatalogStore } from '@/shared/data/exercises';

import { type MuscleGroupId, primaryGroup } from '../lib/muscle-groups';

export interface ExerciseOption {
  id: string;
  name: string;
  group: MuscleGroupId;
  /** Upper-case first letter without accents, for the A–Z index. */
  letter: string;
}

// NFD splits "Ü" into "U" + combining mark, so the first char is the bare letter.
const letterOf = (name: string) => name.normalize('NFD').charAt(0).toUpperCase();

/** Localized, alphabetically sorted exercise list filtered by search text and muscle group. */
export function useExerciseSearch(query: string, group?: MuscleGroupId | null) {
  const { i18n } = useTranslation();
  const rows = useCatalogStore((s) => s.rows);
  return useMemo(() => {
    const q = query.trim().toLocaleLowerCase(i18n.language);
    return activeExerciseIds(rows)
      .map((id): ExerciseOption => {
        const name = exerciseName(id, i18n.language);
        return {
          id,
          name,
          group: primaryGroup(id),
          letter: letterOf(name),
        };
      })
      .filter((o) => !q || o.name.toLocaleLowerCase(i18n.language).includes(q))
      .filter((o) => !group || o.group === group)
      .sort((a, b) => a.name.localeCompare(b.name, i18n.language));
  }, [query, group, i18n.language, rows]);
}

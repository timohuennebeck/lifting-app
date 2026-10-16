import { useDeferredValue, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  activeExerciseIds,
  exerciseName,
  useCatalogStore,
  useCustomExerciseStore,
} from '@/shared/data/exercises';
import { type MuscleGroupId, primaryGroup } from '@/shared/data/muscle-groups';

import { indexLetterOf } from '../lib/index-letters';

export interface ExerciseOption {
  id: string;
  name: string;
  group: MuscleGroupId;
  /** Its entry in the index (see `indexLetterOf`). */
  letter: string;
  /** The name in lower case, compared with what is typed. */
  searchKey: string;
}

/** One collator per language: `localeCompare` with a locale sets one up on every call. */
const collators = new Map<string, Intl.Collator>();
const collatorFor = (language: string) => {
  let collator = collators.get(language);
  if (!collator) {
    collator = new Intl.Collator(language);
    collators.set(language, collator);
  }
  return collator;
};

/** Localized, alphabetically sorted exercise list filtered by search text and muscle group. */
export function useExerciseSearch(query: string, group?: MuscleGroupId | null) {
  const { i18n } = useTranslation();
  const rows = useCatalogStore((s) => s.rows);
  const custom = useCustomExerciseStore((s) => s.exercises);
  // Names, groups, order and search keys change with the language or the exercises, not with
  // each keystroke.
  const options = useMemo(() => {
    const { compare } = collatorFor(i18n.language);
    return activeExerciseIds(rows, custom)
      .map((id): ExerciseOption => {
        const name = exerciseName(id, i18n.language);
        return {
          id,
          name,
          group: primaryGroup(id),
          letter: indexLetterOf(name, i18n.language),
          searchKey: name.toLocaleLowerCase(i18n.language),
        };
      })
      .sort((a, b) => compare(a.name, b.name));
  }, [i18n.language, rows, custom]);
  // Typing stays responsive: the list filters right after, at a lower priority.
  const deferredQuery = useDeferredValue(query);
  return useMemo(() => {
    const q = deferredQuery.trim().toLocaleLowerCase(i18n.language);
    return options.filter((o) => (!q || o.searchKey.includes(q)) && (!group || o.group === group));
  }, [options, deferredQuery, group, i18n.language]);
}

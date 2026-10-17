import { useDeferredValue, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  activeExerciseIds,
  exerciseName,
  useCatalogStore,
  useCustomExerciseStore,
} from '@/shared/data/exercises';
import { type MuscleGroupId, primaryGroup } from '@/shared/data/muscle-groups';
import { APP_LANGUAGES } from '@/shared/i18n/resources';

import { indexLetterOf } from '../lib/index-letters';
import { searchKeys, searchText } from '../lib/search-text';

interface SearchName {
  name: string;
  /** The name as the search compares it (`searchKeys`). */
  key: string;
}

export interface ExerciseOption {
  id: string;
  name: string;
  group: MuscleGroupId;
  /** Its entry in the index (see `indexLetterOf`). */
  letter: string;
  /** Its names in every app language, the app language's first, compared with what is typed. */
  searchNames: SearchName[];
  /** The name in another language the search found it by, shown under its own. */
  foundAs?: string;
}

/** Each name's search keys once, the first name's first. */
function searchNamesOf(names: (string | undefined)[]) {
  const seen = new Set<string>();
  const result: SearchName[] = [];
  for (const name of names) {
    if (!name) continue;
    for (const key of searchKeys(name)) {
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({ name, key });
    }
  }
  return result;
}

/** Options found by another language's name, so a row keeps its object while the user types. */
const foundCache = new WeakMap<ExerciseOption, Map<string, ExerciseOption>>();

function foundAs(option: ExerciseOption, name: string) {
  let found = foundCache.get(option);
  if (!found) {
    found = new Map();
    foundCache.set(option, found);
  }
  let result = found.get(name);
  if (!result) {
    result = { ...option, foundAs: name };
    found.set(name, result);
  }
  return result;
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

/**
 * Localized, alphabetically sorted exercise list filtered by search text and muscle group. The
 * text finds an exercise by its name in any app language, ignoring accents, spaces and dashes.
 */
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
        const names = rows[id] ? APP_LANGUAGES.map((l) => rows[id].name[l]) : [];
        return {
          id,
          name,
          group: primaryGroup(id),
          letter: indexLetterOf(name, i18n.language),
          searchNames: searchNamesOf([name, ...names]),
        };
      })
      .sort((a, b) => compare(a.name, b.name));
  }, [i18n.language, rows, custom]);
  // Typing stays responsive: the list filters right after, at a lower priority.
  const deferredQuery = useDeferredValue(query);
  return useMemo(() => {
    const q = searchText(deferredQuery);
    return options.flatMap((o) => {
      if (group && o.group !== group) return [];
      if (!q) return [o];
      const hit = o.searchNames.find((n) => n.key.includes(q));
      if (!hit) return [];
      return [hit.name === o.name ? o : foundAs(o, hit.name)];
    });
  }, [options, deferredQuery, group]);
}

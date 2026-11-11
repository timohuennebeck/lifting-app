import { useEffect, useEffectEvent, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { type ExerciseSearchContext, track } from '@/shared/lib/posthog';

import { countExerciseMatches } from './use-exercise-search';

/** A search counts once the user stopped typing this long. */
const SETTLE_MS = 1200;
const MIN_LENGTH = 2;
const MAX_LENGTH = 60;

/**
 * Sends `exercise:search` for each search text the user settles on: after a pause in typing,
 * when the field is cleared (also by a pick) or when the page closes. Each text once in a row.
 */
export function useSearchTracking(query: string, context: ExerciseSearchContext) {
  const { i18n } = useTranslation();
  const pending = useRef('');
  const sent = useRef('');

  const flush = useEffectEvent(() => {
    const text = pending.current;
    pending.current = '';
    if (text.length < MIN_LENGTH || text === sent.current) return;
    sent.current = text;
    track('exercise:search', {
      query: text,
      result_count: countExerciseMatches(text, i18n.language),
      context,
      language: i18n.language,
    });
  });

  useEffect(() => {
    const text = query.trim().slice(0, MAX_LENGTH);
    if (!text) return flush();
    pending.current = text;
    const timer = setTimeout(() => flush(), SETTLE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // The page closing ends the search too, e.g. right after a pick.
  useEffect(() => () => flush(), []);
}

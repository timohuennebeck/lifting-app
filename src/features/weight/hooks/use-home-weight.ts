import { useMemo } from 'react';

import { useUnits } from '@/shared/data/profile';
import { useWeightEntries } from '@/shared/data/weight-entries';
import { useToday } from '@/shared/hooks/use-today';
import { toIsoDate } from '@/shared/lib/date';

import { homeWeight } from '../lib/home-weight';
import { withTrend } from '../lib/trend';

/** The weigh-ins and their trend as the home screen's weight boxes show them. */
export function useHomeWeight() {
  const units = useUnits();
  const { entries, isLoading } = useWeightEntries();
  const today = toIsoDate(new Date(useToday()));
  const data = useMemo(() => homeWeight(withTrend(entries), today), [entries, today]);
  return { data, units, isLoading };
}

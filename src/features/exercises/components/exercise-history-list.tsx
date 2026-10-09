import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { ExerciseHistoryEntry } from '@/shared/data/workouts';
import { cn } from '@/shared/lib/cn';
import { minutesBetween } from '@/shared/lib/date';
import { formatDate, formatNumber, formatSet, type UnitSystem } from '@/shared/lib/format';
import { Text } from '@/shared/ui/text';

import { HistoryRow } from './history-row';

export interface ExerciseHistoryListProps {
  entries: ExerciseHistoryEntry[];
  units: UnitSystem;
}

/** Past sessions of one exercise, grouped by month; tap a session to see its sets. */
export function ExerciseHistoryList({ entries, units }: ExerciseHistoryListProps) {
  const { t } = useTranslation('exercises');
  const [open, setOpen] = useState<string | null>(null);
  const months = entries.map((e) =>
    formatDate(new Date(e.startedAt), { month: 'long', year: 'numeric' }),
  );

  return (
    <View className="-mx-2">
      {entries.map((entry, i) => {
        const minutes = minutesBetween(entry.startedAt, entry.finishedAt);
        const prs = entry.sets.filter((s) => s.isPr).length;
        const expanded = open === entry.workoutId;
        return (
          <View key={entry.workoutId}>
            {months[i] !== months[i - 1] ? (
              <Text variant="overline" className="px-3 pt-4.5 pb-1.5 text-[11px] text-dim">
                {months[i]}
              </Text>
            ) : null}
            <HistoryRow
              className={cn('rounded-[20px] px-2', i === 0 && 'bg-surface')}
              day={new Date(entry.startedAt).getDate()}
              latest={i === 0}
              open={expanded}
              onToggle={() => setOpen(expanded ? null : entry.workoutId)}
              title={formatSet(entry.topSet, units)}
              stats={
                <>
                  {minutes ? <Metric label={t('detail.minutes')} value={String(minutes)} /> : null}
                  {entry.volumeKg > 0 ? (
                    <Metric label={t('detail.volume')} value={formatNumber(entry.volumeKg, 0)} />
                  ) : null}
                  <Metric label={t('detail.pr')} value={String(prs)} highlight={prs > 0} />
                </>
              }
              sets={entry.sets}
              renderSet={(s) => (
                <>
                  <Text variant="label" className="flex-1 text-lg text-fg-soft">
                    {formatSet(s, units)}
                  </Text>
                  {s.rir !== null ? (
                    <View
                      className={cn(
                        'size-6 items-center justify-center rounded-full',
                        s.rir <= 1 ? 'bg-[#E5484D]' : 'bg-[#F0B13A]',
                      )}
                    >
                      <Text className="font-inter-bold text-xs text-on-accent">{s.rir}</Text>
                    </View>
                  ) : null}
                </>
              )}
            />
          </View>
        );
      })}
    </View>
  );
}

interface MetricProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function Metric({ label, value, highlight }: MetricProps) {
  return (
    <View className="flex-row items-center gap-1.5">
      <Text
        className={cn(
          'font-inter-bold text-[10px] tracking-[0.8px]',
          highlight ? 'text-accent' : 'text-subtle',
        )}
      >
        {label}
      </Text>
      <Text variant="caption" className="text-sm text-fg-2">
        {value}
      </Text>
    </View>
  );
}

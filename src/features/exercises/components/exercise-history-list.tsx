import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { ExerciseHistoryEntry } from '@/shared/data/workouts';
import { cn } from '@/shared/lib/cn';
import { minutesBetween } from '@/shared/lib/date';
import { formatDate, formatNumber, formatSet, type UnitSystem } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

export interface ExerciseHistoryListProps {
  entries: ExerciseHistoryEntry[];
  units: UnitSystem;
}

/** Past sessions of one exercise, grouped by month; tap a session to see its sets. */
export function ExerciseHistoryList({ entries, units }: ExerciseHistoryListProps) {
  const { t } = useTranslation('exercises');
  const [open, setOpen] = useState<string | null>(null);

  return (
    <View className="-mx-2">
      {entries.map((entry, i) => {
        const date = new Date(entry.startedAt);
        const month = formatDate(date, { month: 'long', year: 'numeric' });
        const prevMonth =
          i > 0
            ? formatDate(new Date(entries[i - 1].startedAt), { month: 'long', year: 'numeric' })
            : null;
        const top = entry.sets.reduce(
          (best, s) => (s.weightKg > best.weightKg ? s : best),
          entry.sets[0],
        );
        const volume = entry.sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
        const minutes = minutesBetween(entry.startedAt, entry.finishedAt);
        const prs = entry.sets.filter((s) => s.isPr).length;
        const expanded = open === entry.workoutId;
        return (
          <View key={entry.workoutId}>
            {month !== prevMonth ? (
              <Text variant="overline" className="px-3 pt-[18px] pb-1.5 text-[11px] text-dim">
                {month}
              </Text>
            ) : null}
            <View className={cn('rounded-[20px] px-2', i === 0 && 'bg-surface')}>
              <PressableScale
                haptic="select"
                accessibilityState={{ expanded }}
                onPress={() => setOpen(expanded ? null : entry.workoutId)}
                className="h-[72px] flex-row items-center gap-3.5"
              >
                <View
                  className={cn(
                    'size-10 items-center justify-center rounded-full',
                    i === 0 ? 'bg-accent' : 'bg-elevated',
                  )}
                >
                  <Text variant="label" tone={i === 0 ? 'onAccent' : 'default'}>
                    {date.getDate()}
                  </Text>
                </View>
                <View className="min-w-0 flex-1 gap-1.5">
                  <Text variant="label" className="text-lg leading-[22px]">
                    {top ? formatSet(top.weightKg, top.reps, units) : '–'}
                  </Text>
                  <View className="flex-row items-center gap-3.5">
                    {minutes ? (
                      <Metric label={t('detail.minutes')} value={String(minutes)} />
                    ) : null}
                    <Metric label={t('detail.volume')} value={formatNumber(volume, 0)} />
                    <Metric label={t('detail.pr')} value={String(prs)} highlight={prs > 0} />
                  </View>
                </View>
                <View
                  className="size-7 items-center justify-center rounded-full bg-[#1A1A1A]"
                  style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
                >
                  <Icon name="chevron-down" size={12} color={colors.subtle} />
                </View>
              </PressableScale>
              {expanded ? (
                <View className="gap-0.5 px-1 pb-2.5">
                  {entry.sets.map((s, k) => (
                    <View key={k} className="h-11 flex-row items-center gap-3">
                      <View className="size-7 items-center justify-center rounded-full bg-elevated">
                        <Text variant="caption">{k + 1}</Text>
                      </View>
                      <Text variant="label" className="flex-1 text-lg text-[#E6E6E1]">
                        {formatSet(s.weightKg, s.reps, units)}
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
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
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

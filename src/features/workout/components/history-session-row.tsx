import { View } from 'react-native';

import { HistoryRow } from '@/features/exercises/components/history-row';
import type { ExerciseHistoryEntry } from '@/shared/data/workouts';
import { minutesBetween } from '@/shared/lib/date';
import {
  formatDate,
  formatSet,
  formatWeight,
  formatWeightValue,
  type UnitSystem,
} from '@/shared/lib/format';
import { colors, useAccentColor } from '@/shared/lib/theme';
import { Icon, type IconName } from '@/shared/ui/icon';
import { RirBadge } from '@/shared/ui/rir-badge';
import { Text } from '@/shared/ui/text';

interface StatProps {
  icon: IconName;
  value: string;
  color?: string;
}

function Stat({ icon, value, color = colors.subtle }: StatProps) {
  return (
    <View className="flex-row items-center gap-1.5">
      <Icon name={icon} size={icon === 'dumbbell' ? 18 : 13} color={color} />
      <Text variant="label" tone="secondary" className="text-sm leading-4.5">
        {value}
      </Text>
    </View>
  );
}

export interface HistorySessionRowProps {
  session: ExerciseHistoryEntry;
  latest: boolean;
  open: boolean;
  units: UnitSystem;
  minLabel: string;
  onToggle: () => void;
}

/** Session with MIN · VOL · top set; expands to every set with its RIR (design 03·C·2H·V5). */
export function HistorySessionRow({
  session,
  latest,
  open,
  units,
  minLabel,
  onToggle,
}: HistorySessionRowProps) {
  const accent = useAccentColor();
  const top = session.topSet;

  return (
    <HistoryRow
      className="px-2"
      activeScale={0.99}
      day={formatDate(new Date(session.startedAt), { day: 'numeric' })}
      latest={latest}
      open={open}
      onToggle={onToggle}
      title={session.name}
      stats={
        <>
          <Stat
            icon="timer"
            value={`${minutesBetween(session.startedAt, session.finishedAt)} ${minLabel}`}
          />
          {/* Volume only exists for weighted sets. */}
          {session.volumeKg > 0 ? (
            <Stat icon="dumbbell" value={formatWeight(session.volumeKg, units)} />
          ) : null}
          <Stat
            icon="star"
            color={session.hasPr ? accent : colors.dim}
            value={
              top.weightKg != null && top.reps != null
                ? `${formatWeightValue(top.weightKg, units)} × ${top.reps}`
                : formatSet(top, units)
            }
          />
        </>
      }
      sets={session.sets}
      renderSet={(set) => (
        <>
          <Text variant="bodyStrong" className="flex-1 text-lg leading-5.5">
            {formatSet(set, units)}
          </Text>
          {set.rir != null ? <RirBadge rir={set.rir} size={24} /> : null}
        </>
      )}
    />
  );
}

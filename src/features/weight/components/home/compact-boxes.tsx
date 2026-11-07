import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useWidth } from '@/shared/hooks/use-width';
import { addDays, fromIsoDate, startOfWeek, toIsoDate } from '@/shared/lib/date';
import { formatDate, type UnitSystem, weightUnit } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { formatBodyWeight, formatChange } from '../../lib/format';
import { changeOver, type HomeWeight, lastDays } from '../../lib/home-weight';
import { ChangeText, Overline, WeightCard, WeightValue } from './parts';
import { TrendLine } from './trend-line';

export interface WeightBoxProps {
  data: HomeWeight;
  units: UnitSystem;
}

/** Compact 1, sparkline row: the trend and its weekly change, 30 days of it as a line beside. */
export function CompactSpark({ data, units }: WeightBoxProps) {
  const { t } = useTranslation('weight');
  return (
    <WeightCard className="flex-row items-center gap-4 px-4 py-3.5">
      <View className="flex-1 gap-1">
        <Overline>{t('home.title')}</Overline>
        <WeightValue kg={data.latest.trendKg} units={units} />
        <ChangeText
          kg={changeOver(data, 7)}
          units={units}
          suffix={t('history.days', { count: 7 })}
        />
      </View>
      <TrendLine series={lastDays(data.series, 30)} width={124} height={52} />
    </WeightCard>
  );
}

/** Compact 2, change first: the week's change as a neon pill, the last 14 weigh-ins as bars. */
export function CompactDelta({ data, units }: WeightBoxProps) {
  const { t } = useTranslation('weight');
  const week = changeOver(data, 7);
  const recent = data.points.slice(-14);
  const lo = Math.min(...recent.map((p) => p.weightKg));
  const hi = Math.max(...recent.map((p) => p.weightKg));
  const span = Math.max(hi - lo, 0.6);
  return (
    <WeightCard className="gap-3 px-4 py-3.5">
      <View className="flex-row items-center justify-between">
        <View className="gap-1">
          <Overline>{t('home.title')}</Overline>
          <WeightValue kg={data.latest.trendKg} units={units} />
        </View>
        <View className="items-end gap-1">
          <View className="rounded-full bg-accent px-3 py-1.5">
            <Text className="font-inter-semibold text-[15px] text-on-accent tabular-nums">
              {week === null ? '–' : `${formatChangeShort(week, units)}`}
            </Text>
          </View>
          <Text className="font-inter text-xs text-subtle">{t('home.thisWeek')}</Text>
        </View>
      </View>
      <View className="h-7 flex-row items-end gap-1">
        {recent.map((p, i) => (
          <View
            key={p.id}
            className={cn(
              'flex-1 rounded-sm',
              i === recent.length - 1 ? 'bg-accent' : 'bg-control',
            )}
            style={{ height: 6 + ((p.weightKg - lo) / span) * 22 }}
          />
        ))}
      </View>
    </WeightCard>
  );
}

/** Compact 3, range: where today's trend sits between the 30-day low and high. */
export function CompactRange({ data, units }: WeightBoxProps) {
  const { t } = useTranslation('weight');
  const month = lastDays(data.series, 30);
  const lo = Math.min(...month);
  const hi = Math.max(...month);
  const at = hi - lo < 0.05 ? 0.5 : (data.latest.trendKg - lo) / (hi - lo);
  return (
    <WeightCard className="gap-3 px-4 py-3.5">
      <View className="flex-row items-end justify-between">
        <View className="gap-1">
          <Overline>{t('home.title')}</Overline>
          <WeightValue kg={data.latest.trendKg} units={units} />
        </View>
        <ChangeText
          kg={changeOver(data, 30)}
          units={units}
          suffix={t('history.days', { count: 30 })}
        />
      </View>
      <View className="gap-1.5">
        <View className="h-1.5 justify-center rounded-full bg-control">
          <View
            className="absolute size-3.5 rounded-full border-2 border-surface bg-accent"
            style={{ left: `${at * 100}%`, marginLeft: -7 }}
          />
        </View>
        <View className="flex-row justify-between">
          <Text className="font-inter text-xs text-subtle tabular-nums">
            {t('home.low', { value: formatBodyWeight(lo, units) })}
          </Text>
          <Text className="font-inter text-xs text-subtle tabular-nums">
            {t('home.high', { value: formatBodyWeight(hi, units) })}
          </Text>
        </View>
      </View>
    </WeightCard>
  );
}

/** Compact 4, this week: a dot per day weighed in, today ringed, a "+" to log today. */
export function CompactWeek({ data, units }: WeightBoxProps) {
  const { t } = useTranslation('weight');
  const monday = startOfWeek(fromIsoDate(data.today));
  const logged = new Set(data.points.map((p) => p.date));
  const days = Array.from({ length: 7 }, (_, i) => toIsoDate(addDays(monday, i)));
  return (
    <WeightCard className="flex-row items-center gap-3 px-4 py-3.5">
      <View className="gap-1">
        <WeightValue kg={data.latest.trendKg} units={units} size={24} />
        <ChangeText kg={changeOver(data, 7)} units={units} />
      </View>
      <View className="flex-1 flex-row justify-between">
        {days.map((day) => (
          <View key={day} className="items-center gap-1.5">
            <Text className="font-inter-semibold text-[10px] text-subtle uppercase">
              {formatDate(fromIsoDate(day), { weekday: 'narrow' })}
            </Text>
            <View
              className={cn(
                'size-3 rounded-full',
                logged.has(day) ? 'bg-accent' : day > data.today ? 'bg-chip' : 'bg-control',
                day === data.today && 'border-2 border-fg',
              )}
            />
          </View>
        ))}
      </View>
      <PressableScale
        haptic="press"
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={t('history.add')}
        onPress={() => router.push('/body-weight/today')}
        className="size-9 items-center justify-center rounded-full bg-control"
      >
        <Icon name="plus" size={16} color={colors.fg} />
      </PressableScale>
    </WeightCard>
  );
}

/** Compact 5, backdrop: the 30-day trend fills the box behind the number. */
export function CompactBackdrop({ data, units }: WeightBoxProps) {
  const { t } = useTranslation('weight');
  const [width, onLayout] = useWidth();
  return (
    <WeightCard className="h-24">
      <View onLayout={onLayout} className="absolute inset-x-0 bottom-0">
        <TrendLine
          series={lastDays(data.series, 30)}
          width={width}
          height={40}
          area
          endDot={false}
          pad={4}
        />
      </View>
      <View className="flex-row items-start justify-between px-4 pt-3.5">
        <View className="gap-1">
          <Overline>{t('home.title')}</Overline>
          <WeightValue kg={data.latest.trendKg} units={units} accent />
        </View>
        <ChangeText
          kg={changeOver(data, 30)}
          units={units}
          suffix={t('history.days', { count: 30 })}
        />
      </View>
    </WeightCard>
  );
}

/** "−0,4 kg" for the pill. */
const formatChangeShort = (kg: number, units: UnitSystem) =>
  `${formatChange(kg, units)} ${weightUnit(units)}`;

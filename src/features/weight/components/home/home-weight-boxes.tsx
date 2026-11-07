import { router } from 'expo-router';
import { type ComponentType, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { useHomeWeight } from '../../hooks/use-home-weight';
import {
  CompactBackdrop,
  CompactDelta,
  CompactRange,
  CompactSpark,
  CompactWeek,
  type WeightBoxProps,
} from './compact-boxes';
import { LargeArea, LargeCalendar, LargeNumber, LargePeriods, LargeWeeks } from './large-boxes';

type Variants = { name: string; Component: ComponentType<WeightBoxProps> }[];

/** The five takes on each box; the first is shown, the others can be tried in a dev build. */
const COMPACT: Variants = [
  { name: 'Sparkline', Component: CompactSpark },
  { name: 'Weekly pill', Component: CompactDelta },
  { name: '30-day range', Component: CompactRange },
  { name: 'This week', Component: CompactWeek },
  { name: 'Backdrop', Component: CompactBackdrop },
];
const LARGE: Variants = [
  { name: 'Area chart', Component: LargeArea },
  { name: 'Periods', Component: LargePeriods },
  { name: 'Weeks', Component: LargeWeeks },
  { name: 'Big number', Component: LargeNumber },
  { name: 'Calendar', Component: LargeCalendar },
];

/** Dev builds only: which variant is shown, tap for the next one. */
function DevSwitch({
  label,
  index,
  count,
  onNext,
}: {
  label: string;
  index: number;
  count: number;
  onNext: () => void;
}) {
  if (!__DEV__) return null;
  return (
    <Pressable onPress={onNext} className="mb-1.5 self-start rounded-full bg-control px-3 py-1">
      <Text variant="caption" className="text-[11px]">{`${index + 1}/${count} ${label} ›`}</Text>
    </Pressable>
  );
}

/** Before the first weigh-in: one box asking for it. */
function EmptyBox() {
  const { t } = useTranslation('weight');
  return (
    <PressableScale
      haptic="press"
      activeScale={0.98}
      onPress={() => router.push('/body-weight/today')}
      className="flex-row items-center gap-3 rounded-[18px] bg-surface px-4 py-4"
    >
      <View className="size-10 items-center justify-center rounded-full bg-control">
        <Icon name="scale" size={18} color={colors.fg} />
      </View>
      <Text className="flex-1 font-inter text-[13px] leading-[18px] text-muted">
        {t('home.empty')}
      </Text>
      <Icon name="plus" size={16} color={colors.accent} />
    </PressableScale>
  );
}

/** The home screen's two weight boxes, compact and large: the trend and how it moves. */
export function HomeWeightBoxes({ className }: { className?: string }) {
  const { data, units, isLoading } = useHomeWeight();
  const [compact, setCompact] = useState(0);
  const [large, setLarge] = useState(0);
  if (isLoading) return null;
  if (!data) {
    return (
      <View className={className}>
        <EmptyBox />
      </View>
    );
  }
  const Compact = COMPACT[compact].Component;
  const Large = LARGE[large].Component;
  return (
    <View className={className}>
      <DevSwitch
        label={COMPACT[compact].name}
        index={compact}
        count={COMPACT.length}
        onNext={() => setCompact((v) => (v + 1) % COMPACT.length)}
      />
      <Compact data={data} units={units} />
      <View className="h-3" />
      <DevSwitch
        label={LARGE[large].name}
        index={large}
        count={LARGE.length}
        onNext={() => setLarge((v) => (v + 1) % LARGE.length)}
      />
      <Large data={data} units={units} />
    </View>
  );
}

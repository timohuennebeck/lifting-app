import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { type MuscleShare, muscleShares } from '@/shared/data/muscles';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { MUSCLE_CARDS, MuscleMap, type MuscleId } from '@/shared/ui/muscle-map';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

/** Where the circles behind the front one sit: further right, each a size smaller. */
const BEHIND = [
  { left: 39, size: 46 },
  { left: 70, size: 46 },
] as const;
const FRONT_SIZE = 56;
/** Width of three circles, kept for fewer too so the titles line up. */
const STACK_WIDTH = 116;

function MuscleCircle({ muscle, front }: { muscle: MuscleId | null; front: boolean }) {
  const card = MUSCLE_CARDS[muscle ?? 'chest'];
  return (
    <View
      className={cn(
        'size-full overflow-hidden rounded-full bg-elevated',
        // The front circle is ringed in neon; the others are cut out of the card behind it.
        front ? 'border-[1.5px] border-accent' : 'border-2 border-surface',
      )}
    >
      <MuscleMap
        view={card.view}
        viewBox={card.viewBox}
        selected={muscle ? [muscle] : []}
        accent={front ? colors.accent : colors.fg2}
        fit="cover"
      />
    </View>
  );
}

/** The three muscles worked most as overlapping circles, the biggest share in front. */
function MuscleStack({ shares }: { shares: MuscleShare[] }) {
  const [first, ...rest] = shares.slice(0, 3);
  return (
    <View
      style={{ width: STACK_WIDTH, height: FRONT_SIZE }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/* Drawn back to front. */}
      {rest
        .map((share, i) => ({ share, ...BEHIND[i] }))
        .reverse()
        .map(({ share, left, size }) => (
          <View
            key={share.muscle}
            className="absolute"
            style={{ left, top: (FRONT_SIZE - size) / 2, width: size, height: size }}
          >
            <MuscleCircle muscle={share.muscle} front={false} />
          </View>
        ))}
      {/* Without exercises yet: one empty circle. */}
      <View className="absolute top-0 left-0" style={{ width: FRONT_SIZE, height: FRONT_SIZE }}>
        <MuscleCircle muscle={first?.muscle ?? null} front={!!first} />
      </View>
    </View>
  );
}

export interface TemplateRowProps {
  name: string;
  minutes: number;
  exerciseCount: number;
  /** Exercise ids with their set counts, for the muscles. */
  items: { exerciseId: string; sets: number }[];
  onPress: () => void;
  onStart: () => void;
  /** "⋯": rename or delete. */
  onMore: () => void;
  starting?: boolean;
}

/**
 * Template card: its top muscles as circles, the name, the muscle worked most with its share,
 * duration and exercise count; "⋯" (rename, delete) and a quick-start play button.
 */
export function TemplateRow({
  name,
  minutes,
  exerciseCount,
  items,
  onPress,
  onStart,
  onMore,
  starting,
}: TemplateRowProps) {
  const { t } = useTranslation(['training', 'muscles']);
  const shares = muscleShares(items);
  const top = shares[0];
  const focus = top ? `${t(`muscles:names.${top.muscle}`)} ${top.percent} %` : null;
  const meta = t('training:list.meta', { count: exerciseCount, minutes });

  return (
    <PressableScale
      haptic="none"
      activeScale={0.98}
      accessibilityRole="button"
      accessibilityLabel={[name, focus, meta].filter(Boolean).join(', ')}
      onPress={onPress}
      className="flex-row items-center gap-3.5 rounded-[22px] bg-surface py-3.5 pr-3 pl-2.5"
    >
      <MuscleStack shares={shares} />
      <View className="min-w-0 flex-1">
        <Text variant="bodyStrong" numberOfLines={1}>
          {name}
        </Text>
        {focus ? (
          <Text variant="caption" tone="accent" numberOfLines={1} className="mt-0.5">
            {focus}
          </Text>
        ) : null}
        <Text
          variant="caption"
          tone="subtle"
          numberOfLines={1}
          className="mt-0.5 font-inter-medium"
        >
          {meta}
        </Text>
      </View>
      <View className="flex-row items-center gap-0.5">
        <PressableScale
          haptic="tap"
          hitSlop={8}
          accessibilityLabel={t('training:list.more', { name })}
          onPress={onMore}
          className="h-10 w-6 items-center justify-center"
        >
          <Icon name="more" size={14} color={colors.subtle} />
        </PressableScale>
        <PressableScale
          haptic="press"
          hitSlop={4}
          accessibilityLabel={t('training:list.start', { name })}
          onPress={onStart}
          disabled={starting}
          className="size-10 items-center justify-center rounded-full bg-elevated"
        >
          {starting ? (
            <ActivityIndicator size="small" color={colors.fg} />
          ) : (
            <Icon name="play" size={12} />
          )}
        </PressableScale>
      </View>
    </PressableScale>
  );
}

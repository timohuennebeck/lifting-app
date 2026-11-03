import { View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

export interface SectionTitleProps {
  children: string;
  /** A link on the right, e.g. "Alle anzeigen". */
  action?: { label: string; onPress: () => void };
  /** First on the page: less space above. */
  first?: boolean;
  /** A tap on the title folds the group under it away and back; a chevron after it shows which. */
  fold?: { folded: boolean; onToggle: () => void };
}

/** Points down while the group shows, right while it is folded away. */
function FoldChevron({ folded }: { folded: boolean }) {
  const turn = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(folded ? '-90deg' : '0deg', { duration: 200 }) }],
  }));
  return (
    <Animated.View style={turn}>
      <Icon name="chevron-down" size={11} color={colors.subtle} />
    </Animated.View>
  );
}

/** Overline over a group on the Training tab and the Einzeltrainings page. */
export function SectionTitle({ children, action, first, fold }: SectionTitleProps) {
  const title = (
    <Text variant="overline" tone="subtle" className="text-[11px]">
      {children}
    </Text>
  );
  return (
    <View className={cn('flex-row items-end justify-between px-5 pb-2.5', first ? 'pt-2' : 'pt-8')}>
      {fold ? (
        <PressableScale
          haptic="select"
          hitSlop={10}
          accessibilityRole="button"
          accessibilityState={{ expanded: !fold.folded }}
          onPress={fold.onToggle}
          className="flex-row items-center gap-1.5"
        >
          {title}
          <FoldChevron folded={fold.folded} />
        </PressableScale>
      ) : (
        title
      )}
      {action ? (
        <PressableScale haptic="tap" hitSlop={10} onPress={action.onPress}>
          <Text variant="caption" tone="accent">
            {action.label}
          </Text>
        </PressableScale>
      ) : null}
    </View>
  );
}

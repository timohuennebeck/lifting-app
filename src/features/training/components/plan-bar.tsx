import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, useAccentColor } from '@/shared/lib/theme';
import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import type { PlanItem } from '../data/use-plan-progress';

const SLOT = 52;

export interface PlanBarProps {
  items: PlanItem[];
  currentId: string;
  onSelect: (templateId: string) => void;
  onAdd: () => void;
}

/** Dashed ring around the slot number for trainings still to do. */
function DashedRing({ color }: { color: string }) {
  return (
    <Svg
      width={38}
      height={38}
      viewBox="0 0 38 38"
      style={{ position: 'absolute', left: -3, top: -3, transform: [{ rotate: '-90deg' }] }}
    >
      <Circle
        cx={19}
        cy={19}
        r={17.5}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="13.3 5"
      />
    </Svg>
  );
}

/** Plan strip of the collection's trainings: done, next (preselected) and upcoming (03·0b). */
export function PlanBar({ items, currentId, onSelect, onAdd }: PlanBarProps) {
  const { t } = useTranslation('training');
  const accent = useAccentColor();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="grow-0"
      contentContainerClassName="px-3.5 pt-3.5 pb-4"
    >
      {items.map((item) => {
        const current = item.id === currentId;
        return (
          <PressableScale
            key={item.id}
            haptic="select"
            accessibilityRole="tab"
            accessibilityState={{ selected: current }}
            accessibilityLabel={item.name}
            onPress={() => onSelect(item.id)}
            className="items-center gap-2 px-0.5"
            style={{ width: SLOT }}
          >
            <Text
              variant="caption"
              numberOfLines={1}
              className={cn(current ? 'text-fg' : 'font-inter-medium text-subtle')}
            >
              {item.name}
            </Text>
            {item.state === 'done' ? (
              <View
                className="size-8 items-center justify-center rounded-full bg-accent"
                style={{ boxShadow: `0 0 0 3px ${colors.bg}, 0 0 0 4.5px ${accent}80` }}
              >
                <Icon name="check" size={14} color={colors.onAccent} />
              </View>
            ) : (
              <View className="size-8 items-center justify-center">
                <DashedRing color={item.state === 'next' ? accent : '#4A4A48'} />
                <Text variant="label" className="text-sm">
                  {item.number}
                </Text>
              </View>
            )}
          </PressableScale>
        );
      })}
      <View className="justify-end" style={{ width: SLOT }}>
        <PressableScale
          haptic="tap"
          accessibilityLabel={t('overview.addTraining')}
          onPress={onAdd}
          className="size-8 items-center justify-center self-center rounded-full bg-elevated"
        >
          <Icon name="plus" size={12} />
        </PressableScale>
      </View>
    </ScrollView>
  );
}

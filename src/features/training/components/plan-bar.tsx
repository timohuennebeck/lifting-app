import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/icon';
import { PLAN_ADD_SIZE, PlanSlot } from '@/shared/ui/plan-slot';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

/** A strip entry; `review` adds the plan import's amber dot. */
export interface PlanBarItem {
  name: string;
  review?: boolean;
}

const SLOT = 52;

export interface PlanBarProps {
  items: PlanBarItem[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
}

/** Plan strip of the plan's days, numbered, with a "+" to add a day (03·0b). */
export function PlanBar({ items, currentIndex, onSelect, onAdd }: PlanBarProps) {
  const { t } = useTranslation('training');
  const { width } = useWindowDimensions();
  const scroller = useRef<ScrollView>(null);
  // Keep the current slot in view.
  const offset = Math.max(0, SLOT * (currentIndex + 2) - width);
  useEffect(() => {
    scroller.current?.scrollTo({ x: offset, animated: true });
  }, [offset]);

  return (
    <ScrollView
      ref={scroller}
      onContentSizeChange={() => scroller.current?.scrollTo({ x: offset, animated: false })}
      horizontal
      showsHorizontalScrollIndicator={false}
      className="grow-0"
      contentContainerClassName="px-3.5 pt-3.5 pb-4"
    >
      {items.map((item, index) => {
        const current = index === currentIndex;
        return (
          <PressableScale
            key={index}
            haptic="select"
            accessibilityRole="tab"
            accessibilityState={{ selected: current }}
            accessibilityLabel={item.name}
            onPress={() => onSelect(index)}
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
            <PlanSlot number={index + 1} done={false} selected={current} review={item.review} />
          </PressableScale>
        );
      })}
      <View className="justify-end" style={{ width: SLOT }}>
        <PressableScale
          haptic="tap"
          accessibilityLabel={t('overview.addTraining')}
          onPress={onAdd}
          className="items-center justify-center self-center rounded-full bg-elevated"
          // Centred on the slots: their ring hangs 3pt below the 32pt slot.
          style={{ width: PLAN_ADD_SIZE, height: PLAN_ADD_SIZE, marginBottom: -3 }}
        >
          <Icon name="plus" size={13} />
        </PressableScale>
      </View>
    </ScrollView>
  );
}

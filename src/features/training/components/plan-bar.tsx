import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/icon';
import { PlanSlot } from '@/shared/ui/plan-slot';
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

/** Plan strip of the collection's trainings: done, next (preselected) and upcoming (03·0b). */
export function PlanBar({ items, currentId, onSelect, onAdd }: PlanBarProps) {
  const { t } = useTranslation('training');
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
            <PlanSlot
              number={item.number}
              done={item.state === 'done'}
              next={item.state === 'next'}
            />
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

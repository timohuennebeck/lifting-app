import { ScrollView } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

export interface CollectionTab {
  key: string;
  name: string;
  count: number;
}

export interface CollectionTabsProps {
  tabs: CollectionTab[];
  selected: string | null;
  onSelect: (key: string) => void;
}

/** Horizontally scrolling collection pills with template counts (01·V·A). */
export function CollectionTabs({ tabs, selected, onSelect }: CollectionTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="grow-0 pt-4 pb-1"
      contentContainerClassName="gap-1.5 px-5"
    >
      {tabs.map((tab) => {
        const active = tab.key === selected;
        return (
          <PressableScale
            key={tab.key}
            haptic="select"
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(tab.key)}
            className={cn(
              'h-9 flex-row items-center gap-1.5 rounded-full px-3.5',
              active ? 'bg-accent' : 'bg-surface',
            )}
          >
            <Text variant="caption" tone={active ? 'onAccent' : 'secondary'} className="text-sm">
              {tab.name}
            </Text>
            <Text
              variant="caption"
              className={cn('text-sm', active ? 'text-on-accent/55' : 'text-dim')}
            >
              {tab.count}
            </Text>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

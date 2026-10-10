import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

export interface CollectionTab {
  key: string;
  name: string;
  count: number;
  /** A real collection, so holding it offers rename and delete ("Ohne Sammlung" isn't). */
  editable?: boolean;
}

export interface CollectionTabsProps {
  tabs: CollectionTab[];
  selected: string | null;
  onSelect: (key: string) => void;
  /** Holding a collection: its "⋯" options. */
  onOptions: (key: string) => void;
}

/**
 * Horizontally scrolling collection pills with template counts (01·V·A); holding one opens its
 * options.
 */
export function CollectionTabs({ tabs, selected, onSelect, onOptions }: CollectionTabsProps) {
  const { t } = useTranslation('training');
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // A horizontal ScrollView grows by default; this one is as tall as its tabs.
      style={{ flexGrow: 0, flexShrink: 0 }}
      className="pt-4 pb-1"
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
            onLongPress={
              tab.editable
                ? () => {
                    haptics.press();
                    onOptions(tab.key);
                  }
                : undefined
            }
            // What a screen reader offers instead of the hold, e.g. "Optionen für Push Pull Legs".
            accessibilityActions={
              tab.editable
                ? [{ name: 'longpress', label: t('collections.moreA11y', { name: tab.name }) }]
                : undefined
            }
            onAccessibilityAction={(e) => {
              if (e.nativeEvent.actionName === 'longpress') onOptions(tab.key);
            }}
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

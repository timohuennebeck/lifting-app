import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

import { Text } from './text';

const CARDS = [
  { label: 'XLS', left: 8, top: 16, rotate: '-10deg', accent: false },
  { label: 'PDF', left: 73, top: 4, rotate: '0deg', accent: true },
  { label: 'CSV', left: 138, top: 16, rotate: '9deg', accent: false },
] as const;

export interface FormatCardsProps {
  /** Visual scale of the 220×120 artwork. */
  scale?: number;
  /** Drop shadow under each card; off inside the import source card. */
  shadow?: boolean;
  className?: string;
}

/** Fanned XLS / PDF / CSV file cards illustrating importable formats. */
export function FormatCards({ scale = 1, shadow = true, className }: FormatCardsProps) {
  return (
    <View
      accessible={false}
      style={{ width: 220 * scale, height: 120 * scale }}
      className={cn('items-center justify-center', className)}
    >
      <View style={{ width: 220, height: 120, transform: [{ scale }] }}>
        {CARDS.map((card) => (
          <View
            key={card.label}
            className={cn(
              'absolute h-[92px] w-[74px] justify-end rounded-[14px] p-2.5',
              card.accent ? 'bg-accent' : 'bg-[#1E1E1E]',
            )}
            style={{
              left: card.left,
              top: card.top,
              transform: [{ rotate: card.rotate }],
              boxShadow: shadow ? '0 10px 24px rgba(0,0,0,0.4)' : undefined,
            }}
          >
            <Text variant="label" tone={card.accent ? 'onAccent' : 'default'}>
              {card.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

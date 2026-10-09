import { View } from 'react-native';
import Animated, { type CSSAnimationKeyframes } from 'react-native-reanimated';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';

import { Text } from './text';

const LINE_WIDTHS = ['84%', '66%', '76%', '58%', '70%', '62%'] as const;
const PENCIL = '#BDB7A9';

interface PaperSheetProps {
  /** Day badge in the header, e.g. "Mo" or "D1". */
  tag?: string;
  /** Lines light up one after another, like being read. */
  scanning?: boolean;
  className?: string;
}

/** A line lights up in the accent as the scan passes, then reads as written. */
const SCAN: CSSAnimationKeyframes = {
  '0%': { backgroundColor: PENCIL },
  '8%': { backgroundColor: PENCIL },
  '18%': { backgroundColor: colors.accent },
  '32%': { backgroundColor: colors.ink },
  '88%': { backgroundColor: colors.ink },
  '100%': { backgroundColor: PENCIL },
};

/** Stylised training-plan page used in import and plan-building illustrations. */
function PaperSheet({ tag, scanning, className }: PaperSheetProps) {
  return (
    <View
      className={cn('gap-3.5 rounded-xl bg-paper px-4.5 py-5', className)}
      style={{ boxShadow: '0 26px 50px rgba(0,0,0,0.6)' }}
    >
      <View className="flex-row items-center gap-1.75">
        {tag ? (
          <View className="rounded-full bg-ink px-2 py-0.75">
            <Text className="font-inter-semibold text-[11px] leading-3.25 text-paper">{tag}</Text>
          </View>
        ) : null}
        <View className="h-2 w-[40%] rounded bg-ink" />
      </View>
      {LINE_WIDTHS.map((width, i) => (
        <Animated.View
          key={i}
          className="h-1.5 rounded-[3px]"
          style={[
            { width, backgroundColor: PENCIL },
            scanning
              ? {
                  animationName: SCAN,
                  animationDuration: '5s',
                  animationDelay: `${i * 0.5}s`,
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'ease-in-out',
                }
              : null,
          ]}
        />
      ))}
    </View>
  );
}

const STACK = [
  { left: 94, top: 26, rotate: '12deg' },
  { left: 54, top: 14, rotate: '3deg' },
  { left: 14, top: 10, rotate: '-7deg' },
] as const;

export interface PaperStackProps {
  /** Three badges from the back sheet to the front sheet. */
  tags: readonly [string, string, string];
}

/** Three fanned plan pages; the front one is being scanned (design 05b / 00·P1). */
export function PaperStack({ tags }: PaperStackProps) {
  return (
    <View style={{ width: 260, height: 240 }}>
      {STACK.map((p, i) => (
        <View
          key={i}
          className="absolute h-52.5 w-40"
          style={{ left: p.left, top: p.top, transform: [{ rotate: p.rotate }] }}
        >
          <PaperSheet tag={tags[i]} scanning={i === STACK.length - 1} className="flex-1" />
        </View>
      ))}
    </View>
  );
}

import { View } from 'react-native';
import Animated, {
  FadeInRight,
  SlideOutLeft,
  type CSSAnimationKeyframes,
} from 'react-native-reanimated';

import { colors } from '@/shared/lib/theme';
import { Text } from '@/shared/ui/text';

import { BuildingCaption } from './building-caption';
import type { BuildingVariantProps } from './motion';

/** Seconds a page takes to be written before the next one comes. */
const PAGE_SECONDS = 4;
const PENCIL = '#BDB7A9';
/** The page's inner width, the lines' widths in it and whether a line is a heading. */
const INNER = 168;
const LINES = [
  { width: 0.84, head: true },
  { width: 0.62 },
  { width: 0.7 },
  { width: 0.84, head: true },
  { width: 0.56 },
  { width: 0.66 },
  { width: 0.5 },
] as const;

/** A line drawn from the left, bright as it is written, then in ink. */
const write = (width: number): CSSAnimationKeyframes => ({
  '0%': { width: 0, backgroundColor: colors.accent },
  '70%': { width, backgroundColor: colors.accent },
  '100%': { width, backgroundColor: colors.ink },
});

function Page({ tag, writing }: { tag: string; writing: boolean }) {
  return (
    <View
      className="h-65 w-51 gap-3.5 rounded-xl bg-paper px-4.5 py-5"
      style={{ boxShadow: '0 26px 50px rgba(0,0,0,0.6)' }}
    >
      <View className="flex-row items-center gap-1.75">
        <View className="rounded-full bg-ink px-2 py-0.75">
          <Text className="font-inter-semibold text-[11px] leading-3.25 text-paper">{tag}</Text>
        </View>
        <View className="h-2 w-[40%] rounded bg-ink" />
      </View>
      {LINES.map((l, i) => (
        <Animated.View
          key={i}
          className="rounded-[3px]"
          style={[
            {
              height: 'head' in l ? 8 : 6,
              width: l.width * INNER,
              backgroundColor: writing ? colors.ink : PENCIL,
            },
            writing
              ? {
                  animationName: write(l.width * INNER),
                  animationDuration: '0.45s',
                  animationDelay: `${0.25 + i * 0.45}s` as const,
                  animationFillMode: 'backwards',
                  animationTimingFunction: 'ease-out',
                }
              : null,
          ]}
        />
      ))}
    </View>
  );
}

/**
 * Variant 4, writing the plan: a page fills line by line, then flies off to the left and the next
 * routine's page comes in, while the written ones pile up behind.
 */
export function WritingPage({ seconds, line, elapsed, tags }: BuildingVariantProps) {
  const page = Math.floor(seconds / PAGE_SECONDS);
  return (
    <View className="flex-1">
      <View className="flex-1 items-center justify-center pb-28" accessibilityElementsHidden>
        <View style={{ width: 204, height: 260 }}>
          {/* The pile of written pages behind. */}
          <View
            className="absolute"
            style={{ transform: [{ rotate: '9deg' }, { translateX: 26 }] }}
          >
            <Page tag={tags[(page + 2) % tags.length]} writing={false} />
          </View>
          <View
            className="absolute"
            style={{ transform: [{ rotate: '4deg' }, { translateX: 12 }] }}
          >
            <Page tag={tags[(page + 1) % tags.length]} writing={false} />
          </View>
          <Animated.View
            key={page}
            className="absolute"
            entering={FadeInRight.duration(400)}
            exiting={SlideOutLeft.duration(450)}
          >
            <View style={{ transform: [{ rotate: '-3deg' }] }}>
              <Page tag={tags[page % tags.length]} writing />
            </View>
          </Animated.View>
        </View>
      </View>
      <BuildingCaption line={line} elapsed={elapsed} />
    </View>
  );
}

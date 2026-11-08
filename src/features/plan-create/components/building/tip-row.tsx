import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeInRight, FadeOut, FadeOutLeft } from 'react-native-reanimated';

import type { EquipmentAccess } from '@/shared/data/profile';
import { SpinnerGlyph } from '@/shared/ui/spark-glyph';
import { Text } from '@/shared/ui/text';

import { markTipSeen, seenTips, tipMs, tipQueue, tipRound } from '../../lib/building-tips';

/** The old tip leaves before the new one comes in, its topic with it. */
const OUT_MS = 250;
const IN_MS = 400;

/** Room for five lines of a tip (the longest), so nothing moves when one is shorter. */
const TIP_HEIGHT = 5 * 32;

/**
 * Training tips while the plan is made (2b): the topic with a small sparkle and where the tip
 * stands in the round ("4 / 25"), the tip under it.
 * Each tip stays as long as it takes to read, then slides out before the next one slides in;
 * a tap skips ahead. Tips not seen before come first.
 */
export function TipRow({ equipment }: { equipment: EquipmentAccess }) {
  const { t } = useTranslation('planCreate');
  const [{ queue, round }] = useState(() => {
    const seen = seenTips();
    return { queue: tipQueue(equipment, seen), round: tipRound(equipment, seen) };
  });
  const [index, setIndex] = useState(0);
  const tip = queue[index % queue.length];
  const text = t(`building.tips.${tip.id}`);
  const number = ((round.start + index) % round.total) + 1;

  useEffect(() => {
    markTipSeen(tip.id, equipment);
    const id = setTimeout(() => setIndex((i) => i + 1), tipMs(text));
    return () => clearTimeout(id);
  }, [tip.id, text, equipment]);

  return (
    <View className="gap-5 self-stretch">
      <View className="flex-row items-center gap-2.5">
        <SpinnerGlyph size={24} />
        <View className="h-4 flex-1">
          <Animated.View
            key={index}
            entering={FadeIn.duration(IN_MS).delay(OUT_MS)}
            exiting={FadeOut.duration(OUT_MS)}
            className="absolute inset-x-0 top-0 flex-row items-center justify-between"
          >
            <Text variant="overline" tone="accent" className="text-xs">
              {t(`building.topics.${tip.topic}`)}
            </Text>
            <Text className="font-inter text-xs text-subtle tabular-nums">
              {`${number} / ${round.total}`}
            </Text>
          </Animated.View>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityHint={t('building.nextTip')}
        onPress={() => setIndex((i) => i + 1)}
        style={{ height: TIP_HEIGHT }}
      >
        <Animated.View
          key={index}
          entering={FadeInRight.duration(IN_MS).delay(OUT_MS)}
          exiting={FadeOutLeft.duration(OUT_MS)}
          className="absolute inset-x-0 top-0"
        >
          {/* Korean breaks between words, not inside one (iOS). */}
          <Text
            lineBreakStrategyIOS="hangul-word"
            className="font-inter-semibold text-[24px] leading-8 text-fg"
          >
            {text}
          </Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

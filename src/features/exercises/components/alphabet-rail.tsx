import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';

import { haptics } from '@/shared/lib/haptics';
import { clamp } from '@/shared/lib/math';
import { colors } from '@/shared/lib/theme';
import { Text } from '@/shared/ui/text';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MAX_ROW = 15;
/** Letters that have entries; the current one is accent, empty ones faint. */
const AVAILABLE_COLOR = '#C8C8C3';

export interface AlphabetRailProps {
  /** Letters that have entries; others are dimmed. */
  available: ReadonlySet<string>;
  active: string | null;
  onJump: (letter: string) => void;
}

/** A–Z index on the right edge; tap or drag to jump through the list. */
export function AlphabetRail({ available, active, onJump }: AlphabetRailProps) {
  const { t } = useTranslation('exercises');
  // Letter under the finger during a drag, so each letter fires only once.
  const [touched, setTouched] = useState<string | null>(null);
  // Rows shrink when the list is shorter than 26 full-size letters.
  const [row, setRow] = useState(MAX_ROW);

  function jumpTo(y: number) {
    const letter = LETTERS[clamp(Math.floor(y / row), 0, LETTERS.length - 1)];
    if (letter === touched) return;
    setTouched(letter);
    haptics.select();
    onJump(letter);
  }

  const colorOf = (letter: string) => {
    if (letter === active) return colors.accent;
    return available.has(letter) ? AVAILABLE_COLOR : colors.outline;
  };

  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => scheduleOnRN(jumpTo, e.y))
    .onUpdate((e) => scheduleOnRN(jumpTo, e.y))
    .onFinalize(() => scheduleOnRN(setTouched, null));

  return (
    <View
      className="flex-1 justify-center"
      onLayout={(e) => setRow(Math.min(MAX_ROW, e.nativeEvent.layout.height / LETTERS.length))}
    >
      <GestureDetector gesture={pan}>
        <View accessibilityRole="adjustable" accessibilityLabel={t('picker.index')} hitSlop={8}>
          {LETTERS.map((c) => (
            <View key={c} className="w-5.5 items-center justify-center" style={{ height: row }}>
              <Text
                className="font-inter-semibold text-[10px] leading-3"
                style={{ color: colorOf(c) }}
              >
                {c}
              </Text>
            </View>
          ))}
        </View>
      </GestureDetector>
    </View>
  );
}

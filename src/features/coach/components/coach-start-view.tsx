import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { CoachComposer, type CoachComposerProps } from './coach-composer';
import { CoachHeader } from './coach-header';
import { CoachMark } from './coach-mark';

/** The suggestions, in the design's order. */
const SUGGESTIONS = ['weight', 'strength', 'balance', 'volume'] as const;
/** The composer without the consent line, and the room the content keeps above it: 44pt above
 * the field (design CO·A), or above the consent line while it shows. */
const COMPOSER = 18 + 54 + 10;
const ABOVE_COMPOSER = 26;

export interface CoachStartViewProps {
  /** The profile photo, top left like on the other tabs. */
  leading: ReactNode;
  /** Logged workouts and the month of the first, for "Ich kenne alle 142 Einheiten seit Januar". */
  workouts: number;
  since: string | null;
  onHistory: () => void;
  onAsk: (question: string) => void;
  composer: CoachComposerProps;
  /** What the home indicator covers at the bottom. */
  bottomInset: number;
}

/** The coach's empty chat (design CO·A): what it can do, four questions to start with. */
export function CoachStartView({
  leading,
  workouts,
  since,
  onHistory,
  onAsk,
  composer,
  bottomInset,
}: CoachStartViewProps) {
  const { t } = useTranslation('coach');
  const insets = useSafeAreaInsets();
  const [composerHeight, setComposerHeight] = useState(COMPOSER);
  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <CoachHeader leading={leading} onHistory={onHistory} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'flex-end',
          gap: 22,
          paddingHorizontal: 16,
          paddingBottom: bottomInset + composerHeight + ABOVE_COMPOSER,
        }}
      >
        <View className="gap-3 px-1">
          <CoachMark size={44} animation="breathe" />
          <Text className="font-inter-semibold text-[30px] leading-[34.5px] tracking-[-0.6px] text-fg">
            {t('start.title')}
          </Text>
          <Text className="font-inter text-label leading-[21.75px] text-subtle">
            {workouts && since ? t('start.subtitle', { count: workouts, since }) : t('start.empty')}
          </Text>
        </View>
        {/* Questions to start with, as the user's own would look in the chat. */}
        <View className="items-end gap-1.5">
          <Text className="px-1 pb-0.5 font-inter text-xs leading-[15px] text-dim">
            {t('start.tapToAsk')}
          </Text>
          {SUGGESTIONS.map((key) => (
            <PressableScale
              key={key}
              haptic="tap"
              onPress={() => onAsk(t(`start.suggestions.${key}`))}
              className="max-w-[87%] rounded-[20px] rounded-br-md bg-elevated px-4 py-2.5"
            >
              <Text className="font-inter-medium text-sm leading-5 text-fg">
                {t(`start.suggestions.${key}`)}
              </Text>
            </PressableScale>
          ))}
        </View>
      </ScrollView>
      <KeyboardStickyView
        offset={{ closed: 0, opened: bottomInset }}
        style={{ position: 'absolute', left: 0, right: 0, bottom: bottomInset }}
        onLayout={(e) => setComposerHeight(e.nativeEvent.layout.height)}
      >
        <CoachComposer {...composer} />
      </KeyboardStickyView>
    </View>
  );
}

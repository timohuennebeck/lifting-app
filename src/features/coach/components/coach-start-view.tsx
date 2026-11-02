import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { CoachComposer, type CoachComposerProps } from './coach-composer';
import { CoachMark } from './coach-mark';

/** The questions to start with, in this order. */
const SUGGESTIONS = ['weight', 'strength', 'volume', 'balance'] as const;

export interface CoachStartViewProps {
  /** Logged workouts and the month of the first, for "Ich kenne alle 142 Einheiten seit Januar". */
  workouts: number;
  since: string | null;
  onBack: () => void;
  onHistory: () => void;
  /** A question to start with was tapped: it is sent as is. */
  onAsk: (question: string) => void;
  composer: CoachComposerProps;
}

/** Kai's empty chat (design CO·A): who answers and from what, and questions to start with. */
export function CoachStartView({
  workouts,
  since,
  onBack,
  onHistory,
  onAsk,
  composer,
}: CoachStartViewProps) {
  const { t } = useTranslation('coach');
  const insets = useSafeAreaInsets();
  const footerInset = useFooterInset();
  const known = workouts > 0 && !!since;
  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <ScreenHeader
        onBack={onBack}
        title={t('title')}
        action={
          <IconButton
            icon="clock"
            iconSize={18}
            accessibilityLabel={t('history.title')}
            onPress={onHistory}
          />
        }
      />
      {/* The field rides up with the keyboard and pushes the text up with it, still centred. */}
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={-(footerInset - 8)}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            gap: 22,
            paddingHorizontal: 20,
            paddingVertical: 24,
          }}
        >
          <View className="gap-3">
            <CoachMark size={44} animation="breathe" />
            <Text className="font-inter-semibold text-[30px] leading-[34.5px] tracking-[-0.6px] text-fg">
              {t('start.title')}
            </Text>
            <Text className="font-inter text-label leading-[21.75px] text-subtle">
              {known ? t('start.subtitle', { count: workouts, since }) : t('start.empty')}
            </Text>
          </View>
          {/* Four questions to start with, under their topic. */}
          <View className="flex-row flex-wrap gap-2">
            {SUGGESTIONS.map((key) => (
              <PressableScale
                key={key}
                haptic="tap"
                onPress={() => onAsk(t(`start.suggestions.${key}.question`))}
                className="min-h-[86px] grow basis-[45%] gap-1.5 rounded-[18px] bg-surface p-3"
              >
                <Text className="font-inter-semibold text-[10px] leading-3 tracking-[1px] text-dim uppercase">
                  {t(`start.suggestions.${key}.label`)}
                </Text>
                <Text className="font-inter-medium text-[13px] leading-[17.5px] text-fg">
                  {t(`start.suggestions.${key}.question`)}
                </Text>
              </PressableScale>
            ))}
          </View>
        </ScrollView>
        <View style={{ paddingBottom: footerInset }}>
          <CoachComposer {...composer} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

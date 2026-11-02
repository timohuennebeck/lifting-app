import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { IconButton } from '@/shared/ui/icon-button';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { CoachComposer, type CoachComposerProps } from './coach-composer';
import { CoachMark } from './coach-mark';

export interface CoachStartViewProps {
  /** Logged workouts and the month of the first, for "Ich kenne alle 142 Einheiten seit Januar". */
  workouts: number;
  since: string | null;
  onBack: () => void;
  onHistory: () => void;
  composer: CoachComposerProps;
}

/** Kai's empty chat (design CO·A): who answers and from what, above the field. */
export function CoachStartView({
  workouts,
  since,
  onBack,
  onHistory,
  composer,
}: CoachStartViewProps) {
  const { t } = useTranslation('coach');
  const insets = useSafeAreaInsets();
  const footerInset = useFooterInset();
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
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'flex-end',
          paddingHorizontal: 20,
          paddingBottom: 24,
        }}
      >
        <View className="gap-3">
          <CoachMark size={44} animation="breathe" />
          <Text className="font-inter-semibold text-[30px] leading-[34.5px] tracking-[-0.6px] text-fg">
            {t('start.title')}
          </Text>
          <Text className="font-inter text-label leading-[21.75px] text-subtle">
            {workouts && since ? t('start.subtitle', { count: workouts, since }) : t('start.empty')}
          </Text>
        </View>
      </ScrollView>
      <KeyboardStickyView offset={{ closed: 0, opened: footerInset - 8 }}>
        <View style={{ paddingBottom: footerInset }}>
          <CoachComposer {...composer} />
        </View>
      </KeyboardStickyView>
    </View>
  );
}

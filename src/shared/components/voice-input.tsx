import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Linking, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import type { VoiceInput } from '@/shared/hooks/use-voice-input';
import { cn } from '@/shared/lib/cn';
import { formatDuration } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { FlashText } from '@/shared/ui/flash-text';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';
import { VoiceWave } from '@/shared/ui/voice-wave';

/** One flash across "Transkribiere …": quicker than the card's, as it shows for a second. */
const TRANSCRIBING_FLASH_MS = 1600;

export interface MicButtonProps {
  voice: VoiceInput;
  /** Nothing typed: it takes the send button's place, in a circle of its own. */
  alone: boolean;
}

/** Starts a recording; struck through without microphone access. */
export function MicButton({ voice, alone }: MicButtonProps) {
  const { t } = useTranslation('common');
  return (
    <PressableScale
      haptic="press"
      accessibilityLabel={t('voiceInput.start')}
      onPress={() => void voice.start()}
      className={cn('size-10 items-center justify-center rounded-full', alone && 'bg-control')}
    >
      <Icon
        name={voice.denied ? 'mic-off' : 'mic'}
        size={15}
        color={voice.denied || !alone ? colors.subtle : colors.fg}
      />
    </PressableScale>
  );
}

/** While recording: ✕ drops it, the level runs in from the right, the time, ✓ writes it down. */
export function RecordingRow({ voice }: { voice: VoiceInput }) {
  const { t } = useTranslation('common');
  return (
    <View className="flex-row items-center gap-3 rounded-[26px] bg-chip p-1.5">
      <PressableScale
        haptic="tap"
        accessibilityLabel={t('voiceInput.cancel')}
        onPress={() => void voice.cancel()}
        className="size-10 items-center justify-center rounded-full bg-control"
      >
        <Icon name="close" size={12} color={colors.fg} />
      </PressableScale>
      <VoiceWave levels={voice.levels} />
      <Text className="font-inter-medium text-sm text-subtle tabular-nums">
        {formatDuration(voice.elapsedMs / 1000)}
      </Text>
      <PressableScale
        haptic="press"
        accessibilityLabel={t('voiceInput.done')}
        onPress={() => void voice.finish()}
        className="size-10 items-center justify-center rounded-full bg-accent"
      >
        <Icon name="check" size={14} color={colors.onAccent} />
      </PressableScale>
    </View>
  );
}

/** While the recording is written down: "Transkribiere …" with a light across it, a spinner. */
export function TranscribingRow() {
  const { t } = useTranslation('common');
  return (
    <View
      accessible
      accessibilityLabel={t('voiceInput.transcribing')}
      className="flex-row items-center gap-2 rounded-[26px] bg-chip py-1.5 pr-1.5 pl-[18px]"
    >
      <View className="min-w-0 flex-1">
        <FlashText
          text={t('voiceInput.transcribing')}
          periodMs={TRANSCRIBING_FLASH_MS}
          className="text-base leading-[22px]"
        />
      </View>
      <View className="size-10 items-center justify-center">
        <ActivityIndicator size="small" color={colors.fg} />
      </View>
    </View>
  );
}

/** Above the field: why the microphone can't record, or that nothing is heard. */
export function VoiceInputNotes({ voice }: { voice: VoiceInput }) {
  const { t } = useTranslation('common');
  return (
    <>
      {voice.denied ? (
        <View className="mx-3 mt-2 flex-row items-center gap-3 rounded-[18px] bg-chip py-2 pr-2 pl-4">
          <Text className="min-w-0 flex-1 font-inter text-[13px] leading-[18px] text-fg">
            {t('voiceInput.noAccess')}
          </Text>
          <PressableScale
            haptic="tap"
            onPress={() => void Linking.openSettings()}
            className="h-9 justify-center rounded-full bg-fg px-4"
          >
            <Text className="font-inter-semibold text-[13px] text-bg">
              {t('voiceInput.settings')}
            </Text>
          </PressableScale>
        </View>
      ) : null}
      {voice.phase === 'recording' && voice.silent ? (
        <Animated.View entering={FadeIn.duration(200)} className="items-center pt-2">
          <View className="rounded-full bg-chip px-3.5 py-1.5">
            <Text className="font-inter text-xs leading-4 text-subtle">
              {t('voiceInput.silent')}
            </Text>
          </View>
        </Animated.View>
      ) : null}
    </>
  );
}

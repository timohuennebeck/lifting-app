import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Linking, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useAppLanguage } from '@/shared/hooks/use-app-language';
import { cn } from '@/shared/lib/cn';
import { formatDuration } from '@/shared/lib/format';
import { COACH_QUESTION_MAX } from '@/shared/lib/limits';
import { colors } from '@/shared/lib/theme';
import { Gradient } from '@/shared/ui/gradient';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { useVoiceQuestion } from '../hooks/use-voice-question';
import { FlashText } from './flash-text';
import { VoiceWave } from './voice-wave';

/** How far above the field the content fades out. */
const FADE = 28;
/** One flash across "Transkribiere …": quicker than the card's, as it shows for a second. */
const TRANSCRIBING_FLASH_MS = 1600;

export interface CoachComposerProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  /** While Kai answers: the field rests and the button stops the answer. */
  answering: boolean;
  onStop: () => void;
  /** Before the first question: sending it is the consent, so the line says so. */
  consentNote: boolean;
}

/** The spoken question's part of the composer, from useVoiceQuestion. */
export type ComposerVoice = ReturnType<typeof useVoiceQuestion>;

/** The draft with what was said after it, as far as the field takes it. */
const withSpoken = (draft: string, said: string) =>
  (draft.trim() ? `${draft.trimEnd()} ${said}` : said).slice(0, COACH_QUESTION_MAX);

/** "Frag Kai …" with the microphone; it records, writes down what was said and adds it. */
export function CoachComposer(props: CoachComposerProps) {
  const language = useAppLanguage();
  const voice = useVoiceQuestion(language, (said) =>
    props.onChangeText(withSpoken(props.value, said)),
  );
  return <CoachComposerView {...props} voice={voice} />;
}

/** While recording: ✕ drops it, the level runs in from the right, the time, ✓ writes it down. */
function RecordingRow({ voice }: { voice: ComposerVoice }) {
  const { t } = useTranslation('coach');
  return (
    <View className="flex-row items-center gap-3 rounded-[26px] bg-chip p-1.5">
      <PressableScale
        haptic="tap"
        accessibilityLabel={t('voice.cancel')}
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
        accessibilityLabel={t('voice.done')}
        onPress={() => void voice.finish()}
        className="size-10 items-center justify-center rounded-full bg-accent"
      >
        <Icon name="check" size={14} color={colors.onAccent} />
      </PressableScale>
    </View>
  );
}

/** While the recording is written down: "Transkribiere …" with a light across it, a spinner. */
function TranscribingRow() {
  const { t } = useTranslation('coach');
  return (
    <View
      accessible
      accessibilityLabel={t('voice.transcribing')}
      className="flex-row items-center gap-2 rounded-[26px] bg-chip py-1.5 pr-1.5 pl-[18px]"
    >
      <View className="min-w-0 flex-1">
        <FlashText
          text={t('voice.transcribing')}
          periodMs={TRANSCRIBING_FLASH_MS}
          className="text-base leading-[22px]"
        />
      </View>
      <View className="size-10 items-center justify-center rounded-full bg-control">
        <ActivityIndicator size="small" color={colors.fg} />
      </View>
    </View>
  );
}

/** No microphone access: what it is for, and the way to the settings. */
function MicAccessNote() {
  const { t } = useTranslation('coach');
  return (
    <View className="mx-3 mt-2 flex-row items-center gap-3 rounded-[18px] bg-chip py-2 pr-2 pl-4">
      <Text className="min-w-0 flex-1 font-inter text-[13px] leading-[18px] text-fg">
        {t('voice.noAccess')}
      </Text>
      <PressableScale
        haptic="tap"
        onPress={() => void Linking.openSettings()}
        className="h-9 justify-center rounded-full bg-fg px-4"
      >
        <Text className="font-inter-semibold text-[13px] text-bg">{t('voice.settings')}</Text>
      </PressableScale>
    </View>
  );
}

/**
 * The composer's look for each state (design "Spracheingabe"): empty with the microphone where
 * send goes, typed with both, recording, being written down, and without microphone access. The
 * field grows with what is in it; the consent line stays above until it is given.
 */
export function CoachComposerView({
  value,
  onChangeText,
  onSend,
  answering,
  onStop,
  consentNote,
  voice,
}: CoachComposerProps & { voice: ComposerVoice }) {
  const { t } = useTranslation('coach');
  const typed = value.trim().length > 0;
  const canSend = !answering && typed;
  const hearsNothing = voice.phase === 'recording' && voice.silent;

  const mic = (
    <PressableScale
      haptic="press"
      accessibilityLabel={t('voice.start')}
      onPress={() => void voice.start()}
      className={cn(
        'size-10 items-center justify-center rounded-full',
        // Alone it takes the send button's place, in a circle of its own.
        !typed && 'bg-control',
      )}
    >
      <Icon
        name={voice.denied ? 'mic-off' : 'mic'}
        size={15}
        color={voice.denied || typed ? colors.subtle : colors.fg}
      />
    </PressableScale>
  );
  let row = (
    <View className="flex-row items-center gap-1 rounded-[26px] bg-chip py-1.5 pr-1.5 pl-[18px]">
      <TextInput
        value={answering ? '' : value}
        onChangeText={onChangeText}
        editable={!answering}
        multiline
        // Return sends, as before the field could grow.
        submitBehavior="submit"
        maxLength={COACH_QUESTION_MAX}
        placeholder={answering ? t('composer.answering') : t('composer.placeholder')}
        placeholderTextColor={colors.dim}
        selectionColor={colors.fg}
        cursorColor={colors.fg}
        keyboardAppearance="dark"
        returnKeyType="send"
        onSubmitEditing={() => {
          if (canSend) onSend();
        }}
        className="max-h-[120px] min-h-10 min-w-0 flex-1 py-[9px] font-inter text-base leading-[22px] text-fg"
      />
      {answering ? (
        <PressableScale
          haptic="press"
          accessibilityLabel={t('composer.stop')}
          onPress={onStop}
          className="size-10 items-center justify-center rounded-full bg-fg"
        >
          <View className="size-3 rounded-[3px] bg-bg" />
        </PressableScale>
      ) : (
        <>
          {mic}
          {typed ? (
            <PressableScale
              haptic="press"
              accessibilityLabel={t('composer.send')}
              onPress={onSend}
              className="size-10 items-center justify-center rounded-full bg-accent"
            >
              <Icon name="arrow-up" size={16} color={colors.onAccent} />
            </PressableScale>
          ) : null}
        </>
      )}
    </View>
  );
  if (voice.phase === 'recording') row = <RecordingRow voice={voice} />;
  else if (voice.phase === 'transcribing') row = <TranscribingRow />;

  return (
    <View>
      {/* The chat above fades into the page instead of ending at a hard edge. */}
      <Gradient
        from="bottom"
        style={{ position: 'absolute', left: 0, right: 0, top: -FADE, height: FADE }}
      />
      {consentNote ? (
        <Text className="px-6 pt-2 text-center font-inter text-xs leading-4 text-dim">
          {t('consent')}
        </Text>
      ) : null}
      {voice.denied ? <MicAccessNote /> : null}
      {hearsNothing ? (
        <Animated.View entering={FadeIn.duration(200)} className="items-center pt-2">
          <View className="rounded-full bg-chip px-3.5 py-1.5">
            <Text className="font-inter text-xs leading-4 text-subtle">{t('voice.silent')}</Text>
          </View>
        </Animated.View>
      ) : null}
      <View className="px-3 pt-2">{row}</View>
    </View>
  );
}

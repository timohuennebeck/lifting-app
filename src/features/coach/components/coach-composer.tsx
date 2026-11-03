import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import {
  MicButton,
  RecordingRow,
  TranscribingRow,
  VoiceInputNotes,
} from '@/shared/components/voice-input';
import { useAppLanguage } from '@/shared/hooks/use-app-language';
import { useVoiceInput, type VoiceInput, withSpoken } from '@/shared/hooks/use-voice-input';
import { cn } from '@/shared/lib/cn';
import { COACH_QUESTION_MAX } from '@/shared/lib/limits';
import { colors } from '@/shared/lib/theme';
import { CharCount } from '@/shared/ui/char-count';
import { Gradient } from '@/shared/ui/gradient';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

/** How far above the field the content fades out. */
const FADE = 28;
/**
 * What the one-line field leaves the text: the composer's 12pt sides, the field's 18pt and 6pt
 * insides, and the microphone and send button with their gaps (4 + 40 + 4 + 40).
 */
const ONE_LINE_INSET = 2 * 12 + 18 + 6 + 88;

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

/** "Frag Kai …" with the microphone; it records, writes down what was said and adds it. */
export function CoachComposer(props: CoachComposerProps) {
  const language = useAppLanguage();
  const voice = useVoiceInput(language, 'coach', (said) =>
    props.onChangeText(withSpoken(props.value, said, COACH_QUESTION_MAX)),
  );
  return <CoachComposerView {...props} voice={voice} />;
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
}: CoachComposerProps & { voice: VoiceInput }) {
  const { t } = useTranslation('coach');
  const typed = value.trim().length > 0;
  // Text that needs a second line in the one-line field gets the support chat's box: the text
  // across the whole width, the buttons in a row under it. Measured at the one-line width, so
  // going back to one line when it is shorter again doesn't flicker.
  const [width, setWidth] = useState(0);
  const [lines, setLines] = useState(1);
  // A line break only counts as a line once text follows it, so it is looked for as well.
  const tall = typed && (lines > 1 || value.includes('\n'));
  const [focused, setFocused] = useState(false);

  let row = (
    <View
      className={cn(
        'bg-chip',
        tall
          ? 'gap-3.5 rounded-[24px] px-2.5 pt-4 pb-2.5'
          : 'flex-row items-center gap-1 rounded-[26px] py-1.5 pr-1.5 pl-[18px]',
      )}
    >
      {/* As the support chat's box: the 2pt neon ring while typing. */}
      {focused && !answering ? (
        <View
          pointerEvents="none"
          className={cn(
            'absolute inset-0 border-2 border-accent',
            tall ? 'rounded-[24px]' : 'rounded-[26px]',
          )}
        />
      ) : null}
      {/* The text at the one-line field's width, unseen: how many lines it takes there. */}
      <Text
        pointerEvents="none"
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        onTextLayout={(e) => setLines(e.nativeEvent.lines.length)}
        className="absolute font-inter text-base leading-[22px] opacity-0"
        style={{ width: Math.max(0, width - ONE_LINE_INSET) }}
      >
        {value}
      </Text>
      <TextInput
        value={answering ? '' : value}
        onChangeText={onChangeText}
        editable={!answering}
        multiline
        maxLength={COACH_QUESTION_MAX}
        placeholder={answering ? t('composer.answering') : t('composer.placeholder')}
        placeholderTextColor={colors.dim}
        selectionColor={colors.fg}
        cursorColor={colors.fg}
        keyboardAppearance="dark"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        textAlignVertical={tall ? 'top' : 'center'}
        className={cn(
          'max-h-30 font-inter text-base leading-[22px] text-fg',
          tall ? 'min-h-11 px-2 py-0' : 'min-h-10 min-w-0 flex-1 py-[9px]',
        )}
      />
      <View className={cn('flex-row items-center gap-1', tall && 'justify-end')}>
        {tall ? (
          <CharCount
            length={value.length}
            max={COACH_QUESTION_MAX}
            className="mr-auto self-center"
          />
        ) : null}
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
            <MicButton voice={voice} alone={!typed} />
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
    </View>
  );
  if (voice.phase === 'recording') row = <RecordingRow voice={voice} />;
  else if (voice.phase === 'transcribing') row = <TranscribingRow />;

  return (
    // Solid, as the chat runs on behind it while the keyboard is open.
    <View className="bg-bg">
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
      <VoiceInputNotes voice={voice} />
      <View className="px-3 pt-2" onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {row}
      </View>
    </View>
  );
}

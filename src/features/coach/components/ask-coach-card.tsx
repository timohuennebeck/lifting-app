import { router, useIsFocused } from 'expo-router';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Pressable, type TextInput, View } from 'react-native';
import Animated, { type CSSAnimationKeyframes, useReducedMotion } from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { VoiceInputNotes } from '@/shared/components/voice-input';
import { useAppLanguage } from '@/shared/hooks/use-app-language';
import { useVoiceInput, withSpoken } from '@/shared/hooks/use-voice-input';
import { COACH_QUESTION_MAX } from '@/shared/lib/limits';
import { colors } from '@/shared/lib/theme';
import { CoachMark } from '@/shared/ui/coach-mark';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { CoachError, timeZone } from '../lib/coach-client';
import { showCoachError } from '../lib/coach-errors';
import { openAnswer } from '../lib/open-coach';
import { ask, isAnswering, stopAnswer, useCoachStore } from '../stores/coach-store';
import { ChaseBorder } from './chase-border';
import { CoachField } from './coach-composer';

/** How often the diamond turns. */
const TURN_MS = 3500;

/** Under the mark and fading out before the card's top edge, so it is never cut off. */
const GLOW_SIZE = 136;
const GLOW: CSSAnimationKeyframes = {
  '0%': { opacity: 0.55 },
  '50%': { opacity: 1 },
  '100%': { opacity: 0.55 },
};

const setDraft = (draft: string) => useCoachStore.setState({ draft });

/** The soft neon light behind Kai's mark, breathing with its halo. */
function CoachGlow({ paused }: { paused: boolean }) {
  return (
    <Animated.View
      pointerEvents="none"
      className="absolute top-0 self-center"
      style={{
        width: GLOW_SIZE,
        height: GLOW_SIZE,
        animationName: GLOW,
        animationDuration: '2.4s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'ease-in-out',
        animationPlayState: paused ? 'paused' : 'running',
      }}
    >
      <Svg width={GLOW_SIZE} height={GLOW_SIZE}>
        <Defs>
          <RadialGradient id="coach-glow" cx="50%" cy="50%" r="50%">
            <Stop offset={0} stopColor={colors.accent} stopOpacity={0.34} />
            <Stop offset={0.5} stopColor={colors.accent} stopOpacity={0.16} />
            <Stop offset={1} stopColor={colors.accent} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={GLOW_SIZE} height={GLOW_SIZE} fill="url(#coach-glow)" />
      </Svg>
    </Animated.View>
  );
}

export interface AskCoachCardProps {
  className?: string;
}

/**
 * Where a chat with Kai starts (Training tab): typing or speaking a question sends it to a chat of
 * its own, and the card or its clock opens earlier chats. A question that comes back without an
 * answer returns to the field. While an answer comes in, the field leads to it.
 */
export function AskCoachCard({ className }: AskCoachCardProps) {
  const { t } = useTranslation('coach');
  const language = useAppLanguage();
  const asker = useId();
  // Behind another tab or the coach itself, the card rests.
  const focused = useIsFocused();
  const reducedMotion = useReducedMotion();
  const draft = useCoachStore((s) => s.draft);
  const answering = useCoachStore((s) => isAnswering(s.pending));
  const focusCard = useCoachStore((s) => s.focusCard);
  const voice = useVoiceInput(language, 'coach', (said) =>
    setDraft(withSpoken(draft, said, COACH_QUESTION_MAX)),
  );
  const inputRef = useRef<TextInput>(null);
  const [typing, setTyping] = useState(false);

  const [turns, setTurns] = useState(0);
  const resting = !focused || typing;
  // A lap with every second turn; the field's own ring takes over while typing.
  const lap = Math.ceil(turns / 2);
  useEffect(() => {
    if (resting) return;
    const id = setInterval(() => setTurns((n) => n + 1), TURN_MS);
    return () => clearInterval(id);
  }, [resting]);

  useEffect(() => {
    if (!focused || !focusCard) return;
    useCoachStore.setState({ focusCard: false });
    inputRef.current?.focus();
  }, [focused, focusCard]);

  const send = async (text: string) => {
    const question = text.trim();
    // One answer at a time, also across chats.
    if (!question || answering) return;
    setDraft('');
    Keyboard.dismiss();
    const asked = ask({ question, chatId: null, language, timeZone: timeZone() }, asker);
    router.push({ pathname: '/coach', params: { asker } });
    const result = await asked;
    // Without an answer the chat closes and the question goes back into the field.
    if (result === 'stopped') setDraft(question);
    if (result instanceof CoachError) {
      setDraft(question);
      if (result.reason !== 'chatGone') {
        showCoachError(result.reason, result.limit, t, () => void send(question));
      }
    }
  };

  const openHistory = () => router.push('/coach/history');
  // While typing, a tap on the card only ends that.
  const pressCard = () => {
    if (typing) Keyboard.dismiss();
    else openHistory();
  };

  return (
    // Not one element for VoiceOver, which would hide the field; the clock opens the chats there.
    <PressableScale accessible={false} activeScale={0.98} onPress={pressCard} className={className}>
      <View className="items-center gap-3 overflow-hidden rounded-[18px] bg-surface px-3.5 pt-7.5 pb-3.5">
        <CoachGlow paused={!focused} />
        <IconButton
          icon="clock"
          size={40}
          iconSize={17}
          accessibilityLabel={t('history.title')}
          onPress={openHistory}
          className="absolute top-2.5 right-2.5 z-10 bg-control"
        />
        <View className="size-19 items-center justify-center">
          <CoachMark size={52} animation={focused ? 'breathe' : undefined} turns={turns} />
        </View>
        <View className="gap-1">
          <Text className="text-center font-inter-semibold text-[19px] leading-6 text-fg">
            {t('card.title')}
          </Text>
          <Text className="text-center font-inter text-[13px] leading-[18px] text-muted">
            {t('card.subtitle')}
          </Text>
        </View>
        <VoiceInputNotes voice={voice} />
        {/* A tap beside the text still means the field. */}
        <Pressable
          accessible={false}
          onPress={() => inputRef.current?.focus()}
          className="self-stretch"
        >
          <CoachField
            inputRef={inputRef}
            value={draft}
            onChangeText={setDraft}
            onSend={() => void send(draft)}
            answering={answering}
            onStop={stopAnswer}
            onOpenAnswer={openAnswer}
            onFocusChange={setTyping}
            voice={voice}
            // Lighter than the chat's, as the card behind it is lighter than the page.
            className="bg-chip"
            // The same corners as the card around it.
            radiusClassName="rounded-[18px]"
          />
        </Pressable>
      </View>
      {reducedMotion ? null : <ChaseBorder lap={lap} stopped={resting} />}
    </PressableScale>
  );
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, TextInput, View } from 'react-native';

import { useIsLocked } from '@/features/paywall/stores/subscription-store';
import {
  MicButton,
  RecordingRow,
  TranscribingRow,
  VoiceInputNotes,
} from '@/shared/components/voice-input';
import { useAppLanguage } from '@/shared/hooks/use-app-language';
import { useVoiceInput, withSpoken } from '@/shared/hooks/use-voice-input';
import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { TICKET_MESSAGE_MAX } from '@/shared/lib/limits';
import { colors } from '@/shared/lib/theme';
import { useUserId } from '@/shared/stores/session-store';
import { CharCount } from '@/shared/ui/char-count';
import { Icon } from '@/shared/ui/icon';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';

import { sendTicketMessage } from '../data/ticket-mutations';
import { useScreenshotDraft } from '../hooks/use-screenshot-draft';
import { ScreenshotTiles } from './screenshot-tiles';

export interface ChatComposerProps {
  ticketId: string;
}

/**
 * "Chat with us" box with screenshot button, microphone and send arrow (01f-3e). Messages are
 * written locally at once (also offline); screenshots upload in the background. A locked account
 * can still write in but has no voice input, which is part of Pro; send then stands on its own.
 */
export function ChatComposer({ ticketId }: ChatComposerProps) {
  const { t } = useTranslation('support');
  const userId = useUserId();
  const draft = useScreenshotDraft();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [focused, setFocused] = useState(false);
  const language = useAppLanguage();
  const locked = useIsLocked();
  const voice = useVoiceInput(language, 'support', (said) =>
    setText((current) => withSpoken(current, said, TICKET_MESSAGE_MAX)),
  );
  const hasContent = text.trim().length > 0 || draft.shots.length > 0;
  const canSend = !!userId && hasContent && !draft.preparing && !sending;

  async function send() {
    if (!canSend || !userId) return;
    const content = text;
    setSending(true);
    try {
      // Saved locally first (works offline); screenshots upload in the background.
      await draft.save(userId, ticketId, (attachments) =>
        sendTicketMessage({ userId, ticketId, content, attachments }),
      );
      // Keep anything typed while the message was being saved.
      setText((current) =>
        current.startsWith(content) ? current.slice(content.length).trimStart() : current,
      );
      draft.reset();
    } catch (e) {
      console.error('Sending message failed', e);
      haptics.error();
    }
    setSending(false);
  }

  let box = (
    // Like the text fields: a 1pt line, with the 2pt neon ring on top of it while typing.
    <View className="gap-3.5 rounded-[24px] border border-white/8 bg-tile px-2.5 pt-4 pb-2.5">
      {focused ? (
        <View
          pointerEvents="none"
          className="absolute -inset-px rounded-[24px] border-2 border-accent"
        />
      ) : null}
      {draft.shots.length ? (
        <ScreenshotTiles draft={draft} showAdd={false} tileClassName="h-18 w-13" className="px-2" />
      ) : null}
      <TextInput
        value={text}
        onChangeText={setText}
        multiline
        maxLength={TICKET_MESSAGE_MAX}
        placeholder={t('chat.placeholder')}
        placeholderTextColor={colors.dim}
        selectionColor={colors.fg}
        cursorColor={colors.fg}
        keyboardAppearance="dark"
        textAlignVertical="top"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        // Two lines tall even when empty, so there's room to start typing.
        className="max-h-30 min-h-11 px-2 py-0 font-inter text-base leading-5.5 text-fg"
      />
      <View className="flex-row items-center justify-between">
        <IconButton
          icon="plus"
          size={40}
          iconSize={14}
          accessibilityLabel={t('chat.addScreenshot')}
          disabled={!draft.canAdd}
          onPress={draft.add}
          className={cn(!draft.canAdd && 'opacity-35')}
        />
        <CharCount length={text.length} max={TICKET_MESSAGE_MAX} className="self-center" />
        <View className="flex-row items-center gap-1">
          {locked ? null : <MicButton voice={voice} alone={!hasContent} />}
          {hasContent || locked ? (
            <PressableScale
              haptic="press"
              accessibilityLabel={t('chat.send')}
              accessibilityState={{ disabled: !canSend, busy: sending }}
              disabled={!canSend}
              onPress={send}
              className={cn(
                'size-10 items-center justify-center rounded-full',
                hasContent ? 'bg-accent' : 'bg-control',
              )}
            >
              {sending ? (
                <ActivityIndicator color={colors.onAccent} />
              ) : (
                <Icon name="arrow-up" size={16} color={hasContent ? colors.onAccent : colors.dim} />
              )}
            </PressableScale>
          ) : null}
        </View>
      </View>
    </View>
  );
  if (voice.phase === 'recording') box = <RecordingRow voice={voice} />;
  else if (voice.phase === 'transcribing') box = <TranscribingRow />;

  return (
    // Solid, as the chat runs on behind it while the keyboard is open.
    <View className="bg-bg">
      <VoiceInputNotes voice={voice} />
      <View className="px-3 pt-2">{box}</View>
    </View>
  );
}

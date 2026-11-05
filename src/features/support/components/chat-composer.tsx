import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator } from 'react-native';

import { useIsLocked } from '@/features/paywall/stores/subscription-store';
import { ChatField, ChatFooter } from '@/shared/components/chat-field';
import { useVoiceInput, withSpoken } from '@/shared/hooks/use-voice-input';
import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { TICKET_MESSAGE_MAX } from '@/shared/lib/limits';
import { colors } from '@/shared/lib/theme';
import { useUserId } from '@/shared/stores/session-store';
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
  const locked = useIsLocked();
  const voice = useVoiceInput('support', (said) =>
    setText((current) => withSpoken(current, said, TICKET_MESSAGE_MAX)),
  );
  const hasContent = text.trim().length > 0 || draft.shots.length > 0;
  const canSend = !!userId && hasContent && !draft.preparing && !sending;
  // Without voice input send stands on its own, also before anything is typed.
  const showSend = hasContent || locked;

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

  return (
    <ChatFooter voice={voice}>
      <ChatField
        voice={voice}
        mic={!locked}
        value={text}
        onChangeText={setText}
        maxLength={TICKET_MESSAGE_MAX}
        placeholder={t('chat.placeholder')}
        above={
          draft.shots.length ? (
            <ScreenshotTiles
              draft={draft}
              showAdd={false}
              tileClassName="h-18 w-13"
              className="px-2"
            />
          ) : null
        }
        leading={
          <IconButton
            icon="plus"
            size={40}
            iconSize={14}
            accessibilityLabel={t('chat.addScreenshot')}
            disabled={!draft.canAdd}
            onPress={draft.add}
            className={cn(!draft.canAdd && 'opacity-35')}
          />
        }
        actions={
          showSend ? (
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
          ) : null
        }
      />
    </ChatFooter>
  );
}

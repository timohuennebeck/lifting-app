import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ChatInput } from '@/shared/components/chat-input';
import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { TICKET_MESSAGE_MAX } from '@/shared/lib/limits';
import { useUserId } from '@/shared/stores/session-store';
import { IconButton } from '@/shared/ui/icon-button';

import { sendTicketMessage } from '../data/ticket-mutations';
import { useScreenshotDraft } from '../hooks/use-screenshot-draft';
import { ScreenshotTiles } from './screenshot-tiles';

export interface ChatComposerProps {
  ticketId: string;
}

/**
 * "Chat with us" box with screenshot button and send arrow (01f-3e). Messages are written
 * locally at once (also offline); screenshots upload in the background.
 */
export function ChatComposer({ ticketId }: ChatComposerProps) {
  const { t } = useTranslation('support');
  const userId = useUserId();
  const draft = useScreenshotDraft();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
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

  return (
    <ChatInput
      value={text}
      onChangeText={setText}
      placeholder={t('chat.placeholder')}
      maxLength={TICKET_MESSAGE_MAX}
      top={
        draft.shots.length ? (
          <ScreenshotTiles
            draft={draft}
            showAdd={false}
            tileClassName="h-18 w-13"
            className="px-2"
          />
        ) : null
      }
      accessory={
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
      onSend={send}
      sendLabel={t('chat.send')}
      canSend={canSend}
      ready={hasContent}
      sending={sending}
    />
  );
}

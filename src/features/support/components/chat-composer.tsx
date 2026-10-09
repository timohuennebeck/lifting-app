import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, TextInput, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { useUserId } from '@/shared/stores/session-store';
import { Icon } from '@/shared/ui/icon';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';

import { sendTicketMessage } from '../data/ticket-mutations';
import { useScreenshotDraft } from '../hooks/use-screenshot-draft';
import { ScreenshotTiles } from './screenshot-tiles';
import { UploadStatus } from './upload-status';

export interface ChatComposerProps {
  ticketId: string;
}

/**
 * "Chat with us" box with screenshot button and send arrow (01f-3e). Text-only messages are
 * written locally at once; screenshots upload first, with progress and retry.
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
    const body = text;
    setSending(true);
    try {
      const attachments = draft.shots.length ? await draft.upload(userId, ticketId) : [];
      if (!attachments) return;
      await sendTicketMessage({ userId, ticketId, body, attachments });
      // Keep whatever was typed while the screenshots uploaded.
      setText((current) => (current === body ? '' : current));
      draft.reset();
    } catch (e) {
      console.error('Sending message failed', e);
      haptics.error();
    } finally {
      setSending(false);
    }
  }

  return (
    <View className="px-3 pt-2">
      <UploadStatus draft={draft} onRetry={send} className="mb-2 px-3" />
      <View className="gap-3.5 rounded-[28px] border-[0.5px] border-white/12 bg-tile px-2.5 pt-4 pb-2.5">
        {draft.shots.length ? (
          <ScreenshotTiles
            draft={draft}
            showAdd={false}
            tileClassName="h-18 w-13"
            className="px-2"
          />
        ) : null}
        <TextInput
          value={text}
          onChangeText={setText}
          multiline
          placeholder={t('chat.placeholder')}
          placeholderTextColor={colors.dim}
          selectionColor={colors.fg}
          cursorColor={colors.fg}
          keyboardAppearance="dark"
          className="max-h-30 min-h-6 px-2 py-0 font-inter text-base leading-5.5 text-fg"
        />
        <View className="flex-row items-center justify-between">
          <IconButton
            icon="plus"
            size={40}
            iconSize={14}
            accessibilityLabel={t('chat.addScreenshot')}
            disabled={!draft.canAdd || draft.uploading}
            onPress={draft.add}
            className={cn(!draft.canAdd && 'opacity-35')}
          />
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
        </View>
      </View>
    </View>
  );
}

import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { newId } from '@/shared/data/json';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { useUserId } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { ImportanceScale } from '../components/importance-scale';
import { ScreenshotTiles } from '../components/screenshot-tiles';
import { createTicket } from '../data/ticket-mutations';
import type { TicketKind } from '../data/tickets';
import { useScreenshotDraft } from '../hooks/use-screenshot-draft';

/** Bug report (01f·I: text + screenshots) or feature request (01f·J: text + importance). */
export function NewTicketScreen() {
  const { t } = useTranslation(['support', 'common']);
  const params = useLocalSearchParams<{ kind?: string }>();
  const kind: TicketKind = params.kind === 'idea' ? 'idea' : 'bug';
  const userId = useUserId();
  // Fixed per form so a failed save retries with the same ticket and screenshot paths.
  const [ticketId] = useState(newId);
  const [text, setText] = useState('');
  const [importance, setImportance] = useState(4);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const draft = useScreenshotDraft();
  const canSend = !!userId && text.trim().length > 0 && !draft.preparing;

  async function send() {
    if (!canSend || !userId) return;
    setSending(true);
    setError(false);
    try {
      // Saved locally first (works offline); screenshots upload in the background.
      await draft.save(userId, ticketId, (attachments) =>
        createTicket({
          ticketId,
          userId,
          kind,
          priority: kind === 'idea' ? importance : null,
          body: text,
          attachments,
        }),
      );
      haptics.success();
      router.replace({ pathname: '/support/[ticketId]', params: { ticketId } });
    } catch (e) {
      console.error('Creating ticket failed', e);
      haptics.error();
      setError(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <Screen
      header={<ScreenHeader title={t(kind === 'bug' ? 'form.bugTitle' : 'form.ideaTitle')} />}
      scroll
      footer={
        <View className="gap-3">
          {error ? (
            <Text variant="caption" tone="danger" className="px-1 font-inter">
              {t('common:errors.generic')}
            </Text>
          ) : null}
          <Button label={t('form.send')} disabled={!canSend} loading={sending} onPress={send} />
        </View>
      }
    >
      <TextInput
        value={text}
        onChangeText={setText}
        multiline
        textAlignVertical="top"
        placeholder={t(kind === 'bug' ? 'form.bugPlaceholder' : 'form.ideaPlaceholder')}
        placeholderTextColor={colors.dim}
        selectionColor={colors.fg}
        cursorColor={colors.fg}
        keyboardAppearance="dark"
        className="mx-5 mt-5 h-50 rounded-[20px] bg-chip px-4 pt-3.5 pb-3.5 font-inter text-base leading-5.75 text-fg"
      />
      {kind === 'bug' ? (
        <View className="mx-5 mt-4.5 gap-2.5">
          <Text variant="overline" tone="subtle" className="text-[11px]">
            {t('form.screenshots')}
          </Text>
          <ScreenshotTiles draft={draft} />
        </View>
      ) : (
        <View className="mx-5 mt-5.5">
          <ImportanceScale value={importance} onChange={setImportance} />
        </View>
      )}
    </Screen>
  );
}

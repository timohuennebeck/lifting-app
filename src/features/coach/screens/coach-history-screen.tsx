import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useToday } from '@/shared/hooks/use-today';
import { DeleteSheet } from '@/shared/ui/delete-sheet';

import { CoachHistoryView } from '../components/coach-history-view';
import { deleteCoachChats, useCoachChats } from '../data/coach-chats';
import { chatSections } from '../lib/history';
import { isAnswering, openChat, stopAnswer, useCoachStore } from '../stores/coach-store';

const NONE: ReadonlySet<string> = new Set();

/** Earlier chats (design CO·H): open one, or choose chats with a long press to delete them. */
export function CoachHistoryScreen() {
  const { t } = useTranslation('coach');
  const { data: chats = [] } = useCoachChats();
  const today = useToday();
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState(NONE);
  // The chosen chats the sheet deletes, kept while it closes.
  const [deleting, setDeleting] = useState<string[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const confirm = (chatIds: string[]) => {
    setDeleting(chatIds);
    setSheetOpen(true);
  };

  const show = (chatId: string | null) => {
    openChat(chatId);
    router.back();
  };
  const toggle = (chatId: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (!next.delete(chatId)) next.add(chatId);
      return next;
    });
  const remove = async (chatIds: string[]) => {
    setSheetOpen(false);
    setSelecting(false);
    setSelected(NONE);
    // The chat Kai shows is gone: it starts a new one, and an answer still coming for it stops.
    const { chatId, pending } = useCoachStore.getState();
    if (chatIds.includes(chatId ?? '')) openChat(null);
    if (isAnswering(pending) && chatIds.includes(pending.chatId ?? '')) stopAnswer();
    await deleteCoachChats(chatIds).catch((error: unknown) =>
      console.warn('Deleting coach chats failed', error),
    );
  };

  return (
    <>
      <CoachHistoryView
        sections={chatSections(chats, new Date(today), t)}
        onOpen={show}
        onBack={() => router.back()}
        onNew={() => show(null)}
        selecting={selecting}
        selected={selected}
        onSelecting={(on) => {
          setSelecting(on);
          setSelected(NONE);
        }}
        onToggle={toggle}
        onDelete={() => confirm([...selected])}
      />
      <DeleteSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={t('history.deleteSheet.title', { count: deleting.length })}
        subtitle={t('history.deleteSheet.subtitle')}
        option={t('history.deleteSheet.option', { count: deleting.length })}
        description={t('history.deleteSheet.body', { count: deleting.length })}
        onDelete={() => void remove(deleting)}
      />
    </>
  );
}

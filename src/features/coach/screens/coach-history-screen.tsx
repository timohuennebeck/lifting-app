import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useToday } from '@/shared/hooks/use-today';
import { ActionSheet } from '@/shared/ui/action-sheet';

import { CoachHistoryView } from '../components/coach-history-view';
import { deleteCoachChats, useCoachChats } from '../data/coach-chats';
import { chatSections } from '../lib/history';
import { openChat, useCoachStore } from '../stores/coach-store';

const NONE: ReadonlySet<string> = new Set();

/** Earlier chats (design CO·H): open one, delete one from its "…", or choose several to delete. */
export function CoachHistoryScreen() {
  const { t } = useTranslation('coach');
  const { data: chats = [] } = useCoachChats();
  const today = useToday();
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState(NONE);
  // What the open sheet would delete: one chat from its "…", or the chosen ones.
  const [deleting, setDeleting] = useState<string[] | null>(null);

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
    setDeleting(null);
    setSelecting(false);
    setSelected(NONE);
    // The chat Kai shows is gone: it starts a new one.
    if (chatIds.includes(useCoachStore.getState().chatId ?? '')) openChat(null);
    await deleteCoachChats(chatIds).catch((error: unknown) =>
      console.warn('Deleting coach chats failed', error),
    );
  };

  const one = !selecting;
  const label = one
    ? t('history.deleteChat')
    : t('history.deleteConfirm', { count: deleting?.length ?? 0 });

  return (
    <View className="flex-1 bg-bg">
      <CoachHistoryView
        sections={chatSections(chats, new Date(today), t)}
        onOpen={show}
        onMenu={(chatId) => setDeleting([chatId])}
        onBack={() => router.back()}
        onNew={() => show(null)}
        selecting={selecting}
        selected={selected}
        onSelecting={(on) => {
          setSelecting(on);
          setSelected(NONE);
        }}
        onToggle={toggle}
        onDelete={() => setDeleting(selected.size ? [...selected] : null)}
      />
      <ActionSheet
        visible={!!deleting}
        onClose={() => setDeleting(null)}
        items={[{ action: 'delete', label }]}
        onAction={() => {
          if (deleting) void remove(deleting);
        }}
      />
    </View>
  );
}

import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useTabBarInset } from '@/shared/components/tab-screen';
import { useToday } from '@/shared/hooks/use-today';
import { ActionSheet } from '@/shared/ui/action-sheet';

import { CoachHistoryView } from '../components/coach-history-view';
import { deleteCoachChats, useCoachChats } from '../data/coach-chats';
import { chatSections } from '../lib/history';
import { openChat, useCoachStore } from '../stores/coach-store';

const NONE: ReadonlySet<string> = new Set();

/** Earlier chats (design CO·H): search, open one, or choose several to delete. */
export function CoachHistoryScreen() {
  const { t } = useTranslation('coach');
  const { data: chats = [] } = useCoachChats();
  const today = useToday();
  const [bottomInset, tabBarProbe] = useTabBarInset();
  const [query, setQuery] = useState('');
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState(NONE);
  const [confirming, setConfirming] = useState(false);

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
  const remove = async () => {
    const chatIds = [...selected];
    setConfirming(false);
    setSelecting(false);
    setSelected(NONE);
    // The chat on the tab is gone: the tab starts a new one.
    if (chatIds.includes(useCoachStore.getState().chatId ?? '')) openChat(null);
    await deleteCoachChats(chatIds).catch((error: unknown) =>
      console.warn('Deleting coach chats failed', error),
    );
  };

  return (
    <View className="flex-1 bg-bg">
      <CoachHistoryView
        sections={chatSections(chats, query, new Date(today), t)}
        query={query}
        onQuery={setQuery}
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
        onDelete={() => setConfirming(selected.size > 0)}
        bottomInset={bottomInset}
      />
      <ActionSheet
        visible={confirming}
        onClose={() => setConfirming(false)}
        items={[{ action: 'delete', label: t('history.deleteConfirm', { count: selected.size }) }]}
        onAction={() => void remove()}
      />
      {tabBarProbe}
    </View>
  );
}

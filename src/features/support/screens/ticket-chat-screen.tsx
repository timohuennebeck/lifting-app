import { router, useIsFocused, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { KeyboardChatScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import type Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProfile } from '@/shared/data/profile';
import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { useNow } from '@/shared/hooks/use-now';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { ChatComposer } from '../components/chat-composer';
import { DayDivider, DoneLine, SystemLine } from '../components/chat-event';
import { ChatMessage } from '../components/chat-message';
import { ClosedBanner } from '../components/closed-banner';
import { FeedbackSheet } from '../components/feedback-sheet';
import { ScreenshotViewerSheet } from '../components/screenshot-viewer-sheet';
import { TeamAvatar } from '../components/team-avatar';
import {
  isTicketActive,
  type Ticket,
  useTicket,
  useTicketEvents,
  useTicketMessages,
} from '../data/tickets';
import { useTicketFormat } from '../hooks/use-ticket-format';
import { buildTimeline, type TimelineItem } from '../lib/timeline';
import { useSeenStore } from '../stores/seen-store';

const close = () => (router.canGoBack() ? router.back() : router.replace('/profile'));

/** Ticket chat: messages, system lines, local auto reply, composer or closed banner (01f-3e…B-4b). */
export function TicketChatScreen() {
  const { t } = useTranslation('support');
  const { ticketId } = useLocalSearchParams<{ ticketId: string }>();
  const format = useTicketFormat();
  const insets = useSafeAreaInsets();
  const footerInset = useFooterInset();
  const { profile } = useProfile();
  const { data: ticket, isLoading } = useTicket(ticketId);
  const { data: messages = [] } = useTicketMessages(ticketId);
  const { data: events = [] } = useTicketEvents(ticketId);
  const markSeen = useSeenStore((s) => s.markSeen);
  const [viewerPath, setViewerPath] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrolled = useRef(false);
  // Re-render each minute so "just now" ages.
  const now = new Date(useNow(60_000));

  // Only replies that arrive while the chat is on screen count as read.
  const focused = useIsFocused();
  const lastAt = messages.at(-1)?.createdAt;
  useEffect(() => {
    if (focused && lastAt) markSeen(ticketId, lastAt);
  }, [focused, lastAt, ticketId, markSeen]);

  const items = ticket ? buildTimeline(ticket, messages, events) : [];
  const done = !!ticket && !isTicketActive(ticket.status);
  // The composer keeps 8pt above the keyboard instead of its safe-area padding.
  const keyboardOffset = footerInset - 8;

  function renderItem(item: TimelineItem, index: number, current: Ticket) {
    switch (item.type) {
      case 'day':
        return <DayDivider key={item.key} label={format.day(item.at, now)} first={index === 0} />;
      case 'message':
        return (
          <ChatMessage
            key={item.key}
            author={item.message.author}
            body={item.message.body}
            attachments={item.message.attachments}
            priority={item.priority}
            onOpenAttachment={setViewerPath}
          />
        );
      case 'created':
        return (
          <SystemLine
            key={item.key}
            title={
              current.number === null
                ? t('chat.createdPending')
                : t('chat.created', { number: current.number })
            }
            meta={t('chat.meta', {
              kind: t(`kind.${current.kind}`),
              when: format.eventWhen(item.at, now),
            })}
          />
        );
      case 'autoReply':
        return (
          <ChatMessage
            key={item.key}
            author="team"
            body={
              profile?.firstName
                ? t('chat.autoReply', { name: profile.firstName })
                : t('chat.autoReplyNoName')
            }
          />
        );
      case 'status': {
        const closed = !isTicketActive(item.status);
        // A version becomes a sentence in the user's language; notes are shown as written.
        const detail = item.version
          ? t(closed ? 'chat.liveIn' : 'chat.comingIn', { version: item.version })
          : item.note;
        return closed ? (
          <DoneLine
            key={item.key}
            resolved={item.status === 'resolved'}
            label={t(item.status === 'resolved' ? 'chat.resolved' : 'chat.closed')}
            note={detail}
          />
        ) : (
          <SystemLine
            key={item.key}
            highlight
            title={t('chat.statusLine', { status: t(`status.${item.status}`) })}
            meta={detail ?? (item.status === 'planned' ? t('chat.plannedHint') : null)}
          />
        );
      }
      case 'reopened':
        return (
          <SystemLine
            key={item.key}
            title={t('chat.reopened')}
            meta={format.eventWhen(item.at, now)}
          />
        );
    }
  }

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <ScreenHeader
        icon="close"
        onBack={close}
        className="pt-1.5 pr-5 pb-2.5 pl-4"
        title={
          <View className="flex-row items-center gap-3">
            <TeamAvatar size={28} />
            <View className="min-w-0 flex-1">
              <Text variant="bodyStrong" numberOfLines={1} className="text-base leading-5">
                {t('team')}
              </Text>
              <Text numberOfLines={1} className="font-inter text-xs text-subtle">
                {t('teamReplyTime')}
              </Text>
            </View>
          </View>
        }
        action={<View />}
      />
      <KeyboardChatScrollView
        ref={scrollRef}
        offset={keyboardOffset}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: 10,
          paddingHorizontal: 16,
          paddingTop: 18,
          paddingBottom: 12,
        }}
        onContentSizeChange={() => {
          scrollRef.current?.scrollToEnd({ animated: scrolled.current });
          scrolled.current = true;
        }}
      >
        {ticket
          ? items.map((item, index) => renderItem(item, index, ticket))
          : !isLoading && (
              <Text variant="paragraph" tone="subtle" className="pt-12 text-center">
                {t('chat.notFound')}
              </Text>
            )}
      </KeyboardChatScrollView>
      {ticket && !done ? (
        <KeyboardStickyView offset={{ closed: 0, opened: keyboardOffset }}>
          <View style={{ paddingBottom: footerInset }}>
            <ChatComposer ticketId={ticketId} />
          </View>
        </KeyboardStickyView>
      ) : null}
      {ticket && done ? (
        <View className="pt-2" style={{ paddingBottom: footerInset }}>
          <ClosedBanner ticketId={ticketId} onNewTicket={() => setSheetOpen(true)} />
        </View>
      ) : null}
      <ScreenshotViewerSheet path={viewerPath} onClose={() => setViewerPath(null)} />
      <FeedbackSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </View>
  );
}

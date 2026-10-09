import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';

import { isTicketActive, useTickets } from '../data/tickets';
import { FeedbackSheet } from './feedback-sheet';
import { OpenTicketRow } from './open-ticket-row';

const VISIBLE = 3;

/** Profile block: open tickets with count, "All tickets" and "Create ticket" (design 01b-2). */
export function OpenTicketsSection() {
  const { t } = useTranslation('support');
  const { data: tickets = [] } = useTickets();
  const [sheetOpen, setSheetOpen] = useState(false);
  const open = tickets.filter((ticket) => isTicketActive(ticket.status));

  return (
    <View className="mt-8.5">
      <View className="mx-5 mb-1.5 min-h-5.5 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <Text variant="overline" tone="subtle" className="text-[11px]">
            {t('profile.openTickets')}
          </Text>
          {open.length ? (
            <View className="h-5.5 min-w-5.5 items-center justify-center rounded-full bg-control px-1.5">
              <Text variant="caption" className="text-xs">
                {open.length}
              </Text>
            </View>
          ) : null}
        </View>
        {tickets.length ? (
          <TextButton
            label={t('profile.allTickets')}
            tone="muted"
            className="min-h-0 px-0"
            textClassName="text-[13px] leading-4.25"
            onPress={() => router.push('/support')}
          />
        ) : null}
      </View>
      <View className="mx-5">
        {open.length ? (
          open.slice(0, VISIBLE).map((ticket) => <OpenTicketRow key={ticket.id} ticket={ticket} />)
        ) : (
          <Text variant="paragraph" tone="subtle" className="py-3">
            {t('profile.empty')}
          </Text>
        )}
      </View>
      <Button
        label={t('profile.create')}
        icon="plus"
        variant="secondary"
        size="md"
        className="mx-5 mt-2.5"
        onPress={() => setSheetOpen(true)}
      />
      <FeedbackSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </View>
  );
}

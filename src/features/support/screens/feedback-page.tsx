import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { PagerPage } from '@/shared/components/pager-page';
import { useProfile } from '@/shared/data/profile';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';

import { FeedbackSheet } from '../components/feedback-sheet';
import { TicketListRow } from '../components/ticket-list-row';
import { useTickets } from '../data/tickets';

/**
 * Profile, "Feedback": the user's tickets with the team's replies, newest activity first, and a
 * way to report a bug or share an idea. Without tickets it invites the first one.
 */
export function FeedbackPage() {
  const { t } = useTranslation('support');
  const { profile } = useProfile();
  const { data: tickets = [], isLoading } = useTickets();
  const [sheetOpen, setSheetOpen] = useState(false);
  const create = (
    <Button
      label={t('feedback.create')}
      icon="plus"
      size="md"
      variant="secondary"
      onPress={() => setSheetOpen(true)}
    />
  );

  return (
    <PagerPage>
      {tickets.length ? (
        <View className="gap-1 px-5 pt-5">
          {create}
          <View className="pt-2">
            {tickets.map((ticket) => (
              <TicketListRow key={ticket.id} ticket={ticket} userName={profile?.firstName ?? ''} />
            ))}
          </View>
        </View>
      ) : !isLoading ? (
        <View className="items-center gap-4 px-8 pt-14">
          <View className="items-center gap-2">
            <Text variant="headline" className="text-center">
              {t('feedback.emptyTitle')}
            </Text>
            <Text variant="paragraph" tone="subtle" className="text-center">
              {t('list.emptyHint')}
            </Text>
          </View>
          {create}
        </View>
      ) : null}
      <FeedbackSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </PagerPage>
  );
}

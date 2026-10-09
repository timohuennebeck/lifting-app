import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { haptics } from '@/shared/lib/haptics';
import { useUserId } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';

import { reopenTicket } from '../data/ticket-mutations';

export interface ClosedBannerProps {
  ticketId: string;
  onNewTicket: () => void;
}

/** Replaces the composer of a resolved or closed ticket: reopen it or start a new one (01f·B-2). */
export function ClosedBanner({ ticketId, onNewTicket }: ClosedBannerProps) {
  const { t } = useTranslation('support');
  const userId = useUserId();

  async function reopen() {
    if (!userId) return;
    await reopenTicket(userId, ticketId);
    haptics.success();
  }

  return (
    <View className="mx-4 gap-3.5 rounded-3xl bg-tile p-4.5">
      <View className="gap-1">
        <Text variant="bodyStrong" className="text-base leading-5">
          {t('chat.doneTitle')}
        </Text>
        <Text variant="paragraph" tone="subtle" className="text-sm leading-5">
          {t('chat.doneBody')}
        </Text>
      </View>
      <View className="flex-row gap-2">
        <Button
          label={t('chat.reopen')}
          variant="secondary"
          size="md"
          className="flex-1 px-2"
          onPress={reopen}
        />
        <Button
          label={t('chat.newTicket')}
          size="md"
          className="flex-1 px-2"
          onPress={onNewTicket}
        />
      </View>
    </View>
  );
}

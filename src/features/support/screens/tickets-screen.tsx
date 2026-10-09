import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProfile } from '@/shared/data/profile';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { FeedbackSheet } from '../components/feedback-sheet';
import { SearchField } from '../components/search-field';
import { TicketListRow } from '../components/ticket-list-row';
import { useTickets } from '../data/tickets';

/** All tickets with team replies, searchable (design 01f-2). */
export function TicketsScreen() {
  const { t } = useTranslation('support');
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const { data: tickets = [], isLoading } = useTickets();
  const [query, setQuery] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const needle = query.trim().toLowerCase();
  const shown = needle ? tickets.filter((ticket) => ticket.searchText.includes(needle)) : tickets;
  const openSheet = () => setSheetOpen(true);

  return (
    <Screen
      header={
        <ScreenHeader
          icon="close"
          title={t('list.title')}
          action={
            <IconButton icon="plus" accessibilityLabel={t('list.create')} onPress={openSheet} />
          }
        />
      }
    >
      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder={t('list.search')}
        className="mx-5 mt-3.5"
      />
      <FlatList
        data={shown}
        keyExtractor={(ticket) => ticket.id}
        renderItem={({ item }) => (
          <TicketListRow ticket={item} userName={profile?.firstName ?? ''} />
        )}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pt-3.5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        ListEmptyComponent={
          isLoading ? null : needle ? (
            <Text variant="paragraph" tone="subtle" className="pt-8 text-center">
              {t('list.noResults', { query: query.trim() })}
            </Text>
          ) : (
            <View className="items-center gap-4 px-3 pt-12">
              <View className="items-center gap-2">
                <Text variant="headline" className="text-center">
                  {t('list.empty')}
                </Text>
                <Text variant="paragraph" tone="subtle" className="text-center">
                  {t('list.emptyHint')}
                </Text>
              </View>
              <Button
                label={t('list.create')}
                icon="plus"
                size="md"
                variant="secondary"
                onPress={openSheet}
              />
            </View>
          )
        }
      />
      <FeedbackSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} />
    </Screen>
  );
}

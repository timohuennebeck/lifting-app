import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type CollectionSummary, useCollections } from '@/shared/data/templates';
import { useLastDefined } from '@/shared/hooks/use-last-defined';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { IconButton } from '@/shared/ui/icon-button';
import { ListRow } from '@/shared/ui/list-row';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { afterSheetClose } from '@/shared/ui/sheet';
import { SwipeToDelete } from '@/shared/ui/swipe-to-delete';
import { Text } from '@/shared/ui/text';
import { TextInputSheet } from '@/shared/ui/text-input-sheet';

import { CollectionOptionsSheet } from '../components/collection-options-sheet';
import { DeleteCollectionSheet } from '../components/delete-collection-sheet';
import { NewCollectionSheet } from '../components/new-collection-sheet';
import { renameCollection } from '../data/template-mutations';

/**
 * Manage collections: "⋯" renames or deletes, swiping a row left deletes (01·V·S, 01·V·A·4,
 * 01·V·A·5), as with trainings.
 */
export function CollectionsScreen() {
  const { t } = useTranslation(['training', 'common']);
  const insets = useSafeAreaInsets();
  const { data: collections = [], isLoading } = useCollections();
  const [renaming, setRenaming] = useState<CollectionSummary | null>(null);
  const [deleting, setDeleting] = useState<CollectionSummary | null>(null);
  const [creating, setCreating] = useState(false);
  const [options, setOptions] = useState<CollectionSummary | null>(null);
  const renameShown = useLastDefined(renaming);
  const optionsShown = useLastDefined(options);
  // Options → rename or delete: the next sheet opens once this one has gone.
  const then = (next: () => void) => {
    setOptions(null);
    afterSheetClose(next);
  };

  return (
    <Screen
      header={
        <ScreenHeader
          className="px-5 pt-2.5"
          title={t('collections.title')}
          action={
            <IconButton
              icon="plus"
              iconSize={14}
              accessibilityLabel={t('collections.newTitle')}
              onPress={() => setCreating(true)}
            />
          }
        />
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="grow px-2 pt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {collections.map((c) => (
          <SwipeToDelete
            key={c.id}
            label={t('collections.deleteA11y', { name: c.name })}
            onDelete={() => setDeleting(c)}
          >
            <ListRow
              // Opaque: the row slides over the delete button when swiped.
              className="bg-bg px-3"
              badge={c.templateCount}
              title={c.name}
              subtitle={t('collections.templateCount', { count: c.templateCount })}
              trailing={
                <PressableScale
                  haptic="tap"
                  hitSlop={4}
                  accessibilityLabel={t('collections.moreA11y', { name: c.name })}
                  onPress={() => setOptions(c)}
                  className="size-10 items-center justify-center rounded-full bg-elevated"
                >
                  <Icon name="more" size={14} />
                </PressableScale>
              }
            />
          </SwipeToDelete>
        ))}
        {!isLoading && !collections.length ? (
          <View className="items-center gap-4 px-8 pt-16">
            <View className="items-center gap-2">
              <Text variant="headline" className="text-center">
                {t('collections.empty')}
              </Text>
              <Text variant="paragraph" tone="subtle" className="text-center">
                {t('collections.emptyHint')}
              </Text>
            </View>
            <Button
              label={t('create.createCollection')}
              icon="plus"
              size="md"
              variant="secondary"
              onPress={() => setCreating(true)}
            />
          </View>
        ) : null}
      </ScrollView>

      <TextInputSheet
        visible={!!renaming}
        onClose={() => setRenaming(null)}
        title={t('collections.renameTitle')}
        subtitle={t('collections.templateCount', { count: renameShown?.templateCount ?? 0 })}
        initialValue={renameShown?.name}
        placeholder={t('collections.namePlaceholder')}
        ctaLabel={t('common:actions.save')}
        onSubmit={async (name) => {
          if (renaming) await renameCollection(renaming.id, name);
          setRenaming(null);
        }}
      />
      <NewCollectionSheet
        visible={creating}
        onClose={() => setCreating(false)}
        onCreated={() => setCreating(false)}
      />
      <CollectionOptionsSheet
        visible={!!options}
        onClose={() => setOptions(null)}
        name={optionsShown?.name ?? ''}
        templateCount={optionsShown?.templateCount ?? 0}
        onRename={() => then(() => setRenaming(options))}
        onDelete={() => then(() => setDeleting(options))}
      />
      <DeleteCollectionSheet collection={deleting} onClose={() => setDeleting(null)} />
    </Screen>
  );
}

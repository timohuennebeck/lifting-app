import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { type CollectionSummary, useCollections } from '@/shared/data/templates';
import { useLastDefined } from '@/shared/hooks/use-last-defined';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { ListRow } from '@/shared/ui/list-row';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';
import { TextInputSheet } from '@/shared/ui/text-input-sheet';

import { DeleteCollectionSheet } from '../components/delete-collection-sheet';
import { MinusGlyph, RenameGlyph } from '../components/glyphs';
import { NewCollectionSheet } from '../components/new-collection-sheet';
import { renameCollection } from '../data/template-mutations';

/** Manage collections: rename (Aa) and delete (01·V·S, 01·V·A·4, 01·V·A·5). */
export function CollectionsScreen() {
  const { t } = useTranslation(['training', 'common']);
  const insets = useSafeAreaInsets();
  const { data: collections = [], isLoading } = useCollections();
  const [renaming, setRenaming] = useState<CollectionSummary | null>(null);
  const [deleting, setDeleting] = useState<CollectionSummary | null>(null);
  const [creating, setCreating] = useState(false);
  const renameShown = useLastDefined(renaming);

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
          <ListRow
            key={c.id}
            className="px-3"
            badge={c.templateCount}
            title={c.name}
            subtitle={t('collections.templateCount', { count: c.templateCount })}
            trailing={
              <View className="flex-row gap-2">
                <PressableScale
                  hitSlop={4}
                  accessibilityLabel={t('collections.renameA11y', { name: c.name })}
                  onPress={() => setRenaming(c)}
                  className="size-10 items-center justify-center rounded-full bg-elevated"
                >
                  <RenameGlyph size={14} />
                </PressableScale>
                <PressableScale
                  hitSlop={4}
                  haptic="warning"
                  accessibilityLabel={t('collections.deleteA11y', { name: c.name })}
                  onPress={() => setDeleting(c)}
                  className="size-10 items-center justify-center rounded-full bg-red"
                >
                  <MinusGlyph width={14} />
                </PressableScale>
              </View>
            }
          />
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
      <DeleteCollectionSheet collection={deleting} onClose={() => setDeleting(null)} />
    </Screen>
  );
}

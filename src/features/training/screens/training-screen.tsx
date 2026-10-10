import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import Sortable from 'react-native-sortables';

import { TabScreen } from '@/shared/components/tab-screen';
import { useProfile } from '@/shared/data/profile';
import {
  type CollectionSummary,
  type TemplateSummary,
  useCollections,
  useTemplates,
} from '@/shared/data/templates';
import { useLastDefined } from '@/shared/hooks/use-last-defined';
import { haptics } from '@/shared/lib/haptics';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { afterSheetClose } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';
import { TextInputSheet } from '@/shared/ui/text-input-sheet';

import { CollectionOptionsSheet } from '../components/collection-options-sheet';
import { type CollectionTab, CollectionTabs } from '../components/collection-tabs';
import { CreateSheet } from '../components/create-sheet';
import { DeleteCollectionSheet } from '../components/delete-collection-sheet';
import { NewCollectionSheet } from '../components/new-collection-sheet';
import { TemplateOptionsSheet } from '../components/template-options-sheet';
import { TemplateRow } from '../components/template-row';
import {
  deleteTemplate,
  renameCollection,
  renameTemplate,
  reorderTemplates,
} from '../data/template-mutations';
import { useStartTemplate } from '../hooks/use-start-template';

const NONE = 'none';

/**
 * Training tab: templates grouped by collection (01·V·A) with create flows (01·V·A·6/7). Holding a
 * collection renames or deletes it (01·V·A·4, 01·V·A·5).
 */
export function TrainingScreen() {
  const { t } = useTranslation(['training', 'common']);
  const { profile } = useProfile();
  const { data: templates = [], isLoading } = useTemplates();
  const { data: collections = [] } = useCollections();
  const { start, startingId } = useStartTemplate();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newCollectionOpen, setNewCollectionOpen] = useState(false);
  const [options, setOptions] = useState<TemplateSummary | null>(null);
  const optionsShown = useLastDefined(options);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  // A drag ends with a release over the row: that must not open the template.
  const dragging = useRef(false);
  const [renaming, setRenaming] = useState<TemplateSummary | null>(null);
  const renameShown = useLastDefined(renaming);
  const [collectionOptions, setCollectionOptions] = useState<CollectionSummary | null>(null);
  const collectionOptionsShown = useLastDefined(collectionOptions);
  const [renamingCollection, setRenamingCollection] = useState<CollectionSummary | null>(null);
  const renamingCollectionShown = useLastDefined(renamingCollection);
  const [deletingCollection, setDeletingCollection] = useState<CollectionSummary | null>(null);
  // Collection options → rename or delete: the next sheet opens once this one has gone.
  const thenFromCollection = (next: (c: CollectionSummary) => void) => {
    const collection = collectionOptions;
    setCollectionOptions(null);
    if (collection) afterSheetClose(() => next(collection));
  };

  const looseCount = templates.filter((tpl) => !tpl.collectionId).length;
  const tabs: CollectionTab[] = [
    ...collections.map((c) => ({
      key: c.id,
      name: c.name,
      count: c.templateCount,
      editable: true,
    })),
    ...(looseCount ? [{ key: NONE, name: t('list.noCollection'), count: looseCount }] : []),
  ];
  const fallbackKey =
    tabs.find((tab) => tab.key === profile?.activeCollectionId)?.key ?? tabs[0]?.key ?? null;
  const selected = tabs.some((tab) => tab.key === selectedKey) ? selectedKey : fallbackKey;
  const rows = templates.filter((tpl) => (tpl.collectionId ?? NONE) === selected);
  const selectedCollectionId = selected && selected !== NONE ? selected : undefined;

  const openNewTemplate = () =>
    router.push({
      pathname: '/template/new',
      params: selectedCollectionId ? { collectionId: selectedCollectionId } : {},
    });

  return (
    <TabScreen
      scrollRef={scrollRef}
      headerActions={
        <>
          <IconButton
            icon="plus"
            iconSize={14}
            accessibilityLabel={t('header.create')}
            onPress={() => setCreateOpen(true)}
          />
        </>
      }
    >
      <Text variant="title" className="px-5 pt-8 normal-case">
        {t('list.title')}
      </Text>
      {tabs.length ? (
        <CollectionTabs
          tabs={tabs}
          selected={selected}
          onSelect={setSelectedKey}
          onOptions={(key) => setCollectionOptions(collections.find((c) => c.id === key) ?? null)}
          optionsLabel={(name) => t('collections.moreA11y', { name })}
        />
      ) : null}
      <View className="px-4 pt-3">
        {/* Hold a training to drag it to another place in its collection. */}
        <Sortable.Grid
          data={rows}
          keyExtractor={(tpl) => tpl.id}
          columns={1}
          rowGap={8}
          scrollableRef={scrollRef}
          dragActivationDelay={250}
          activeItemScale={1.03}
          inactiveItemOpacity={0.6}
          hapticsEnabled={false}
          onDragStart={() => {
            dragging.current = true;
            haptics.press();
          }}
          onDragEnd={({ data, fromIndex, toIndex }) => {
            setTimeout(() => (dragging.current = false), 150);
            if (toIndex !== fromIndex) void reorderTemplates(data.map((tpl) => tpl.id));
          }}
          renderItem={({ item: tpl }) => (
            <TemplateRow
              name={tpl.name}
              minutes={tpl.estimatedMinutes}
              exerciseCount={tpl.exerciseCount}
              items={tpl.items}
              starting={startingId === tpl.id}
              onPress={() => {
                if (!dragging.current) router.push(`/template/${tpl.id}`);
              }}
              onStart={() => {
                if (!dragging.current) start(tpl);
              }}
              onMore={() => {
                if (!dragging.current) setOptions(tpl);
              }}
            />
          )}
        />
      </View>
      {!isLoading && !rows.length ? (
        <View className="items-center gap-4 px-8 pt-12">
          <View className="items-center gap-2">
            <Text variant="headline" className="text-center">
              {tabs.length ? t('list.emptyCollection') : t('list.empty')}
            </Text>
            <Text variant="paragraph" tone="subtle" className="text-center">
              {t('list.emptyHint')}
            </Text>
          </View>
          <Button
            label={t('create.createTemplate')}
            icon="plus"
            size="md"
            variant="secondary"
            onPress={openNewTemplate}
          />
        </View>
      ) : null}
      {/* The list ends 40pt above the tab bar inset; TabScreen adds 24. */}
      <View className="h-4" />

      <CreateSheet
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreateCollection={() => {
          setCreateOpen(false);
          afterSheetClose(() => setNewCollectionOpen(true));
        }}
        onCreateTemplate={() => {
          setCreateOpen(false);
          afterSheetClose(openNewTemplate);
        }}
      />
      <TemplateOptionsSheet
        visible={!!options}
        onClose={() => setOptions(null)}
        name={optionsShown?.name ?? ''}
        exerciseCount={optionsShown?.exerciseCount ?? 0}
        minutes={optionsShown?.estimatedMinutes ?? 0}
        onRename={() => {
          const tpl = options;
          setOptions(null);
          afterSheetClose(() => setRenaming(tpl));
        }}
        onDelete={async () => {
          const tpl = options;
          setOptions(null);
          if (!tpl) return;
          await deleteTemplate(tpl.id);
          haptics.success();
        }}
      />
      <TextInputSheet
        visible={!!renaming}
        onClose={() => setRenaming(null)}
        title={t('options.renameTitle')}
        initialValue={renameShown?.name}
        placeholder={t('options.namePlaceholder')}
        ctaLabel={t('common:actions.save')}
        onSubmit={async (name) => {
          if (renaming) await renameTemplate(renaming.id, name);
          setRenaming(null);
        }}
      />
      <NewCollectionSheet
        visible={newCollectionOpen}
        onClose={() => setNewCollectionOpen(false)}
        onCreated={(id) => {
          setSelectedKey(id);
          setNewCollectionOpen(false);
        }}
      />
      <CollectionOptionsSheet
        visible={!!collectionOptions}
        onClose={() => setCollectionOptions(null)}
        name={collectionOptionsShown?.name ?? ''}
        templateCount={collectionOptionsShown?.templateCount ?? 0}
        onRename={() => thenFromCollection(setRenamingCollection)}
        onDelete={() => thenFromCollection(setDeletingCollection)}
      />
      <TextInputSheet
        visible={!!renamingCollection}
        onClose={() => setRenamingCollection(null)}
        title={t('collections.renameTitle')}
        subtitle={t('collections.templateCount', {
          count: renamingCollectionShown?.templateCount ?? 0,
        })}
        initialValue={renamingCollectionShown?.name}
        placeholder={t('collections.namePlaceholder')}
        ctaLabel={t('common:actions.save')}
        onSubmit={async (name) => {
          if (renamingCollection) await renameCollection(renamingCollection.id, name);
          setRenamingCollection(null);
        }}
      />
      <DeleteCollectionSheet
        collection={deletingCollection}
        onClose={() => setDeletingCollection(null)}
      />
    </TabScreen>
  );
}

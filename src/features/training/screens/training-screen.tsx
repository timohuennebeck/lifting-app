import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { TabScreen } from '@/shared/components/tab-screen';
import { useProfile } from '@/shared/data/profile';
import { useCollections, useTemplates } from '@/shared/data/templates';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { afterSheetClose } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

import { type CollectionTab, CollectionTabs } from '../components/collection-tabs';
import { CreateSheet } from '../components/create-sheet';
import { CollectionsGlyph } from '../components/glyphs';
import { NewCollectionSheet } from '../components/new-collection-sheet';
import { TemplateRow } from '../components/template-row';
import { useStartTemplate } from '../hooks/use-start-template';

const NONE = 'none';

/** Training tab: templates grouped by collection (01·V·A) with create flows (01·V·A·6/7). */
export function TrainingScreen() {
  const { t } = useTranslation(['training', 'common']);
  const { profile } = useProfile();
  const { data: templates = [], isLoading } = useTemplates();
  const { data: collections = [] } = useCollections();
  const { start, startingId } = useStartTemplate();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newCollectionOpen, setNewCollectionOpen] = useState(false);

  const looseCount = templates.filter((tpl) => !tpl.collectionId).length;
  const tabs: CollectionTab[] = [
    ...collections.map((c) => ({ key: c.id, name: c.name, count: c.templateCount })),
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
      contentClassName="pt-3"
      headerActions={
        <>
          <PressableScale
            hitSlop={4}
            accessibilityLabel={t('header.collections')}
            onPress={() => router.push('/template/collections')}
            className="size-[42px] items-center justify-center rounded-full bg-elevated"
          >
            <CollectionsGlyph />
          </PressableScale>
          <IconButton
            icon="plus"
            iconSize={14}
            accessibilityLabel={t('header.create')}
            onPress={() => setCreateOpen(true)}
          />
        </>
      }
    >
      <Text variant="title" className="px-5 pt-5 normal-case">
        {t('list.title')}
      </Text>
      {tabs.length ? (
        <CollectionTabs tabs={tabs} selected={selected} onSelect={setSelectedKey} />
      ) : null}
      <View className="px-2 pt-3">
        {rows.map((tpl, i) => (
          <TemplateRow
            key={tpl.id}
            index={i + 1}
            name={tpl.name}
            minutes={tpl.estimatedMinutes}
            exerciseCount={tpl.exerciseCount}
            starting={startingId === tpl.id}
            onPress={() => router.push(`/template/${tpl.id}`)}
            onStart={() => start(tpl)}
          />
        ))}
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
      <NewCollectionSheet
        visible={newCollectionOpen}
        onClose={() => setNewCollectionOpen(false)}
        onCreated={(id) => {
          setSelectedKey(id);
          setNewCollectionOpen(false);
        }}
      />
    </TabScreen>
  );
}

import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { useCollections } from '@/shared/data/templates';
import { haptics } from '@/shared/lib/haptics';
import { requireUserId } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { Chip } from '@/shared/ui/chip';
import { IconButton } from '@/shared/ui/icon-button';
import { Screen } from '@/shared/ui/screen';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';

import { createTemplate } from '../data/template-mutations';

/** Creates an empty template (name + optional collection), then opens its overview. */
export function NewTemplateScreen() {
  const params = useLocalSearchParams<{ collectionId?: string }>();
  const { t } = useTranslation(['training', 'common']);
  const { data: collections = [] } = useCollections();
  const [name, setName] = useState('');
  const [collectionId, setCollectionId] = useState<string | null>(params.collectionId ?? null);
  const [saving, setSaving] = useState(false);
  const valid = name.trim().length > 0;

  const create = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      const id = await createTemplate(requireUserId(), name, collectionId);
      haptics.success();
      router.replace(`/template/${id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      scroll
      header={
        <View className="flex-row items-center gap-3 px-4 py-1.5">
          <IconButton
            icon="chevron-left"
            accessibilityLabel={t('common:actions.back')}
            onPress={() => router.back()}
          />
        </View>
      }
      footer={
        <Button
          label={t('create.createTemplate')}
          disabled={!valid}
          loading={saving}
          onPress={create}
        />
      }
    >
      <Text variant="title" className="px-5 pt-5 normal-case">
        {t('newTemplate.title')}
      </Text>
      <TextField
        className="px-4 pt-6"
        label={t('newTemplate.name')}
        value={name}
        onChangeText={setName}
        placeholder={t('newTemplate.namePlaceholder')}
        autoFocus
        clearable
        maxLength={40}
        returnKeyType="done"
        onSubmitEditing={create}
      />
      {collections.length ? (
        <View className="gap-2 pt-7">
          <Text variant="overline" tone="subtle" className="px-5">
            {t('newTemplate.collection')}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="gap-1.5 px-4"
          >
            <Chip
              label={t('list.noCollection')}
              selected={collectionId === null}
              onPress={() => setCollectionId(null)}
            />
            {collections.map((c) => (
              <Chip
                key={c.id}
                label={c.name}
                selected={collectionId === c.id}
                onPress={() => setCollectionId(c.id)}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}
    </Screen>
  );
}

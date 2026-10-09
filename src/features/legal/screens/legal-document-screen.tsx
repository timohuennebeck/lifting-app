import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatDate } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Markdown, parseMarkdown } from '@/shared/ui/markdown';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { isLegalKind, type LegalKind, useLegalDocument } from '../data/legal-documents';

/** Terms of use or privacy policy, as published in `legal_documents`. */
export function LegalDocumentScreen() {
  const { kind } = useLocalSearchParams<{ kind: string }>();
  return (
    <Screen header={<ScreenHeader />}>
      {isLegalKind(kind) ? <LegalDocumentBody kind={kind} /> : null}
    </Screen>
  );
}

function LegalDocumentBody({ kind }: { kind: LegalKind }) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    data: doc,
    isPending,
    isError,
    isRefetching,
    refetch,
  } = useLegalDocument(kind, i18n.language);
  const blocks = doc ? parseMarkdown(doc.contentMd) : [];

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.fg} />
      </View>
    );
  }
  if (!doc) {
    return (
      <View className="flex-1 items-center justify-center gap-5 px-8">
        <Text variant="paragraph" tone="subtle" className="text-center">
          {isError ? t('legal.loadFailed') : t('legal.unavailable')}
        </Text>
        {isError ? (
          <Button
            label={t('actions.retry')}
            variant="secondary"
            loading={isRefetching}
            onPress={() => refetch()}
          />
        ) : null}
      </View>
    );
  }

  // The document's own top heading becomes the page title.
  const [first, ...rest] = blocks;
  const ownTitle = first?.type === 'heading' && first.level === 1;
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
    >
      <View className="gap-2 px-5 pt-4">
        <Text accessibilityRole="header" className="font-inter-semibold text-[30px] leading-8">
          {ownTitle ? first.text : t(`legal.${kind}`)}
        </Text>
        <Text variant="caption" tone="subtle" className="font-inter">
          {t('legal.meta', {
            version: doc.version,
            date: formatDate(new Date(doc.effectiveAt), { dateStyle: 'long' }),
          })}
        </Text>
      </View>
      <Markdown blocks={ownTitle ? rest : blocks} className="px-5 pt-4" />
    </ScrollView>
  );
}

import { useLocalSearchParams } from 'expo-router';
import { useMemo, useRef } from 'react';
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

import { LegalDiffView } from '../components/legal-diff-view';
import {
  isLegalKind,
  type LegalKind,
  useLegalDocument,
  useLegalDocumentById,
} from '../data/legal-documents';
import { diffLegalDocuments } from '../lib/legal-diff';

/**
 * Terms of use or privacy policy, as published in `legal_documents`. From the update page it
 * gets `compare` (the version the user accepted, by id) and `section`: then everything changed
 * since that version is marked and the page opens at the section.
 */
export function LegalDocumentScreen() {
  const { kind, compare, section } = useLocalSearchParams<{
    kind: string;
    compare?: string;
    section?: string;
  }>();
  return (
    <Screen header={<ScreenHeader />}>
      {isLegalKind(kind) ? (
        <LegalDocumentBody kind={kind} compareId={compare || undefined} section={section} />
      ) : null}
    </Screen>
  );
}

interface LegalDocumentBodyProps {
  kind: LegalKind;
  compareId?: string;
  section?: string;
}

function LegalDocumentBody({ kind, compareId, section }: LegalDocumentBodyProps) {
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
  const { data: previous } = useLegalDocumentById(compareId);
  const diff = useMemo(
    () => (doc && previous ? diffLegalDocuments(previous.contentMd, doc.contentMd) : null),
    [doc, previous],
  );
  const scroll = useRef<ScrollView>(null);
  // The asked-for section is scrolled to once both its place and where the sections start
  // are known (layout reports them in no fixed order).
  const sectionsTop = useRef<number | null>(null);
  const sectionY = useRef<number | null>(null);
  const scrolled = useRef(false);
  const scrollToSection = () => {
    if (scrolled.current || sectionsTop.current == null || sectionY.current == null) return;
    scrolled.current = true;
    scroll.current?.scrollTo({
      // Within the gap between sections, so no line of the one before peeks in.
      y: Math.max(0, sectionsTop.current + sectionY.current - 8),
      animated: false,
    });
  };
  const onSectionLayout = (key: string, y: number) => {
    if (key !== section) return;
    sectionY.current = y;
    scrollToSection();
  };

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
      ref={scroll}
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
      {diff ? (
        <View
          onLayout={(e) => {
            sectionsTop.current = e.nativeEvent.layout.y;
            scrollToSection();
          }}
        >
          <LegalDiffView sections={diff} onSectionLayout={onSectionLayout} className="px-5 pt-4" />
        </View>
      ) : (
        <Markdown blocks={ownTitle ? rest : blocks} className="px-5 pt-4" />
      )}
    </ScrollView>
  );
}

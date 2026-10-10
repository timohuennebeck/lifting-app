import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { supabase } from '@/shared/data/supabase';
import { useActiveWorkout } from '@/shared/data/workouts';
import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { useHardwareBack } from '@/shared/hooks/use-hardware-back';
import { cn } from '@/shared/lib/cn';
import { formatDate } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { requireUserId } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { Icon, type IconName } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';

import {
  acceptDocuments,
  type PendingDocument,
  usePendingLegalDocuments,
} from '../data/legal-acceptances';
import type { LegalDocument } from '../data/legal-documents';
import { diffLegalDocuments, type LegalChange, legalChanges } from '../lib/legal-diff';

const LONG_DATE = { day: 'numeric', month: 'long', year: 'numeric' } as const;

const CHANGE_ICON: Record<LegalChange['kind'], { icon: IconName; box: string; color: string }> = {
  added: { icon: 'plus', box: 'bg-accent', color: colors.onAccent },
  changed: { icon: 'pencil', box: 'bg-fg', color: colors.bg },
  removed: { icon: 'minus', box: 'bg-control', color: colors.fg },
};

interface ChangeRow {
  change: LegalChange;
  pending: PendingDocument;
}

/**
 * Covers the app while a new terms or privacy version that needs consent is in effect: what
 * changed since the version the user accepted (worked out by comparing both), each change
 * opening the document there with the edits marked; then agree or sign out. Waits while a
 * workout is running, so it never interrupts a set.
 */
export function LegalUpdateGate() {
  const { t, i18n } = useTranslation('common');
  const insets = useSafeAreaInsets();
  const footerInset = useFooterInset();
  const { pending, settled } = usePendingLegalDocuments(i18n.language);
  const { data: activeWorkout } = useActiveWorkout();
  const [busy, setBusy] = useState(false);
  const shown = pending.length > 0 && !activeWorkout;
  // On launch the splash screen stays until this check is done, so the app never shows first
  // with the gate popping up over it (the root layout stops waiting after a moment).
  useEffect(() => {
    if (settled) SplashScreen.hide();
  }, [settled]);
  // Back would reach the app underneath.
  useHardwareBack(() => {}, shown);
  const rows = useMemo(
    () =>
      pending.flatMap((p): ChangeRow[] =>
        p.previous
          ? legalChanges(diffLegalDocuments(p.previous.contentMd, p.document.contentMd)).map(
              (change) => ({ change, pending: p }),
            )
          : [],
      ),
    [pending],
  );
  if (!shown) return null;

  const kinds = new Set(pending.map((p) => p.document.kind));
  const both = kinds.size > 1;
  const title = both
    ? t('legal.update.titleBoth')
    : t(kinds.has('terms') ? 'legal.update.titleTerms' : 'legal.update.titlePrivacy');
  const first = pending[0];

  async function accept() {
    setBusy(true);
    try {
      await acceptDocuments(
        requireUserId(),
        pending.map((p) => p.document),
      );
      haptics.success();
    } catch (error) {
      console.warn('Recording the legal acceptance failed', error);
      haptics.error();
    } finally {
      setBusy(false);
    }
  }

  const sectionLabel = ({ change, pending: p }: ChangeRow) => {
    const doc = t(`legal.update.docShort.${p.document.kind}`);
    if (!change.number) return both ? doc : '';
    return both
      ? t('legal.update.docSection', { doc, number: change.number })
      : t('legal.update.section', { number: change.number });
  };

  return (
    <View
      className="absolute inset-0 bg-bg"
      style={{ paddingTop: insets.top, paddingBottom: footerInset }}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-6">
        <VersionIllustration from={first.previousVersion} to={first.document.version} />
        <View className="gap-2.5 px-5 pt-7">
          <Text accessibilityRole="header" className="font-inter-semibold text-[28px] leading-8">
            {title}
          </Text>
          <Text variant="paragraph" tone="subtle">
            {rows.length
              ? t('legal.update.changes', { count: rows.length })
              : t('legal.update.subtitle')}
          </Text>
        </View>
        <View className="gap-1 px-4 pt-5">
          {rows.length
            ? rows.map((row) => (
                <ChangeLink
                  key={`${row.pending.document.id}-${row.change.key}`}
                  row={row}
                  section={sectionLabel(row)}
                />
              ))
            : // Nothing to compare with (never accepted a version): open the new texts instead.
              pending.map(({ document }) => <DocumentLink key={document.id} document={document} />)}
        </View>
      </ScrollView>
      <View className="gap-1 px-4 pt-2">
        <Button label={t('legal.update.accept')} loading={busy} onPress={accept} />
        <TextButton
          label={t('legal.update.signOut')}
          tone="muted"
          onPress={() => void supabase.auth.signOut()}
        />
      </View>
    </View>
  );
}

/** One changed section: opens the document there with the edits marked. */
function ChangeLink({ row: { change, pending }, section }: { row: ChangeRow; section: string }) {
  const { t } = useTranslation('common');
  const look = CHANGE_ICON[change.kind];
  const name = change.title || t('legal.update.intro');
  return (
    <PressableScale
      haptic="tap"
      activeScale={0.98}
      accessibilityRole="link"
      accessibilityLabel={`${t(`legal.update.kinds.${change.kind}`)}: ${name} ${section}`}
      onPress={() =>
        router.push({
          pathname: '/legal/[kind]',
          params: {
            kind: pending.document.kind,
            compare: pending.previous?.id ?? '',
            section: change.key,
          },
        })
      }
      className="min-h-14 flex-row items-center gap-3.5 px-1 py-2"
    >
      <View className={cn('size-10 items-center justify-center rounded-full', look.box)}>
        <Icon name={look.icon} size={13} color={look.color} />
      </View>
      <Text variant="label" className="min-w-0 flex-1 text-base">
        {name}
      </Text>
      <Text tone="subtle" className="text-sm">
        {section}
      </Text>
    </PressableScale>
  );
}

/** A new version as a card that opens it, with its version number and date. */
function DocumentLink({ document }: { document: LegalDocument }) {
  const { t } = useTranslation('common');
  return (
    <PressableScale
      haptic="tap"
      activeScale={0.98}
      accessibilityRole="link"
      onPress={() => router.push(`/legal/${document.kind}`)}
      className="mb-1.5 flex-row items-center gap-3 rounded-[22px] bg-surface p-4"
    >
      <View className="min-w-0 flex-1 gap-0.5">
        <Text variant="bodyStrong">{t(`legal.${document.kind}`)}</Text>
        <Text tone="subtle" className="text-sm">
          {t('legal.meta', {
            version: document.version,
            date: formatDate(new Date(document.effectiveAt), LONG_DATE),
          })}
        </Text>
      </View>
      <Icon name="chevron-right" size={7} color={colors.dim} />
    </PressableScale>
  );
}

/** The accepted version (grey) turning into the new one (neon), as two tilted pages. */
function VersionIllustration({ from, to }: { from: string | null; to: string }) {
  return (
    <View className="mx-4 mt-4 h-60 flex-row items-center justify-center gap-4 overflow-hidden rounded-[28px] bg-surface">
      {from ? (
        <>
          <Page version={from} old />
          <View className="size-12 items-center justify-center rounded-full bg-control">
            <Icon name="arrow-right" size={16} color={colors.fg} />
          </View>
        </>
      ) : null}
      <Page version={to} />
    </View>
  );
}

const OLD_LINES = ['w-full', 'w-3/4', 'w-full', 'w-1/2'];
const NEW_LINES = [
  ['w-full', 'bg-on-accent/30'],
  ['w-4/5', 'bg-on-accent'],
  ['w-full', 'bg-on-accent/30'],
  ['w-11/12', 'bg-on-accent'],
  ['w-1/2', 'bg-on-accent/30'],
] as const;

function Page({ version, old }: { version: string; old?: boolean }) {
  return (
    <View
      className={cn(
        'gap-2.5 rounded-[18px] p-4',
        old ? 'h-36 w-28 bg-elevated' : 'h-42 w-33 bg-accent',
      )}
      style={{ transform: [{ rotate: old ? '-6deg' : '5deg' }] }}
    >
      <Text
        className={cn('mb-1 font-inter-semibold text-base', old ? 'text-dim' : 'text-on-accent')}
      >
        {`v${version}`}
      </Text>
      {old
        ? OLD_LINES.map((w, i) => (
            <View key={i} className={cn('h-1.5 rounded-full bg-white/10', w)} />
          ))
        : NEW_LINES.map(([w, tone], i) => (
            <View key={i} className={cn('h-1.5 rounded-full', w, tone)} />
          ))}
    </View>
  );
}

import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { supabase } from '@/shared/data/supabase';
import { useActiveWorkout } from '@/shared/data/workouts';
import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { useHardwareBack } from '@/shared/hooks/use-hardware-back';
import { formatDate } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { requireUserId } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { StepTitle } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';

import { acceptDocuments, usePendingLegalDocuments } from '../data/legal-acceptances';

const LONG_DATE = { day: 'numeric', month: 'long', year: 'numeric' } as const;

/**
 * Covers the app while a new terms or privacy version that needs consent is in effect: read
 * it, then agree or sign out. Waits while a workout is running, so it never interrupts a set.
 */
export function LegalUpdateGate() {
  const { t, i18n } = useTranslation('common');
  const insets = useSafeAreaInsets();
  const footerInset = useFooterInset();
  const pending = usePendingLegalDocuments(i18n.language);
  const { data: activeWorkout } = useActiveWorkout();
  const [busy, setBusy] = useState(false);
  const shown = pending.length > 0 && !activeWorkout;
  // Back would reach the app underneath.
  useHardwareBack(() => {}, shown);
  if (!shown) return null;

  async function accept() {
    setBusy(true);
    try {
      await acceptDocuments(requireUserId(), pending);
      haptics.success();
    } catch (error) {
      console.warn('Recording the legal acceptance failed', error);
      haptics.error();
    } finally {
      setBusy(false);
    }
  }

  return (
    <View
      className="absolute inset-0 bg-bg"
      style={{ paddingTop: insets.top, paddingBottom: footerInset }}
    >
      <View className="flex-1">
        <StepTitle title={t('legal.update.title')} subtitle={t('legal.update.subtitle')} />
        <View className="gap-2.5 px-4 pt-6">
          {pending.map((document) => (
            <PressableScale
              key={document.id}
              haptic="tap"
              activeScale={0.98}
              accessibilityRole="link"
              onPress={() => router.push(`/legal/${document.kind}`)}
              className="flex-row items-center gap-3 rounded-[22px] bg-surface p-4"
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
          ))}
        </View>
      </View>
      <View className="gap-1 px-4">
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

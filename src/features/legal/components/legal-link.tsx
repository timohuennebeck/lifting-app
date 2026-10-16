import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { haptics } from '@/shared/lib/haptics';
import { Text } from '@/shared/ui/text';

import type { LegalKind } from '../data/legal-documents';

export interface LegalLinkProps {
  kind: LegalKind;
  children?: ReactNode;
}

/** A highlighted word in a line of fine print that opens the document. */
export function LegalLink({ kind, children }: LegalLinkProps) {
  return (
    <Text
      variant="caption"
      accessibilityRole="link"
      onPress={() => {
        haptics.tap();
        router.push(`/legal/${kind}`);
      }}
      className="text-xs leading-4.25"
    >
      {children}
    </Text>
  );
}

/** "Nutzungsbedingungen · Datenschutzerklärung" below a purchase, as the App Store asks. */
export function LegalLinks() {
  const { t } = useTranslation('common');
  return (
    <Text variant="caption" tone="subtle" className="text-center font-inter text-xs leading-4.25">
      <LegalLink kind="terms">{t('legal.terms')}</LegalLink>
      {'  ·  '}
      <LegalLink kind="privacy">{t('legal.privacy')}</LegalLink>
    </Text>
  );
}

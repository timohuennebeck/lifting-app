import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { colors } from '@/shared/lib/theme';
import { ChoiceSheet } from '@/shared/ui/choice-sheet';
import { Icon } from '@/shared/ui/icon';
import { afterSheetClose } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

import type { TicketKind } from '../data/tickets';

export interface FeedbackSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** "Report a bug" or "Request a feature", then on to the form (design 01f·S-B). */
export function FeedbackSheet({ visible, onClose }: FeedbackSheetProps) {
  const { t } = useTranslation('support');
  const [kind, setKind] = useState<TicketKind>('bug');

  function next(value: TicketKind) {
    onClose();
    afterSheetClose(() => router.push({ pathname: '/support/new', params: { kind: value } }));
  }

  return (
    <ChoiceSheet
      visible={visible}
      onClose={onClose}
      value={kind}
      onChange={setKind}
      onConfirm={next}
      options={[
        {
          value: 'bug',
          title: t('sheet.bug'),
          description: t('sheet.bugHint'),
          cta: t('sheet.cta'),
          renderIcon: (active) => (
            <Text variant="headline" className={active ? 'text-on-accent' : 'text-fg-mid'}>
              !
            </Text>
          ),
        },
        {
          value: 'idea',
          title: t('sheet.idea'),
          description: t('sheet.ideaHint'),
          cta: t('sheet.cta'),
          renderIcon: (active) => (
            <Icon name="plus" size={16} color={active ? colors.onAccent : colors.fgMid} />
          ),
        },
      ]}
    />
  );
}

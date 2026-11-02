import { useTranslation } from 'react-i18next';

import { nowIso } from '@/shared/data/json';
import { saveProfile } from '@/shared/data/profile';
import { requireUserId } from '@/shared/stores/session-store';

import { SettingsSection, SettingsToggleRow } from './settings-section';

/**
 * Whether the coach may send the training and weight data to OpenAI: on since the first question
 * (its consent), off withdraws the consent until the user turns it on again or asks the coach.
 */
export function CoachSection({ consented }: { consented: boolean }) {
  const { t } = useTranslation('coach');
  return (
    <SettingsSection title={t('title')}>
      <SettingsToggleRow
        label={t('settings.label')}
        description={t('settings.description')}
        value={consented}
        onChange={(on) =>
          void saveProfile(requireUserId(), { coachConsentAt: on ? nowIso() : null })
        }
      />
    </SettingsSection>
  );
}

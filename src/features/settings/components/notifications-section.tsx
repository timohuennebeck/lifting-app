import { useTranslation } from 'react-i18next';

import { useSettingsStore } from '@/shared/stores/settings-store';

import { SettingsSection, SettingsToggleRow } from './settings-section';

/** The rest-end sound, a saved setting the rest timer follows. */
export function NotificationsSection() {
  const { t } = useTranslation('profile');
  const restSound = useSettingsStore((s) => s.restSound);
  const setRestSound = useSettingsStore((s) => s.setRestSound);
  return (
    <SettingsSection title={t('settings.notifications.title')}>
      <SettingsToggleRow
        label={t('settings.notifications.restSound')}
        value={restSound}
        onChange={setRestSound}
      />
    </SettingsSection>
  );
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SettingsSection, SettingsToggleRow } from './settings-section';

/**
 * Workout reminder and rest-end sound. Design only for now: the switches don't schedule
 * reminders or play sounds yet, and they aren't saved.
 */
export function NotificationsSection() {
  const { t } = useTranslation('profile');
  const [reminder, setReminder] = useState(true);
  const [restSound, setRestSound] = useState(true);
  return (
    <SettingsSection title={t('settings.notifications.title')}>
      <SettingsToggleRow
        label={t('settings.notifications.workoutReminder')}
        value={reminder}
        onChange={setReminder}
      />
      <SettingsToggleRow
        label={t('settings.notifications.restSound')}
        value={restSound}
        onChange={setRestSound}
      />
    </SettingsSection>
  );
}

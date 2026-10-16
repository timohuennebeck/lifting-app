import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSettingsStore } from '@/shared/stores/settings-store';

import { SettingsSection, SettingsToggleRow } from './settings-section';

/**
 * Workout reminder and rest-end sound. The reminder is design only (it schedules nothing and
 * isn't saved); the rest sound is a saved setting the rest timer follows.
 */
export function NotificationsSection() {
  const { t } = useTranslation('profile');
  const [reminder, setReminder] = useState(true);
  const restSound = useSettingsStore((s) => s.restSound);
  const setRestSound = useSettingsStore((s) => s.setRestSound);
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

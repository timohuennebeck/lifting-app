import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { saveProfile, useProfile } from '@/shared/data/profile';
import { attempt } from '@/shared/lib/async';
import { haptics } from '@/shared/lib/haptics';
import { BIO_MAX } from '@/shared/lib/limits';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { TextField } from '@/shared/ui/text-field';

/** "Über dich": the description on the profile, written on its own page; empty removes it. */
export function AboutScreen() {
  const { t } = useTranslation(['profile', 'common']);
  const { profile } = useProfile();
  // The saved text until the user types.
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? profile?.bio ?? '';
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!profile || saving) return;
    setSaving(true);
    const saved = await attempt('Saving the description failed', () =>
      saveProfile(profile.id, { bio: value.trim() || null }),
    );
    setSaving(false);
    if (!saved) return;
    haptics.success();
    router.back();
  };

  return (
    <Screen
      scroll
      header={<ScreenHeader title={t('about.title')} />}
      footer={
        <Button
          label={t('common:actions.save')}
          disabled={!profile}
          loading={saving}
          onPress={save}
        />
      }
    >
      <TextField
        className="px-4 pt-5"
        label={t('about.label')}
        value={value}
        onChangeText={setDraft}
        placeholder={t('about.placeholder')}
        maxLength={BIO_MAX}
        multiline
        autoFocus
      />
    </Screen>
  );
}

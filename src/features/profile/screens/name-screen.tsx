import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { saveProfile, useProfile } from '@/shared/data/profile';
import { attempt } from '@/shared/lib/async';
import { haptics } from '@/shared/lib/haptics';
import { FIRST_NAME_MAX } from '@/shared/lib/limits';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { TextField } from '@/shared/ui/text-field';

/** The first name on the profile, changed on its own page like the description; it can't be empty. */
export function ProfileNameScreen() {
  const { t } = useTranslation(['profile', 'common']);
  const { profile } = useProfile();
  // The saved name until the user types.
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? profile?.firstName ?? '';
  const valid = value.trim().length > 0;
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!profile || !valid || saving) return;
    setSaving(true);
    const saved = await attempt('Saving the name failed', () =>
      saveProfile(profile.id, { firstName: value.trim() }),
    );
    setSaving(false);
    if (!saved) return;
    haptics.success();
    router.back();
  };

  return (
    <Screen
      scroll
      header={<ScreenHeader title={t('name.title')} />}
      footer={
        <Button
          label={t('common:actions.save')}
          disabled={!profile || !valid}
          loading={saving}
          onPress={save}
        />
      }
    >
      <TextField
        className="px-4 pt-5"
        label={t('name.label')}
        value={value}
        onChangeText={setDraft}
        placeholder={t('name.placeholder')}
        maxLength={FIRST_NAME_MAX}
        autoFocus
        autoCapitalize="words"
        autoComplete="given-name"
        textContentType="givenName"
        clearable
        returnKeyType="done"
        submitBehavior="submit"
        onSubmitEditing={save}
      />
    </Screen>
  );
}

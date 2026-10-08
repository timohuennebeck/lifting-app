import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { isOnboardedAfterSync } from '@/features/onboarding/lib/persist-onboarding';
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import { supabase } from '@/shared/data/supabase';
import { haptics } from '@/shared/lib/haptics';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { Screen } from '@/shared/ui/screen';
import { StepTitle } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';

import { CredentialFields } from '../components/credential-fields';
import { type AuthErrorKey, authErrorKey, isValidEmail } from '../lib/credentials';

type Phase = 'idle' | 'signingIn' | 'syncing';

export function SignInScreen() {
  const { t } = useTranslation('auth');
  const { t: tc } = useTranslation();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [password, setPassword] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<AuthErrorKey | null>(null);
  const valid = isValidEmail(email) && password.length > 0;
  const busy = phase !== 'idle';

  const submit = async () => {
    if (!valid || busy) return;
    setPhase('signingIn');
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError || !data.user) {
        haptics.error();
        setError(signInError ? authErrorKey(signInError) : 'generic');
        setPhase('idle');
        return;
      }
      haptics.success();
      setPhase('syncing');
      const store = useOnboardingStore.getState();
      if (await isOnboardedAfterSync(data.user.id)) {
        // The root guard switches to the app once onboarding is marked complete.
        store.complete();
        return;
      }
      const metaName = data.user.user_metadata?.first_name;
      if (!store.draft.firstName && typeof metaName === 'string') {
        store.update({ firstName: metaName });
      }
      setPhase('idle');
      router.replace('/name');
    } catch {
      haptics.error();
      setError('generic');
      setPhase('idle');
    }
  };

  return (
    <Screen
      scroll
      header={
        <View className="flex-row py-1.5 pl-4">
          <IconButton
            icon="chevron-left"
            accessibilityLabel={tc('actions.back')}
            onPress={() => router.back()}
          />
        </View>
      }
      footer={
        <View className="gap-1">
          <Button label={t('signIn.submit')} disabled={!valid} loading={busy} onPress={submit} />
          {phase === 'syncing' ? (
            <Text variant="caption" tone="subtle" className="min-h-12 py-4 text-center">
              {t('signIn.syncing')}
            </Text>
          ) : (
            <TextButton
              label={
                <>
                  <Text variant="label" tone="muted" className="font-inter">
                    {t('signIn.noAccount')}
                  </Text>
                  {t('signIn.getStarted')}
                </>
              }
              onPress={() => router.replace('/name')}
            />
          )}
        </View>
      }
    >
      <StepTitle title={t('signIn.title')} subtitle={t('signIn.subtitle')} />
      <View className="px-4 pt-7">
        <CredentialFields
          mode="existing"
          email={email}
          password={password}
          onChangeEmail={setEmail}
          onChangePassword={setPassword}
          onSubmit={submit}
          editable={!busy}
        />
        {error ? (
          <Text
            variant="caption"
            tone="danger"
            className="px-1 pt-3"
            accessibilityLiveRegion="assertive"
          >
            {t(`errors.${error}`)}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/shared/ui/button';
import { TextField } from '@/shared/ui/text-field';
import { StepScreen } from '@/shared/ui/step-screen';

import { ABOUT_STEPS } from '../lib/flow';
import { useDraft, useUpdateDraft } from '../stores/onboarding-store';

export function NameScreen() {
  const { t } = useTranslation('onboarding');
  const { t: tc } = useTranslation();
  const { firstName } = useDraft();
  const update = useUpdateDraft();
  const valid = firstName.trim().length > 0;
  const next = () => valid && router.push('/sex');

  return (
    <StepScreen
      step={1}
      total={ABOUT_STEPS}
      title={t('name.title')}
      scroll
      footer={<Button label={tc('actions.continue')} disabled={!valid} onPress={next} />}
    >
      <View className="px-4 pt-7">
        <TextField
          value={firstName}
          onChangeText={(firstName) => update({ firstName })}
          placeholder={t('name.placeholder')}
          accessibilityLabel={t('name.placeholder')}
          maxLength={24}
          autoFocus
          autoCapitalize="words"
          autoComplete="given-name"
          textContentType="givenName"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={next}
          clearable
        />
      </View>
    </StepScreen>
  );
}

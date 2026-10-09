import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/shared/ui/button';
import { FormatCards } from '@/shared/ui/format-cards';
import { Text } from '@/shared/ui/text';
import { StepScreen } from '@/shared/ui/step-screen';
import { TextButton } from '@/shared/ui/text-button';

import { ABOUT_STEPS } from '../lib/flow';
import { useUpdateDraft } from '../stores/onboarding-store';

export function HasPlanScreen() {
  const { t } = useTranslation('onboarding');
  const update = useUpdateDraft();

  const choose = (hasPlan: boolean) => {
    update({ hasPlan });
    router.push(hasPlan ? '/import' : '/create/goal');
  };

  return (
    <StepScreen
      step={9}
      total={ABOUT_STEPS}
      title={t('hasPlan.title')}
      contentClassName="pb-2"
      footer={
        <View className="items-center gap-1">
          <Button label={t('hasPlan.yes')} onPress={() => choose(true)} className="self-stretch" />
          <TextButton label={t('hasPlan.no')} onPress={() => choose(false)} />
        </View>
      }
    >
      <View className="flex-1 items-center justify-center">
        <FormatCards scale={1.15} />
        <Text variant="label" tone="muted" className="mt-4.5">
          {t('hasPlan.formats')}
        </Text>
      </View>
    </StepScreen>
  );
}

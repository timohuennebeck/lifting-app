import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { Button } from '@/shared/ui/button';
import { FormatCards } from '@/shared/ui/format-cards';
import { Text } from '@/shared/ui/text';
import { StepScreen } from '@/shared/ui/step-screen';
import { TextButton } from '@/shared/ui/text-button';

import { ABOUT_STEPS } from '../lib/flow';

export function HasPlanScreen() {
  const { t } = useTranslation('onboarding');
  const { inApp, step } = usePlanFlow();

  return (
    <StepScreen
      // The last question about the user in onboarding; in the app the flow starts here.
      {...(!inApp && { step: 8, total: ABOUT_STEPS })}
      title={t('hasPlan.title')}
      contentClassName="pb-2"
      footer={
        <View className="items-center gap-1">
          <Button
            label={t('hasPlan.yes')}
            onPress={() => router.push(step('/import'))}
            className="self-stretch"
          />
          <TextButton label={t('hasPlan.no')} onPress={() => router.push(step('/create/goal'))} />
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

import { router } from 'expo-router';
import { Trans, useTranslation } from 'react-i18next';
import { Linking, View } from 'react-native';

import { Button } from '@/shared/ui/button';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';

import { ActionButtonPreview } from '../components/action-button-preview';
import { ABOUT_STEPS } from '../lib/flow';

const STEPS = ['settings', 'shortcut', 'pick'] as const;

const next = () => router.push('/experience');

/**
 * The Settings app's first page: there is no public link to the Action button's, so the steps
 * say where it is. The app's own settings page when that link doesn't open.
 */
function openSettings() {
  Linking.openURL('App-prefs:').catch(() => void Linking.openSettings());
}

/**
 * Only on iPhones with an Action button (HAS_ACTION_BUTTON): how to put the "Log weight" shortcut
 * on it, which opens today's weight entry. Opening Settings goes on with onboarding as well, so
 * it continues where the user comes back to.
 */
export function ActionButtonScreen() {
  const { t } = useTranslation(['onboarding', 'common']);

  return (
    <StepScreen
      step={7}
      total={ABOUT_STEPS}
      title={t('actionButton.title')}
      subtitle={t('actionButton.subtitle')}
      footer={
        <View className="gap-1">
          <Button
            label={t('common:actions.openSettings')}
            onPress={() => {
              next();
              openSettings();
            }}
          />
          <TextButton label={t('actionButton.later')} tone="secondary" onPress={next} />
        </View>
      }
    >
      <ActionButtonPreview />
      <View className="gap-3.5 px-5 pt-6 pb-3">
        {STEPS.map((key, i) => (
          <View key={key} className="flex-row items-center gap-3.5">
            <View className="size-7 items-center justify-center rounded-full bg-elevated">
              <Text variant="caption" tone="accent">
                {i + 1}
              </Text>
            </View>
            <Text variant="paragraph" tone="muted" className="flex-1">
              <Trans
                t={t}
                i18nKey={`actionButton.steps.${key}`}
                components={{ b: <Text variant="label" /> }}
              />
            </Text>
          </View>
        ))}
      </View>
    </StepScreen>
  );
}

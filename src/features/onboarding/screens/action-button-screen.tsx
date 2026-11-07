import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Linking, View } from 'react-native';

import { useHardwareBack } from '@/shared/hooks/use-hardware-back';
import { Button } from '@/shared/ui/button';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';

import { ActionButtonPreview } from '../components/action-button-preview';
import { afterAccount } from '../lib/after-account';
import { START_STEPS } from '../lib/flow';

const STEPS = ['settings', 'shortcut', 'pick'] as const;

const next = () => afterAccount('actionButton');

/**
 * The Settings app's first page: there is no public link to the Action button's, so the steps
 * say where it is. The app's own settings page when that link doesn't open.
 */
function openSettings() {
  Linking.openURL('App-prefs:').catch(() => void Linking.openSettings());
}

/**
 * Only on iPhones with an Action button (HAS_ACTION_BUTTON), right after sign-up: how to put the
 * "Log weight" shortcut on it, which opens today's weight entry. Once Settings was opened the main button says "Done"
 * and goes on, so the steps are still there to look at; Settings can be opened again below it.
 */
export function ActionButtonScreen() {
  const { t } = useTranslation(['onboarding', 'common']);
  const [opened, setOpened] = useState(false);
  // Right after sign-up: Android's back doesn't go back to it either.
  useHardwareBack(() => {});

  return (
    <StepScreen
      step={3}
      total={START_STEPS}
      title={t('actionButton.title')}
      subtitle={t('actionButton.subtitle')}
      footer={
        <View className="gap-1">
          <Button
            label={opened ? t('actionButton.done') : t('common:actions.openSettings')}
            onPress={() => {
              if (opened) return next();
              setOpened(true);
              openSettings();
            }}
          />
          <TextButton
            label={opened ? t('actionButton.openAgain') : t('actionButton.later')}
            tone="secondary"
            onPress={opened ? openSettings : next}
          />
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

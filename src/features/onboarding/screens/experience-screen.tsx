import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/shared/ui/button';
import { OptionCard } from '@/shared/ui/option-card';
import { StepScreen } from '@/shared/ui/step-screen';

import { ABOUT_STEPS, EXPERIENCE_LEVELS } from '../lib/flow';
import { useDraft, useUpdateDraft } from '../stores/onboarding-store';

export function ExperienceScreen() {
  const { t } = useTranslation('onboarding');
  const { t: tc } = useTranslation();
  const { experience } = useDraft();
  const update = useUpdateDraft();

  return (
    <StepScreen
      step={7}
      total={ABOUT_STEPS}
      title={t('experience.title')}
      scroll
      footer={
        <Button
          label={tc('actions.continue')}
          disabled={!experience}
          onPress={() => router.push('/complaints')}
        />
      }
    >
      <View className="gap-2.5 px-4 pt-7">
        {EXPERIENCE_LEVELS.map((level, i) => (
          <OptionCard
            key={level}
            title={t(`experience.${level}`)}
            description={t(`experience.${level}Hint`)}
            selected={experience === level}
            onPress={() => update({ experience: level })}
            index={i + 1}
          />
        ))}
      </View>
    </StepScreen>
  );
}

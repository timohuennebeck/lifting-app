import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { Experience } from '@/shared/data/profile';
import { Button } from '@/shared/ui/button';
import { OptionCard } from '@/shared/ui/option-card';
import { StepScreen } from '@/shared/ui/step-screen';

import { ABOUT_STEPS } from '../lib/flow';
import { useDraft, useUpdateDraft } from '../stores/onboarding-store';

const LEVELS: readonly Experience[] = ['none', 'beginner', 'intermediate', 'advanced'];

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
          onPress={() => router.push('/has-plan')}
        />
      }
    >
      <View className="gap-2.5 px-4 pt-7">
        {LEVELS.map((level, i) => (
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

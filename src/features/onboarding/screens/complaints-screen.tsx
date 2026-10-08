import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Chip } from '@/shared/ui/chip';
import type { MuscleId } from '@/shared/ui/muscle-map/body-paths';
import { MuscleMap } from '@/shared/ui/muscle-map/muscle-map';

import { OnboardingStep } from '../components/onboarding-step';
import { ABOUT_STEPS, COMPLAINT_AREAS } from '../lib/flow';
import { useDraft, useUpdateDraft } from '../stores/onboarding-store';

const CHIP = 'h-11 px-[18px]';

export function ComplaintsScreen() {
  const { t } = useTranslation('onboarding');
  const { t: tc } = useTranslation();
  const { complaints } = useDraft();
  const update = useUpdateDraft();

  const toggle = (id: string) =>
    update({
      complaints: complaints.includes(id)
        ? complaints.filter((c) => c !== id)
        : [...complaints, id],
    });

  // A tapped muscle clears its marked areas, or marks the first area containing it.
  const onMuscle = (muscle: MuscleId) => {
    const areas = COMPLAINT_AREAS.filter((a) =>
      (a.muscles as readonly MuscleId[]).includes(muscle),
    );
    if (!areas.length) return;
    const marked: string[] = areas.filter((a) => complaints.includes(a.id)).map((a) => a.id);
    update({
      complaints: marked.length
        ? complaints.filter((c) => !marked.includes(c))
        : [...complaints, areas[0].id],
    });
  };

  const selectedMuscles = COMPLAINT_AREAS.filter((a) => complaints.includes(a.id)).flatMap(
    (a) => a.muscles,
  );
  const count = complaints.length;

  return (
    <OnboardingStep
      step={8}
      total={ABOUT_STEPS}
      title={t('complaints.title')}
      subtitle={t('complaints.subtitle')}
      scroll
      footer={
        <Button
          label={count ? t('complaints.continueMarked', { count }) : tc('actions.continue')}
          onPress={() => router.push('/has-plan')}
        />
      }
    >
      <View className="flex-row flex-wrap gap-2 px-4 pt-[22px]">
        <Chip
          label={t('complaints.none')}
          selected={count === 0}
          onPress={() => update({ complaints: [] })}
          className={CHIP}
        />
        {COMPLAINT_AREAS.map((area) => (
          <Chip
            key={area.id}
            label={t(`complaints.areas.${area.id}`)}
            selected={complaints.includes(area.id)}
            tone="red"
            onPress={() => toggle(area.id)}
            className={CHIP}
          />
        ))}
      </View>
      <View className="mx-4 mt-5 h-[320px] flex-row gap-1 rounded-[28px] bg-surface px-2 pt-4 pb-3">
        {(['front', 'back'] as const).map((view) => (
          <View key={view} className="min-w-0 flex-1">
            <MuscleMap
              view={view}
              selected={selectedMuscles}
              onToggle={onMuscle}
              accent={colors.red}
            />
          </View>
        ))}
      </View>
    </OnboardingStep>
  );
}

import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useDraft, useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import type { EquipmentAccess } from '@/shared/data/profile';
import { Button } from '@/shared/ui/button';
import { OptionCard } from '@/shared/ui/option-card';
import { StepScreen } from '@/shared/ui/step-screen';

import { useCreateStep } from '../hooks/use-create-step';

const OPTIONS: EquipmentAccess[] = ['gym', 'home', 'bodyweight'];

/** Where the user trains; "Eigene Geräte" goes on to what they have (HomeEquipmentScreen). */
export function EquipmentScreen() {
  const { t } = useTranslation(['planCreate', 'common']);
  const counter = useCreateStep('equipment');
  const { step } = usePlanFlow();
  const draft = useDraft();
  const update = useUpdateDraft();
  const equipment = draft.equipment ?? 'gym';

  return (
    <StepScreen
      {...counter}
      title={t('planCreate:equipment.title')}
      scroll
      footer={
        <Button
          label={t('common:actions.continue')}
          onPress={() => {
            update({ equipment });
            router.push(step(equipment === 'home' ? '/create/home-equipment' : '/create/sessions'));
          }}
        />
      }
    >
      <View className="gap-2.5 px-4 pt-7">
        {OPTIONS.map((option, i) => (
          <OptionCard
            key={option}
            index={i + 1}
            title={t(`planCreate:equipment.options.${option}.title`)}
            description={t(`planCreate:equipment.options.${option}.description`)}
            selected={equipment === option}
            onPress={() => update({ equipment: option })}
          />
        ))}
      </View>
    </StepScreen>
  );
}

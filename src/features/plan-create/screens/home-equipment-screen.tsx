import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useDraft, useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { useHomeEquipment } from '@/shared/data/exercises';
import { Button } from '@/shared/ui/button';
import { Chip } from '@/shared/ui/chip';
import { StepScreen } from '@/shared/ui/step-screen';

import { useCreateStep } from '../hooks/use-create-step';

/** After "Eigene Geräte": what the user has, as the catalog offers it (public.equipment). */
export function HomeEquipmentScreen() {
  const { t, i18n } = useTranslation(['planCreate', 'common']);
  const counter = useCreateStep('homeEquipment');
  const { step } = usePlanFlow();
  const { homeEquipment } = useDraft();
  const update = useUpdateDraft();
  const offered = useHomeEquipment(i18n.language);
  // Items the checklist no longer offers don't count.
  const owned = homeEquipment.filter((id) => offered.some((e) => e.id === id));

  const toggle = (id: string) =>
    update({
      homeEquipment: owned.includes(id) ? owned.filter((e) => e !== id) : [...owned, id],
    });

  return (
    <StepScreen
      {...counter}
      title={t('planCreate:homeEquipment.title')}
      subtitle={t('planCreate:homeEquipment.subtitle')}
      subtitleTone="subtle"
      scroll
      footer={
        <Button
          label={t('common:actions.continue')}
          // Without anything ticked, "Keine Geräte" is the answer.
          disabled={!owned.length}
          onPress={() => {
            update({ homeEquipment: owned });
            router.push(step('/create/sessions'));
          }}
        />
      }
    >
      <View className="flex-row flex-wrap gap-2 px-4 pt-5.5">
        {offered.map((e) => (
          <Chip
            key={e.id}
            label={e.name}
            selected={owned.includes(e.id)}
            onPress={() => toggle(e.id)}
            className="h-11 px-4.5"
          />
        ))}
      </View>
    </StepScreen>
  );
}

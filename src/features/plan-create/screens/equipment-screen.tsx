import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useDraft, useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { useHomeEquipment } from '@/shared/data/exercises';
import type { EquipmentAccess } from '@/shared/data/profile';
import { Button } from '@/shared/ui/button';
import { Chip } from '@/shared/ui/chip';
import { OptionCard } from '@/shared/ui/option-card';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';

import { CREATE_STEPS } from '../lib/flow';

const OPTIONS: EquipmentAccess[] = ['gym', 'home', 'bodyweight'];

/** Where the user trains; "Eigene Geräte" asks what they have (public.equipment). */
export function EquipmentScreen() {
  const { t, i18n } = useTranslation(['planCreate', 'common']);
  const { step } = usePlanFlow();
  const draft = useDraft();
  const update = useUpdateDraft();
  const offered = useHomeEquipment(i18n.language);
  const equipment = draft.equipment ?? 'gym';
  // What was ticked stays when another answer is picked, in case the user comes back to it.
  const owned = draft.homeEquipment.filter((id) => offered.some((e) => e.id === id));
  const atHome = equipment === 'home';

  const toggle = (id: string) =>
    update({
      homeEquipment: owned.includes(id) ? owned.filter((e) => e !== id) : [...owned, id],
    });

  return (
    <StepScreen
      step={3}
      total={CREATE_STEPS}
      title={t('planCreate:equipment.title')}
      scroll
      footer={
        <Button
          label={t('common:actions.continue')}
          // Without anything ticked, "Keine Geräte" is the answer.
          disabled={atHome && !owned.length}
          onPress={() => {
            update({ equipment });
            router.push(step('/create/days'));
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
      {atHome ? (
        <View className="gap-3 px-5 pt-6 pb-4">
          <Text variant="overline" tone="subtle" className="text-xs tracking-[1.7px]">
            {t('planCreate:equipment.home.title')}
          </Text>
          <Text variant="paragraph" tone="subtle">
            {t('planCreate:equipment.home.hint')}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {offered.map((e) => (
              <Chip
                key={e.id}
                label={e.name}
                selected={owned.includes(e.id)}
                showCheck
                onPress={() => toggle(e.id)}
                className="h-11 px-4"
              />
            ))}
          </View>
        </View>
      ) : null}
    </StepScreen>
  );
}

import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useDraft, useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import type { EquipmentAccess } from '@/shared/data/profile';
import { Button } from '@/shared/ui/button';
import { OptionCard } from '@/shared/ui/option-card';
import { Screen } from '@/shared/ui/screen';
import { StepHeader } from '@/shared/ui/step-header';

import { StepTitle } from '../components/step-title';
import { CREATE_STEPS } from '../lib/flow';

const OPTIONS: EquipmentAccess[] = ['gym', 'home', 'bodyweight'];

export function EquipmentScreen() {
  const { t } = useTranslation(['planCreate', 'common']);
  const draft = useDraft();
  const update = useUpdateDraft();
  const equipment = draft.equipment ?? 'gym';

  return (
    <Screen
      scroll
      header={<StepHeader step={3} total={CREATE_STEPS} />}
      footer={
        <Button
          label={t('common:actions.continue')}
          onPress={() => {
            update({ equipment });
            router.push('/create/days');
          }}
        />
      }
    >
      <StepTitle title={t('planCreate:equipment.title')} />
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
    </Screen>
  );
}

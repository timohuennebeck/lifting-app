import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { muscleShares } from '@/shared/data/muscles';
import type { TemplateSummary } from '@/shared/data/templates';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { MUSCLE_CARDS, MuscleMap } from '@/shared/ui/muscle-map';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

import { rescheduleTemplate } from '../data/today-mutations';

function TemplateMuscle({ template }: { template: TemplateSummary }) {
  const top = muscleShares(template.items)[0]?.muscle;
  const card = MUSCLE_CARDS[top ?? 'chest'];
  return (
    <View className="size-11 overflow-hidden rounded-full bg-elevated">
      <MuscleMap
        view={card.view}
        viewBox={card.viewBox}
        selected={top ? [top] : []}
        accent={colors.accent}
        fit="cover"
      />
    </View>
  );
}

export interface PlanDaySheetProps {
  visible: boolean;
  /** Monday-based weekday to plan. */
  weekday: number;
  /** The plan's templates, scheduled or not. */
  templates: TemplateSummary[];
  onClose: () => void;
}

/** Picks a template of the plan for an empty day; one planned elsewhere moves here. */
export function PlanDaySheet({ visible, weekday, templates, onClose }: PlanDaySheetProps) {
  const { t } = useTranslation('today');
  const { t: tc } = useTranslation();
  const long = tc('weekdays.long', { returnObjects: true });

  const pick = async (template: TemplateSummary) => {
    await rescheduleTemplate(template.id, weekday);
    haptics.success();
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t('planSheet.title')}
      subtitle={t('planSheet.subtitle', { day: long[weekday] })}
    >
      <View className="gap-1.5">
        {templates.map((template) => (
          <PressableScale
            key={template.id}
            haptic="select"
            accessibilityRole="button"
            onPress={() => pick(template)}
            className="flex-row items-center gap-3 rounded-2xl py-2 pr-4 pl-2"
          >
            <TemplateMuscle template={template} />
            <View className="min-w-0 flex-1 gap-0.5">
              <Text variant="label" numberOfLines={1}>
                {template.name}
              </Text>
              <Text variant="caption" tone="subtle" className="font-inter">
                {template.weekday === null
                  ? t('planSheet.noDay')
                  : t('planSheet.current', { day: long[template.weekday] })}
              </Text>
            </View>
          </PressableScale>
        ))}
      </View>
    </Sheet>
  );
}

import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { TemplateSummary } from '@/shared/data/templates';
import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

import { rescheduleTemplate } from '../data/today-mutations';

export interface RescheduleSheetProps {
  visible: boolean;
  template: TemplateSummary | null;
  /** Other templates of the plan, to show which days are taken. */
  planTemplates: TemplateSummary[];
  onClose: () => void;
  onMoved: (weekday: number) => void;
}

/** Weekday picker that moves a planned template to another day. */
export function RescheduleSheet({
  visible,
  template,
  planTemplates,
  onClose,
  onMoved,
}: RescheduleSheetProps) {
  const { t } = useTranslation('today');
  const { t: tc } = useTranslation();
  const long = tc('weekdays.long', { returnObjects: true });

  const pick = async (weekday: number) => {
    if (!template) return;
    if (weekday !== template.weekday) {
      await rescheduleTemplate(template.id, weekday);
      haptics.success();
    }
    onMoved(weekday);
    onClose();
  };

  return (
    <Sheet
      visible={visible && !!template}
      onClose={onClose}
      title={t('rescheduleSheet.title')}
      subtitle={template ? t('rescheduleSheet.subtitle', { name: template.name }) : undefined}
    >
      <View className="gap-1.5">
        {long.map((day, i) => {
          const current = template?.weekday === i;
          const other = planTemplates.find((p) => p.weekday === i && p.id !== template?.id);
          return (
            <PressableScale
              key={day}
              haptic="select"
              accessibilityRole="radio"
              accessibilityState={{ checked: current }}
              onPress={() => pick(i)}
              className={cn(
                'h-14 flex-row items-center justify-between rounded-2xl px-4',
                current ? 'bg-elevated' : 'bg-transparent',
              )}
            >
              <View className="gap-0.5">
                <Text variant="label">{day}</Text>
                {other ? (
                  <Text variant="caption" tone="subtle" className="font-inter">
                    {t('rescheduleSheet.taken', { name: other.name })}
                  </Text>
                ) : null}
              </View>
              {current ? (
                <View className="size-6 items-center justify-center rounded-full bg-accent">
                  <Icon name="check" size={12} color={colors.onAccent} />
                </View>
              ) : null}
            </PressableScale>
          );
        })}
      </View>
    </Sheet>
  );
}

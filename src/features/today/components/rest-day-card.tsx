import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

export interface RestDayCardProps {
  dayName: string;
  isToday: boolean;
}

/** Shown when the selected day has neither a finished nor a planned workout. */
export function RestDayCard({ dayName, isToday }: RestDayCardProps) {
  const { t } = useTranslation('today');
  return (
    <Card className="mx-4 items-start gap-[18px] bg-[#151515]">
      <View className="size-14 items-center justify-center rounded-full bg-elevated">
        <Icon name="dumbbell" size={26} color={colors.subtle} />
      </View>
      <View className="gap-2">
        <Text variant="headline" className="text-[28px] leading-[30px]">
          {isToday ? t('rest.titleToday') : t('rest.title')}
        </Text>
        <Text variant="paragraph" tone="muted">
          {t('rest.body', { day: dayName })}
        </Text>
      </View>
      <Button
        label={t('rest.openTraining')}
        variant="secondary"
        size="md"
        className="self-stretch"
        onPress={() => router.navigate('/training')}
      />
    </Card>
  );
}

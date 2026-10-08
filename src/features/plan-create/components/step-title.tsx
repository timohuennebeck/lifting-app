import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { Text } from '@/shared/ui/text';

export interface StepTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

/** Big uppercase question with optional hint below, as on every onboarding step. */
export function StepTitle({ title, subtitle, className }: StepTitleProps) {
  return (
    <View className={cn('px-5 pt-[18px]', className)}>
      <Text variant="title" accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? (
        <Text variant="label" tone="subtle" className="mt-2.5 font-inter">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

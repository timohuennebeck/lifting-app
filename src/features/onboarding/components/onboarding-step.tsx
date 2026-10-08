import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Screen } from '@/shared/ui/screen';
import { StepHeader } from '@/shared/ui/step-header';
import { Text } from '@/shared/ui/text';

export interface OnboardingStepProps {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  /** Pinned bottom area, usually the CTA; rides up with the keyboard. */
  footer?: ReactNode;
  scroll?: boolean;
  contentClassName?: string;
}

/** Step frame of the onboarding flow: progress header, big title, content, CTA. */
export function OnboardingStep({
  step,
  total,
  title,
  subtitle,
  children,
  footer,
  scroll,
  contentClassName,
}: OnboardingStepProps) {
  return (
    <Screen
      header={<StepHeader step={step} total={total} />}
      footer={footer}
      scroll={scroll}
      contentClassName={contentClassName}
    >
      <StepTitle title={title} subtitle={subtitle} />
      {children}
    </Screen>
  );
}

export interface StepTitleProps {
  title: string;
  subtitle?: string;
}

export function StepTitle({ title, subtitle }: StepTitleProps) {
  return (
    <View className="px-5 pt-[18px]">
      <Text variant="title" accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? (
        <Text variant="paragraph" tone="muted" className="mt-2.5">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

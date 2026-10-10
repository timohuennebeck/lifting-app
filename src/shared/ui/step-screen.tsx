import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

import { Screen } from './screen';
import { StepHeader } from './step-header';
import { Text, type TextTone } from './text';

export interface StepTitleProps {
  title: string;
  subtitle?: string;
  subtitleTone?: TextTone;
  className?: string;
}

/** Big uppercase question with an optional hint below, as on every step of a flow. */
export function StepTitle({ title, subtitle, subtitleTone = 'muted', className }: StepTitleProps) {
  return (
    <View className={cn('px-5 pt-4.5', className)}>
      <Text variant="title" accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? (
        <Text variant="paragraph" tone={subtitleTone} className="mt-2.5">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export interface StepScreenProps extends Omit<StepTitleProps, 'className'> {
  step: number;
  total: number;
  children?: ReactNode;
  /** Pinned bottom area, usually the CTA. */
  footer?: ReactNode;
  scroll?: boolean;
  contentClassName?: string;
  titleClassName?: string;
  /** No back button, e.g. after a step that can't be undone. */
  hideBack?: boolean;
}

/** Step frame of the onboarding, plan and import flows: progress header, title, content, CTA. */
export function StepScreen({
  step,
  total,
  title,
  subtitle,
  subtitleTone,
  titleClassName,
  children,
  footer,
  scroll,
  contentClassName,
  hideBack,
}: StepScreenProps) {
  return (
    <Screen
      header={<StepHeader step={step} total={total} hideBack={hideBack} />}
      footer={footer}
      scroll={scroll}
      contentClassName={contentClassName}
    >
      <StepTitle
        title={title}
        subtitle={subtitle}
        subtitleTone={subtitleTone}
        className={titleClassName}
      />
      {children}
    </Screen>
  );
}

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
  /** Overrides of the title's and the subtitle's text style, e.g. a tighter leading. */
  titleTextClassName?: string;
  subtitleClassName?: string;
}

/** Big uppercase question with an optional hint below, as on every step of a flow. */
export function StepTitle({
  title,
  subtitle,
  subtitleTone = 'muted',
  className,
  titleTextClassName,
  subtitleClassName,
}: StepTitleProps) {
  return (
    <View className={cn('px-5 pt-4.5', className)}>
      <Text variant="title" accessibilityRole="header" className={titleTextClassName}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="paragraph" tone={subtitleTone} className={cn('mt-2.5', subtitleClassName)}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export interface StepScreenProps extends Omit<StepTitleProps, 'className'> {
  /** Left out where the screen opens on its own, outside the flow it is a step of. */
  step?: number;
  total?: number;
  children?: ReactNode;
  /** Pinned bottom area, usually the CTA. */
  footer?: ReactNode;
  scroll?: boolean;
  contentClassName?: string;
  titleClassName?: string;
}

/** Step frame of the onboarding, plan and import flows: progress header, title, content, CTA. */
export function StepScreen({
  step,
  total,
  title,
  subtitle,
  subtitleTone,
  titleClassName,
  titleTextClassName,
  subtitleClassName,
  children,
  footer,
  scroll,
  contentClassName,
}: StepScreenProps) {
  return (
    <Screen
      header={<StepHeader step={step} total={total} />}
      footer={footer}
      scroll={scroll}
      contentClassName={contentClassName}
    >
      <StepTitle
        title={title}
        subtitle={subtitle}
        subtitleTone={subtitleTone}
        className={titleClassName}
        titleTextClassName={titleTextClassName}
        subtitleClassName={subtitleClassName}
      />
      {children}
    </Screen>
  );
}

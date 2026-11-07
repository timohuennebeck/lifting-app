import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

import { Screen } from './screen';
import { StepHeader } from './step-header';
import { Text, type TextTone } from './text';

export interface StepTitleProps {
  title: string;
  /** Text, or text with styled parts (e.g. a bold email in a <Trans>). */
  subtitle?: ReactNode;
  subtitleTone?: TextTone;
  className?: string;
  /** Overrides of the subtitle's text style, e.g. a tighter leading. */
  subtitleClassName?: string;
}

/** Big uppercase question with an optional hint below, as on every step of a flow. */
export function StepTitle({
  title,
  subtitle,
  subtitleTone = 'muted',
  className,
  subtitleClassName,
}: StepTitleProps) {
  return (
    <View className={cn('px-5 pt-4.5', className)}>
      <Text variant="title" accessibilityRole="header">
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
  /** Shows a close cross instead of the back chevron and runs this (see StepHeader). */
  onClose?: () => void;
  children?: ReactNode;
  /** Pinned bottom area, usually the CTA. */
  footer?: ReactNode;
  scroll?: boolean;
  /** The footer over the content, which fades out underneath it (see Screen). */
  fadeFooter?: boolean;
  contentClassName?: string;
  titleClassName?: string;
}

/** Step frame of the onboarding, plan and import flows: progress header, title, content, CTA. */
export function StepScreen({
  step,
  total,
  onClose,
  title,
  subtitle,
  subtitleTone,
  titleClassName,
  subtitleClassName,
  children,
  footer,
  scroll,
  fadeFooter,
  contentClassName,
}: StepScreenProps) {
  return (
    <Screen
      header={<StepHeader step={step} total={total} onClose={onClose} />}
      footer={footer}
      scroll={scroll}
      fadeFooter={fadeFooter}
      contentClassName={contentClassName}
    >
      <StepTitle
        title={title}
        subtitle={subtitle}
        subtitleTone={subtitleTone}
        className={titleClassName}
        subtitleClassName={subtitleClassName}
      />
      {children}
    </Screen>
  );
}

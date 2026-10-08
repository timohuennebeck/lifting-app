import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { cn } from '@/shared/lib/cn';

const VARIANTS = {
  display: 'font-inter-semibold text-display',
  hero: 'font-inter-semibold text-hero uppercase',
  title: 'font-inter-semibold text-title uppercase',
  headline: 'font-inter-semibold text-headline',
  body: 'font-inter text-body',
  bodyStrong: 'font-inter-semibold text-body',
  label: 'font-inter-semibold text-label',
  caption: 'font-inter-semibold text-caption',
  overline: 'font-inter-semibold text-caption uppercase tracking-[1.5px]',
  paragraph: 'font-inter text-label leading-[22px]',
} as const;

const TONES = {
  default: 'text-fg',
  secondary: 'text-fg-2',
  muted: 'text-muted',
  subtle: 'text-subtle',
  accent: 'text-accent',
  onAccent: 'text-on-accent',
  danger: 'text-danger',
} as const;

export type TextVariant = keyof typeof VARIANTS;
export type TextTone = keyof typeof TONES;

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
  className?: string;
}

export function Text({ variant = 'body', tone = 'default', className, ...props }: TextProps) {
  return (
    <RNText className={cn(VARIANTS[variant], TONES[tone], 'tabular-nums', className)} {...props} />
  );
}

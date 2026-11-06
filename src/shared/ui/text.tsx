import { useTranslation } from 'react-i18next';
import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useResolveClassNames } from 'uniwind';

import { cn } from '@/shared/lib/cn';

const VARIANTS = {
  display: 'font-inter-semibold text-display',
  title: 'font-inter-semibold text-title uppercase',
  headline: 'font-inter-semibold text-headline',
  body: 'font-inter text-body',
  bodyStrong: 'font-inter-semibold text-body',
  label: 'font-inter-semibold text-label',
  caption: 'font-inter-semibold text-caption',
  overline: 'font-inter-semibold text-caption uppercase tracking-[1.5px]',
  paragraph: 'font-inter text-label leading-5.5',
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

/**
 * Korean comes from the system's fallback font, taller than Inter: a line height tight for Inter
 * cuts its tops off. In Korean, lines are at least this many times the font size.
 */
const KOREAN_LINE = 1.3;

function RoomyText({ className, style, ...props }: RNTextProps & { className: string }) {
  const resolved = useResolveClassNames(className);
  const { fontSize, lineHeight } = StyleSheet.flatten([resolved, style]);
  const tight = !!fontSize && !!lineHeight && lineHeight < fontSize * KOREAN_LINE;
  return (
    <RNText
      className={className}
      style={tight ? [style, { lineHeight: Math.ceil(fontSize * KOREAN_LINE) }] : style}
      {...props}
    />
  );
}

export function Text({ variant = 'body', tone = 'default', className, ...props }: TextProps) {
  const { i18n } = useTranslation();
  const classes = cn(VARIANTS[variant], TONES[tone], className);
  if (i18n.language === 'ko') return <RoomyText className={classes} {...props} />;
  return <RNText className={classes} {...props} />;
}

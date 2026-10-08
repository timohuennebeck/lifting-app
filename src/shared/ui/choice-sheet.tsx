import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors, useAccentColor } from '@/shared/lib/theme';

import { Button } from './button';
import { PressableScale } from './pressable-scale';
import { Sheet } from './sheet';
import { Text } from './text';

/** Solid destructive red used by delete choices and CTAs (oklch 0.63 0.21 25). */

export interface ChoiceSheetOption<T extends string> {
  value: T;
  title: string;
  description?: string;
  /** Glyph inside the 48pt circle; `active` means it sits on the tone color. */
  renderIcon: (active: boolean) => ReactNode;
  tone?: 'accent' | 'danger';
  /** CTA label while this option is selected. */
  cta: string;
  ctaDisabled?: boolean;
}

export interface ChoiceSheetProps<T extends string> {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  options: ChoiceSheetOption<T>[];
  value: T;
  onChange: (value: T) => void;
  onConfirm: (value: T) => void;
  /** Shown between the options and the CTA, e.g. a "coming soon" note. */
  note?: string;
  loading?: boolean;
}

/** Bottom sheet with radio cards and a CTA tinted by the selected option (design 01·V·A·6, 03·0b·M). */
export function ChoiceSheet<T extends string>({
  visible,
  onClose,
  title,
  subtitle,
  options,
  value,
  onChange,
  onConfirm,
  note,
  loading,
}: ChoiceSheetProps<T>) {
  const accent = useAccentColor();
  const selected = options.find((o) => o.value === value) ?? options[0];
  const danger = selected?.tone === 'danger';

  return (
    <Sheet visible={visible} onClose={onClose} title={title} subtitle={subtitle}>
      <View className="gap-2.5">
        {options.map((option) => {
          const active = option.value === value;
          const tint = option.tone === 'danger' ? colors.red : accent;
          return (
            <PressableScale
              key={option.value}
              haptic="select"
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(option.value)}
              className="flex-row items-center gap-3.5 rounded-[22px] bg-surface py-4 pr-[18px] pl-4"
              style={{ borderWidth: 1.5, borderColor: active ? tint : colors.line }}
            >
              <View
                className="size-12 items-center justify-center rounded-full"
                style={{ backgroundColor: active ? tint : colors.control }}
              >
                {option.renderIcon(active)}
              </View>
              <View className="flex-1 gap-[3px]">
                <Text variant="bodyStrong">{option.title}</Text>
                {option.description ? (
                  <Text variant="label" tone="subtle" className="font-inter text-sm leading-5">
                    {option.description}
                  </Text>
                ) : null}
              </View>
              <View
                className="size-6 rounded-full"
                style={
                  active
                    ? { borderWidth: 7, borderColor: tint }
                    : { borderWidth: 1.5, borderColor: colors.track }
                }
              />
            </PressableScale>
          );
        })}
      </View>
      {note ? (
        <Text variant="label" tone="subtle" className="px-1 pt-4 font-inter text-sm leading-5">
          {note}
        </Text>
      ) : null}
      <Button
        label={selected?.cta ?? ''}
        haptic={danger ? 'warning' : 'press'}
        disabled={selected?.ctaDisabled}
        loading={loading}
        onPress={() => selected && onConfirm(selected.value)}
        className={cn('mt-[22px]', danger && 'bg-red')}
      />
    </Sheet>
  );
}

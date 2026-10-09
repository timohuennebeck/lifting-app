import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';

import { Button } from './button';
import { OptionCard } from './option-card';
import { Sheet } from './sheet';
import { Text } from './text';

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
  const selected = options.find((o) => o.value === value) ?? options[0];
  const danger = selected?.tone === 'danger';

  return (
    <Sheet visible={visible} onClose={onClose} title={title} subtitle={subtitle}>
      <View className="gap-2.5">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <OptionCard
              key={option.value}
              look="sheet"
              title={option.title}
              description={option.description}
              icon={option.renderIcon(active)}
              tint={option.tone === 'danger' ? colors.red : colors.accent}
              selected={active}
              onPress={() => onChange(option.value)}
            />
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
        className={cn('mt-5.5', danger && 'bg-red')}
      />
    </Sheet>
  );
}

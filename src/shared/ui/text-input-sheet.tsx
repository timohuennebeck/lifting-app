import { useState } from 'react';
import { View } from 'react-native';

import { useResetOnOpen } from '@/shared/hooks/use-reset-on-open';

import { Button } from './button';
import { Sheet } from './sheet';
import { TextField } from './text-field';

export interface TextInputSheetProps {
  /** The longest name it accepts (see shared/lib/limits). */
  maxLength: number;
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  /** Value the field starts with each time the sheet opens. */
  initialValue?: string;
  placeholder?: string;
  ctaLabel: string;
  onSubmit: (value: string) => void | Promise<void>;
}

/** Sheet with one clearable text field and a CTA (rename, new collection). Rides above the keyboard. */
export function TextInputSheet({
  visible,
  onClose,
  title,
  subtitle,
  initialValue = '',
  placeholder,
  ctaLabel,
  maxLength,
  onSubmit,
}: TextInputSheetProps) {
  const [value, setValue] = useResetOnOpen(visible, initialValue);
  const [busy, setBusy] = useState(false);
  const valid = value.trim().length > 0;

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    try {
      await onSubmit(value.trim());
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={title} subtitle={subtitle}>
      <View className="gap-5.5">
        <TextField
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          clearable
          maxLength={maxLength}
          returnKeyType="done"
          onSubmitEditing={submit}
          // The sheet is there to type a name: the keyboard comes up with it.
          autoFocus
        />
        <Button label={ctaLabel} disabled={!valid} loading={busy} onPress={submit} />
      </View>
    </Sheet>
  );
}

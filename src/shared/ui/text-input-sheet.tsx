import { useState } from 'react';
import { View } from 'react-native';

import { Button } from './button';
import { Sheet } from './sheet';
import { TextField } from './text-field';

export interface TextInputSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  /** Value the field starts with each time the sheet opens. */
  initialValue?: string;
  placeholder?: string;
  ctaLabel: string;
  onSubmit: (value: string) => void | Promise<void>;
  maxLength?: number;
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
  onSubmit,
  maxLength = 40,
}: TextInputSheetProps) {
  const [value, setValue] = useState(initialValue);
  const [busy, setBusy] = useState(false);
  const [wasVisible, setWasVisible] = useState(visible);
  // Reset the draft whenever the sheet is (re)opened.
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setValue(initialValue);
  }
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
          autoFocus
          maxLength={maxLength}
          returnKeyType="done"
          onSubmitEditing={submit}
        />
        <Button label={ctaLabel} disabled={!valid} loading={busy} onPress={submit} />
      </View>
    </Sheet>
  );
}

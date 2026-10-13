import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useResetOnOpen } from '@/shared/hooks/use-reset-on-open';
import { Button } from '@/shared/ui/button';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';

export interface ProfileTextSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  label: string;
  /** Text the field starts with each time the sheet opens. */
  initialValue: string;
  placeholder: string;
  maxLength: number;
  /** A text box with a character count instead of one line. */
  multiline?: boolean;
  /** An empty value is allowed (it clears the text). */
  optional?: boolean;
  onSave: (value: string) => Promise<void> | void;
}

/** Edits one profile text: name, or the description (design 01b-3). */
export function ProfileTextSheet({
  visible,
  onClose,
  title,
  subtitle,
  label,
  initialValue,
  placeholder,
  maxLength,
  multiline,
  optional,
  onSave,
}: ProfileTextSheetProps) {
  const { t } = useTranslation('common');
  // A fresh draft each time the sheet opens.
  const [value, setValue] = useResetOnOpen(visible, initialValue);
  const [busy, setBusy] = useState(false);
  const valid = optional || value.trim().length > 0;

  async function save() {
    if (!valid || busy) return;
    setBusy(true);
    // No `finally`: the React Compiler can't compile a component with one.
    try {
      await onSave(value.trim());
    } catch (error) {
      setBusy(false);
      throw error;
    }
    setBusy(false);
  }

  return (
    <Sheet visible={visible} onClose={onClose}>
      <View className="gap-2 px-1 pt-2">
        <Text variant="title">{title}</Text>
        <Text variant="paragraph" tone="subtle">
          {subtitle}
        </Text>
      </View>
      <View className="gap-2 pt-5">
        <TextField
          label={label}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          maxLength={maxLength}
          multiline={multiline}
          autoFocus
          clearable={!multiline}
          returnKeyType={multiline ? 'default' : 'done'}
          onSubmitEditing={multiline ? undefined : save}
        />
        {multiline ? (
          <Text variant="caption" tone="subtle" className="self-end px-1 font-inter text-xs">
            {`${value.length} / ${maxLength}`}
          </Text>
        ) : null}
      </View>
      <View className="gap-2.5 pt-5">
        <Button label={t('actions.save')} disabled={!valid} loading={busy} onPress={save} />
        <Button label={t('actions.cancel')} variant="secondary" onPress={onClose} />
      </View>
    </Sheet>
  );
}

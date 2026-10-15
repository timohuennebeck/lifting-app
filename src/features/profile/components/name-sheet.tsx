import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useResetOnOpen } from '@/shared/hooks/use-reset-on-open';
import { FIRST_NAME_MAX } from '@/shared/lib/limits';
import { Button } from '@/shared/ui/button';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';

export interface NameSheetProps {
  visible: boolean;
  onClose: () => void;
  /** The name the field starts with each time the sheet opens. */
  initialValue: string;
  onSave: (name: string) => Promise<void> | void;
}

/** Changes the first name on the profile (design 01b-3). */
export function NameSheet({ visible, onClose, initialValue, onSave }: NameSheetProps) {
  const { t } = useTranslation(['profile', 'common']);
  // A fresh draft each time the sheet opens.
  const [value, setValue] = useResetOnOpen(visible, initialValue);
  const [busy, setBusy] = useState(false);
  const valid = value.trim().length > 0;

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
        <Text variant="title">{t('name.title')}</Text>
        <Text variant="paragraph" tone="subtle">
          {t('name.subtitle')}
        </Text>
      </View>
      <View className="gap-2 pt-5">
        <TextField
          label={t('name.label')}
          value={value}
          onChangeText={setValue}
          placeholder={t('name.placeholder')}
          maxLength={FIRST_NAME_MAX}
          autoFocus
          clearable
          returnKeyType="done"
          onSubmitEditing={save}
        />
      </View>
      <View className="gap-2.5 pt-5">
        <Button label={t('common:actions.save')} disabled={!valid} loading={busy} onPress={save} />
        <Button label={t('common:actions.cancel')} variant="secondary" onPress={onClose} />
      </View>
    </Sheet>
  );
}

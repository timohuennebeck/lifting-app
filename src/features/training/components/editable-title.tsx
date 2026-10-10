import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput } from 'react-native';

import { colors } from '@/shared/lib/theme';

export interface EditableTitleProps {
  value: string;
  /** Called with the trimmed new name when editing ends with a change. */
  onSubmit: (name: string) => void;
}

/** A page title that turns into a text field when tapped (rename in place). */
export function EditableTitle({ value, onSubmit }: EditableTitleProps) {
  const { t } = useTranslation('training');
  // The text being typed; null while not editing, so outside renames show up.
  const [draft, setDraft] = useState<string | null>(null);
  // A submitted name shows until the saved one replaces the old value.
  const [submitted, setSubmitted] = useState<{ name: string; over: string } | null>(null);
  if (submitted && submitted.over !== value) setSubmitted(null);

  const finish = () => {
    const name = draft?.trim();
    setDraft(null);
    if (!name || name === value) return;
    setSubmitted({ name, over: value });
    onSubmit(name);
  };

  return (
    <TextInput
      value={draft ?? submitted?.name ?? value}
      // Multi-line only so long names wrap; a return never ends up in the name.
      onChangeText={(text) => setDraft(text.replace(/\n/g, ''))}
      onFocus={() => setDraft(value)}
      onBlur={finish}
      accessibilityLabel={t('options.rename')}
      maxLength={40}
      multiline
      scrollEnabled={false}
      submitBehavior="blurAndSubmit"
      returnKeyType="done"
      keyboardAppearance="dark"
      cursorColor={colors.fg}
      className="px-5 pt-7.5 pb-0 font-inter-semibold text-title text-fg"
    />
  );
}

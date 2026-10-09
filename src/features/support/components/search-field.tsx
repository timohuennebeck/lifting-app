import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';

export interface SearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  className?: string;
}

/** 44pt pill search input with a clear button (design 01f-2). */
export function SearchField({ value, onChangeText, placeholder, className }: SearchFieldProps) {
  const { t } = useTranslation();
  return (
    <View
      className={cn(
        'h-11 flex-row items-center gap-2.5 rounded-full bg-chip pr-1.5 pl-4',
        className,
      )}
    >
      <Icon name="search" size={15} color={colors.dim} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.dim}
        selectionColor={colors.fg}
        cursorColor={colors.fg}
        keyboardAppearance="dark"
        autoCorrect={false}
        returnKeyType="search"
        className="h-full min-w-0 flex-1 font-inter text-label text-fg"
      />
      {value ? (
        <PressableScale
          haptic="select"
          hitSlop={6}
          accessibilityLabel={t('actions.clear')}
          onPress={() => onChangeText('')}
          className="size-8 items-center justify-center rounded-full bg-control"
        >
          <Icon name="close" size={10} />
        </PressableScale>
      ) : null}
    </View>
  );
}

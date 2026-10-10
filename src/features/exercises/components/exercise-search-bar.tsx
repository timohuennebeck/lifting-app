import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';

import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { Button } from '@/shared/ui/button';
import { Gradient, type GradientStop } from '@/shared/ui/gradient';
import { TextField } from '@/shared/ui/text-field';

/** The list fades out behind the search bar (as under other pages' bottom buttons). */
const FADE: GradientStop[] = [
  [0, 1],
  [0.6, 1],
  [1, 0],
];

export interface ExerciseSearchBarProps {
  query: string;
  onChangeQuery: (query: string) => void;
  /** The bar floats over the list; its height keeps the last rows clear of it. */
  onHeight: (height: number) => void;
  /** Adds the "Done" button beside the field. */
  onDone?: () => void;
  doneDisabled?: boolean;
}

/**
 * Search field pinned to the foot of an exercise list (exercise picker, search); it rides up
 * with the keyboard and is focused on arrival.
 */
export function ExerciseSearchBar({
  query,
  onChangeQuery,
  onHeight,
  onDone,
  doneDisabled,
}: ExerciseSearchBarProps) {
  const { t } = useTranslation('exercises');
  const footerInset = useFooterInset();
  const field = (
    <TextField
      icon="search"
      shape="pill"
      clearable
      value={query}
      onChangeText={onChangeQuery}
      placeholder={t('picker.search')}
      autoCorrect={false}
      returnKeyType="search"
      autoFocus
      className={onDone ? 'flex-1' : undefined}
    />
  );
  return (
    <KeyboardStickyView
      offset={{ closed: 0, opened: footerInset - 8 }}
      style={styles.bar}
      pointerEvents="box-none"
    >
      <View
        pointerEvents="box-none"
        className="px-4 pt-8"
        style={{ paddingBottom: footerInset }}
        onLayout={(e) => onHeight(e.nativeEvent.layout.height)}
      >
        <Gradient from="bottom" stops={FADE} />
        {onDone ? (
          <View className="flex-row items-center gap-2">
            {field}
            <Button label={t('picker.done')} size="sm" disabled={doneDisabled} onPress={onDone} />
          </View>
        ) : (
          field
        )}
      </View>
    </KeyboardStickyView>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';

import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { Gradient, type GradientStop } from '@/shared/ui/gradient';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { TextField } from '@/shared/ui/text-field';

import { ExerciseResults } from '../components/exercise-results';

/** The list fades out behind the search field, as in the exercise picker. */
const FADE: GradientStop[] = [
  [0, 1],
  [0.6, 1],
  [1, 0],
];

/**
 * Search from the top bar of every tab: before typing it lists the recently trained exercises
 * with their records, then all others; the field sits at the bottom and is focused on arrival.
 */
export function SearchScreen() {
  const { t } = useTranslation(['common', 'exercises']);
  const footerInset = useFooterInset();
  const [query, setQuery] = useState('');
  // The field floats over the list; its height keeps the last rows clear of it.
  const [barHeight, setBarHeight] = useState(0);

  return (
    <Screen header={<ScreenHeader title={t('search.title')} />}>
      <View className="flex-1 pt-2">
        <ExerciseResults query={query} bottomInset={barHeight} />
      </View>
      <KeyboardStickyView
        offset={{ closed: 0, opened: footerInset - 8 }}
        style={styles.bar}
        pointerEvents="box-none"
      >
        <View
          pointerEvents="box-none"
          className="px-4 pt-8"
          style={{ paddingBottom: footerInset }}
          onLayout={(e) => setBarHeight(e.nativeEvent.layout.height)}
        >
          <Gradient from="bottom" stops={FADE} />
          <TextField
            icon="search"
            shape="pill"
            clearable
            value={query}
            onChangeText={setQuery}
            placeholder={t('exercises:picker.search')}
            autoCorrect={false}
            returnKeyType="search"
            autoFocus
          />
        </View>
      </KeyboardStickyView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0 },
});

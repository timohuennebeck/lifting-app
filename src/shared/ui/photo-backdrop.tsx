import { Image, type ImageSource } from 'expo-image';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Gradient, type GradientStop } from './gradient';

/** The photo's lower part fades into the page, under the text set over it. */
const FADE: GradientStop[] = [
  [0, 1],
  [0.25, 0.92],
  [1, 0],
];

export interface PhotoBackdropProps {
  source: ImageSource | number;
}

/** Share of the screen height the photo covers. */
const SHARE = 0.66;

/**
 * A borderless photo over the top of a full-screen page (welcome 00, body check offer 08·0A):
 * darkened under the status bar and fading into the page where the text starts.
 */
export function PhotoBackdrop({ source }: PhotoBackdropProps) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const height = screenHeight * SHARE;
  return (
    <View pointerEvents="none" className="absolute inset-x-0 top-0" style={{ height }}>
      <Image source={source} contentFit="cover" style={StyleSheet.absoluteFill} />
      <Gradient from="top" size={insets.top + 120} color="black" opacity={0.55} />
      <Gradient from="bottom" size={height * 0.55} stops={FADE} />
    </View>
  );
}

import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

/** A view's measured width in whole points (0 until laid out), e.g. for the SVG of a chart. */
export function useWidth() {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width));
  return [width, onLayout] as const;
}

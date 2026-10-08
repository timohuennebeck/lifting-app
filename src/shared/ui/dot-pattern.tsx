import { View, type ViewProps } from 'react-native';

export interface DotPatternProps extends ViewProps {
  color: string;
  /** Dot radius in px. */
  radius?: number;
  /** Grid pitch in px. */
  gap?: number;
  className?: string;
}

/** Fills its box with a dot grid, the design's dotted "radial-gradient" texture. */
export function DotPattern({ color, radius = 1.1, gap = 5, style, ...props }: DotPatternProps) {
  return (
    <View
      style={[
        {
          experimental_backgroundImage: `radial-gradient(circle, ${color} ${radius}px, transparent ${radius + 0.6}px)`,
          experimental_backgroundSize: `${gap}px ${gap}px`,
          experimental_backgroundRepeat: 'repeat',
        },
        style,
      ]}
      {...props}
    />
  );
}

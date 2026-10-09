import type { ReactNode } from 'react';
import { View } from 'react-native';

import { PressableScale } from '@/shared/ui/pressable-scale';
import { ScaleBar } from '@/shared/ui/scale-bar';
import { Text } from '@/shared/ui/text';

export interface CheckHistoryRowProps {
  title: string;
  date: string;
  /** Score 0–100; omitted for the upcoming (due) check. */
  score?: number;
  latest?: boolean;
  trailing?: ReactNode;
  onPress?: () => void;
}

/** History entry: title, score and a four-segment 0–100 scale with a marker. */
export function CheckHistoryRow({
  title,
  date,
  score,
  latest,
  trailing,
  onPress,
}: CheckHistoryRowProps) {
  const due = score === undefined;
  return (
    <PressableScale
      activeScale={0.98}
      accessibilityLabel={`${title} · ${date}`}
      onPress={onPress}
      disabled={!onPress}
      className="gap-2.5 py-3.5"
    >
      <View className="flex-row items-center justify-between">
        <Text variant="label">
          {title}
          <Text variant="label" tone="subtle" className="font-inter">
            {` · ${date}`}
          </Text>
        </Text>
        {due ? (
          trailing
        ) : (
          <Text variant="headline" tone={latest ? 'accent' : 'default'} className="text-xl">
            {score}
          </Text>
        )}
      </View>
      {due ? (
        <View className="h-2 flex-row gap-1 overflow-hidden">
          {Array.from({ length: 40 }, (_, i) => (
            <View key={i} className="h-2 w-1.5 rounded-sm bg-control" />
          ))}
        </View>
      ) : (
        <ScaleBar position={score / 100} muted={!latest} />
      )}
    </PressableScale>
  );
}

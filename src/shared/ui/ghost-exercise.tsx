import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

export interface GhostExerciseProps {
  /** Widths of the two title lines. */
  widths: readonly [`${number}%`, `${number}%`];
  faded?: boolean;
  /** Adds the "⋯" menu placeholder next to the title, as on the training overview. */
  menu?: boolean;
}

/** Skeleton exercise row shown while a training has no exercises yet (design 03·0). */
export function GhostExercise({ widths, faded, menu }: GhostExerciseProps) {
  const title = (
    <View className={cn('gap-[7px] pt-[7px]', menu && 'flex-1')}>
      {widths.map((width, i) => (
        <View key={i} className="h-2.5 rounded-[5px] bg-[#1E1E1C]" style={{ width }} />
      ))}
    </View>
  );
  const sets = [0, 1].map((k) => (
    <View key={k} className="flex-row items-center gap-2.5">
      <View className="size-6 rounded-full bg-[#1A1A1A]" />
      <View className="flex-1">
        <View className="h-2 w-[34px] rounded bg-[#1A1A1A]" />
      </View>
      <View className="size-[22px] rounded-full bg-[#161616]" />
    </View>
  ));

  return (
    <View className="flex-row gap-3.5 py-[18px]" style={{ opacity: faded ? 0.45 : 1 }}>
      <View className="h-[86px] w-16 rounded-[5px] bg-[#161616]" />
      <View className="flex-1 gap-2.5">
        {menu ? (
          <View className="flex-row items-start gap-2.5">
            {title}
            <View className="size-8 items-center justify-center gap-[3px]">
              {[0, 1, 2].map((i) => (
                <View key={i} className="size-[3.5px] rounded-full bg-line" />
              ))}
            </View>
          </View>
        ) : (
          title
        )}
        {menu ? <View className="gap-1.5">{sets}</View> : sets}
        <View className="flex-row gap-1.5">
          <View className="h-7 w-14 rounded-full bg-[#161616]" />
          <View className="h-7 w-[68px] rounded-full bg-[#161616]" />
        </View>
      </View>
    </View>
  );
}

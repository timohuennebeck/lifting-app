import { View } from 'react-native';

import { Text } from '@/shared/ui/text';

const SKELETONS = [
  { opacity: 1, title: ['88%', '58%'] },
  { opacity: 0.45, title: ['74%', '44%'] },
] as const;

/** Ghost exercise rows with a hint, shown while a training has no exercises (03·0 leer). */
export function EmptyExercises({ hint }: { hint: string }) {
  return (
    <View>
      {SKELETONS.map((s, k) => (
        <View key={k} className="flex-row gap-3.5 py-[18px]" style={{ opacity: s.opacity }}>
          <View className="h-[86px] w-16 rounded-[5px] bg-[#161616]" />
          <View className="flex-1 gap-2.5">
            <View className="flex-row items-start gap-2.5">
              <View className="flex-1 gap-[7px] pt-[7px]">
                {s.title.map((w) => (
                  <View key={w} className="h-2.5 rounded-[5px] bg-[#1E1E1C]" style={{ width: w }} />
                ))}
              </View>
              <View className="size-8 items-center justify-center gap-[3px]">
                {[0, 1, 2].map((i) => (
                  <View key={i} className="size-[3.5px] rounded-full bg-line" />
                ))}
              </View>
            </View>
            <View className="gap-1.5">
              {[0, 1].map((i) => (
                <View key={i} className="flex-row items-center gap-2.5">
                  <View className="size-6 rounded-full bg-[#1A1A1A]" />
                  <View className="flex-1">
                    <View className="h-2 w-[34px] rounded bg-[#1A1A1A]" />
                  </View>
                  <View className="size-[22px] rounded-full bg-[#161616]" />
                </View>
              ))}
            </View>
            <View className="flex-row gap-1.5">
              <View className="h-7 w-14 rounded-full bg-[#161616]" />
              <View className="h-7 w-[68px] rounded-full bg-[#161616]" />
            </View>
          </View>
        </View>
      ))}
      <Text variant="paragraph" tone="subtle" className="px-2.5 pt-2 text-center text-sm">
        {hint}
      </Text>
    </View>
  );
}

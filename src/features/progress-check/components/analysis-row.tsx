import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { CheckBadge } from '@/shared/ui/check-item';
import { Text } from '@/shared/ui/text';

export type AnalysisRowState = 'waiting' | 'active' | 'done';

export interface AnalysisRowProps {
  uri: string;
  label: string;
  /** 0–1 share of this photo that is analysed. */
  progress: number;
  state: AnalysisRowState;
  /** Photo height; it is 3:4. */
  height: number;
}

/**
 * One pose of the analysis (08c-H): its photo, name, a progress bar (white while it is measured,
 * accent once done) and what is happening to it.
 */
export function AnalysisRow({ uri, label, progress, state, height }: AnalysisRowProps) {
  const { t } = useTranslation('progressCheck');
  const done = state === 'done';
  const active = state === 'active';
  return (
    <View className="flex-row items-center gap-4">
      <View
        className={cn(
          'overflow-hidden rounded-2xl bg-surface',
          state === 'waiting' && 'opacity-40',
        )}
        style={{
          width: height * 0.75,
          height,
          boxShadow: active ? `0 0 0 2px ${colors.accent}, 0 0 22px ${colors.accent}40` : undefined,
        }}
      >
        <Image source={{ uri }} contentFit="cover" style={{ flex: 1 }} />
      </View>
      <View className="min-w-0 flex-1 gap-2.5">
        <View className="flex-row items-center gap-2">
          <Text variant="headline" numberOfLines={1} className="shrink text-xl leading-6">
            {label}
          </Text>
          {done ? <CheckBadge size={22} glyph={11} /> : null}
          {active ? (
            <Text variant="caption" tone="secondary" className="ml-auto tabular-nums">
              {`${Math.round(progress * 100)}%`}
            </Text>
          ) : null}
        </View>
        <View className="h-1.5 overflow-hidden rounded-full bg-control">
          <View
            className={cn('h-full rounded-full', done ? 'bg-accent' : 'bg-fg')}
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </View>
        <Text variant="caption" tone={done ? 'accent' : active ? 'default' : 'subtle'}>
          {t(`analysis.row.${state}`)}
        </Text>
      </View>
    </View>
  );
}

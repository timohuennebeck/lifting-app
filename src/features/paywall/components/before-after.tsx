import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useUnits } from '@/shared/data/profile';
import { cn } from '@/shared/lib/cn';
import { formatDate, formatWeight } from '@/shared/lib/format';
import { CompareArrow, ComparePhotoCard } from '@/shared/ui/compare-photo-card';

// The before photo is pre-graded to greyscale: iOS can't desaturate an image at runtime.
const BEFORE = require('@/assets/images/paywall/before.jpg');
const AFTER = require('@/assets/images/paywall/after.jpg');
const BEFORE_DATE = new Date(2026, 1, 3);
const AFTER_DATE = new Date(2026, 8, 28);

interface SideProps {
  source: number;
  tag: string;
  date: Date;
  score: number;
  weightKg: number;
  after?: boolean;
}

/** One sample progress check, styled like the before/after cards of the Körper tab. */
function Side({ source, tag, date, score, weightKg, after }: SideProps) {
  const units = useUnits();
  return (
    <ComparePhotoCard
      photo={
        <Image
          source={source}
          contentFit="cover"
          contentPosition={{ left: '50%', top: '30%' }}
          accessibilityLabel={tag}
          style={StyleSheet.absoluteFill}
        />
      }
      tag={tag}
      label={formatDate(date, { day: 'numeric', month: 'short', year: 'numeric' })}
      score={score}
      weight={formatWeight(weightKg, units)}
      after={after}
      muted={!after}
      className={cn(
        'flex-1 rounded-[22px] border-[1.5px]',
        after ? 'border-accent' : 'border-outline',
      )}
    />
  );
}

/** Before/after photo comparison that heads the paywall. */
export function BeforeAfter() {
  const { t } = useTranslation('paywall');
  return (
    <View className="h-54.5 flex-row gap-3">
      <Side
        source={BEFORE}
        tag={t('paywall.before')}
        date={BEFORE_DATE}
        score={62}
        weightKg={84.2}
      />
      <Side
        source={AFTER}
        tag={t('paywall.after')}
        date={AFTER_DATE}
        score={78}
        weightKg={79.6}
        after
      />
      <CompareArrow />
    </View>
  );
}

import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { formatDate } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

// Pre-graded copies of the design photo (grayscale + 70% brightness for "before").
const BEFORE = require('@/assets/images/paywall/before.jpg');
const AFTER = require('@/assets/images/demo-person.jpg');
const BEFORE_DATE = new Date(2026, 1, 3);
const AFTER_DATE = new Date(2026, 8, 28);

interface PhotoProps {
  source: number;
  label: string;
  date: Date;
  after?: boolean;
  focusX: string;
}

function Photo({ source, label, date, after, focusX }: PhotoProps) {
  return (
    <View
      className={cn(
        'flex-1 overflow-hidden rounded-[22px] border-[1.5px] bg-surface',
        after ? 'border-accent' : 'border-outline',
      )}
    >
      <Image
        source={source}
        contentFit="cover"
        contentPosition={{ left: focusX, top: '30%' }}
        accessibilityLabel={label}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      />
      <View
        className={cn(
          'absolute top-2.5 left-2.5 rounded-full px-2.5 py-1.25',
          after ? 'bg-accent' : 'bg-pill',
        )}
      >
        <Text
          variant="caption"
          tone={after ? 'onAccent' : 'default'}
          className="text-[11px] leading-3.25 tracking-[1.1px] uppercase"
        >
          {label}
        </Text>
      </View>
      <Text
        variant="caption"
        className="absolute bottom-2.5 left-2.5 text-xs"
        style={{ textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6 }}
      >
        {formatDate(date, { day: 'numeric', month: 'short', year: 'numeric' })}
      </Text>
    </View>
  );
}

/** Before/after photo comparison that heads the paywall. */
export function BeforeAfter() {
  const { t } = useTranslation('paywall');
  return (
    <View className="h-54.5 flex-row gap-3">
      <Photo source={BEFORE} label={t('paywall.before')} date={BEFORE_DATE} focusX="25%" />
      <Photo source={AFTER} label={t('paywall.after')} date={AFTER_DATE} focusX="70%" after />
      <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
        <View
          className="size-10 items-center justify-center rounded-full bg-accent"
          style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.35)' }}
        >
          <Icon name="arrow-right" size={15} color={colors.onAccent} />
        </View>
      </View>
    </View>
  );
}

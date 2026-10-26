import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { toUnits } from '@/shared/lib/body-weight';
import { cn } from '@/shared/lib/cn';
import { formatNumber, weightUnit } from '@/shared/lib/format';
import { Text } from '@/shared/ui/text';

import { useDraft } from '../stores/onboarding-store';

/** Ruler ticks either side of the weight, in tenths. */
const SIDE = 9;
const TICKS = Array.from({ length: SIDE * 2 + 1 }, (_, i) => i - SIDE);

/** A tick as a column of dots: the weight's tallest, then whole, half and other tenths. */
function Tick({ tenth, current }: { tenth: number; current: boolean }) {
  const dots = current ? 13 : tenth % 10 === 0 ? 10 : tenth % 5 === 0 ? 7 : 4;
  return (
    <View className="gap-[3px]">
      {Array.from({ length: dots }, (_, i) => (
        <View
          key={i}
          className={cn(
            'size-[2px] rounded-full',
            current ? 'bg-accent' : dots > 4 ? 'bg-dim' : 'bg-outline',
          )}
        />
      ))}
    </View>
  );
}

/**
 * The Action button step's picture: an iPhone's side with the Action button lit and labelled,
 * its screen the weight entry in miniature with the weight given a step before. The card
 * crops the phone at the bottom, and more of it on short screens.
 */
export function ActionButtonPreview() {
  const { t } = useTranslation('onboarding');
  const { weightKg, unitPreference } = useDraft();
  const tenths = Math.round(toUnits(weightKg, unitPreference) * 10);

  return (
    <View
      className="mx-4 mt-6 max-h-[262px] min-h-[150px] flex-1 overflow-hidden rounded-[22px] bg-surface"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View className="absolute top-7 right-[6%] -bottom-16 left-[24%]">
        {/* The side buttons, reaching 4pt under the frame drawn over them so they sit flush on
            it: the Action button in two rings of glow (10 %, then 25 % accent), then volume. */}
        <View className="absolute top-14 -left-[15px] h-15 w-[19px] rounded-md bg-accent/10" />
        <View className="absolute top-15.5 -left-2.5 h-12 w-3.5 rounded bg-accent/[0.17]" />
        <View className="absolute top-16.5 -left-[5px] h-10 w-[9px] rounded-sm bg-accent" />
        <View className="absolute top-[125px] -left-1 h-[45px] w-2 rounded-sm bg-track" />
        <View className="absolute top-[179px] -left-1 h-[51px] w-2 rounded-sm bg-track" />
        {/* A box of its own width: with only `right` set the label would get none and wrap. */}
        <View className="absolute top-[75px] right-full mr-[17px] w-40 items-end">
          <View className="h-5.5 justify-center rounded-full bg-accent px-2">
            <Text variant="caption" tone="onAccent" numberOfLines={1} className="font-inter-bold">
              {t('actionButton.action')}
            </Text>
          </View>
        </View>

        <View className="flex-1 items-center rounded-[46px] border-[7px] border-line bg-bg pt-14">
          <View className="flex-row items-baseline gap-1">
            <Text className="font-inter-semibold text-[56px] leading-[60px] tracking-[-2px] tabular-nums">
              {formatNumber(tenths / 10, 1, 1)}
            </Text>
            <Text tone="muted" className="font-inter-semibold text-[15px]">
              {weightUnit(unitPreference)}
            </Text>
          </View>
          <View className="mt-5 flex-row items-end gap-[7px]">
            {TICKS.map((offset) => (
              <Tick key={offset} tenth={tenths + offset} current={offset === 0} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

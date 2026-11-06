import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import type { SheetSummary } from '../lib/sheet-summary';
import { CheckBox } from './check-box';

/** What a sheet holds, in a few words: "86 Einträge · mit Datum", "4 Tage · 24 Übungen". */
function useContents(sheet: SheetSummary) {
  const { t } = useTranslation('workoutImport');
  if (sheet.kind === 'log') return t('sheets.log', { count: sheet.entries });
  if (sheet.kind !== 'plan') return t(`sheets.${sheet.kind}`);
  if (!sheet.routines) return t('sheets.exercises', { count: sheet.exercises });
  const days = t('sheets.days', { count: sheet.routines });
  return t('sheets.plan', { days, count: sheet.exercises });
}

export interface SheetRowProps {
  sheet: SheetSummary;
  picked: boolean;
  recommended: boolean;
  onPress: () => void;
}

/** 13s: a sheet of the workbook to read or not; an empty one can't be picked. */
export function SheetRow({ sheet, picked, recommended, onPress }: SheetRowProps) {
  const { t } = useTranslation('workoutImport');
  const empty = sheet.kind === 'empty';
  const contents = useContents(sheet);
  return (
    <PressableScale
      haptic="select"
      onPress={onPress}
      disabled={empty}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: picked, disabled: empty }}
      className={cn(
        'flex-row items-center gap-3.5 rounded-[20px] bg-surface px-4 py-3.5',
        !picked && 'opacity-50',
      )}
    >
      <View className="size-10 items-center justify-center rounded-xl bg-elevated">
        <Icon name="table" size={18} color={colors.subtle} />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text
            numberOfLines={1}
            className="shrink font-inter-semibold text-base leading-[19px] text-fg"
          >
            {sheet.name}
          </Text>
          {recommended ? (
            <View className="rounded-full bg-control px-1.75 py-0.75">
              <Text className="font-inter-semibold text-[11px] leading-[13px] tracking-[0.33px] text-accent">
                {t('sheets.recommended')}
              </Text>
            </View>
          ) : null}
        </View>
        <Text numberOfLines={1} className="mt-0.75 font-inter text-[13px] leading-4 text-subtle">
          {contents}
        </Text>
      </View>
      <CheckBox checked={picked} />
    </PressableScale>
  );
}

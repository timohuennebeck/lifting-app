import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';

import { IMPORT_STEPS } from '../lib/format';
import type { SheetSummary } from '../lib/sheet-summary';
import { recommendedSheets } from '../lib/sheets';
import { useImportStore } from '../stores/import-store';

interface SheetRowProps {
  sheet: SheetSummary;
  picked: boolean;
  recommended: boolean;
  /** Seems unrelated to the plan. */
  dimmed: boolean;
  onPress: () => void;
}

function SheetRow({ sheet, picked, recommended, dimmed, onPress }: SheetRowProps) {
  const { t } = useTranslation('planImport');
  const empty = sheet.kind === 'empty';
  const contents =
    sheet.kind === 'plan'
      ? [
          ...(sheet.days ? [t('sheets.days', { count: sheet.days })] : []),
          t('sheets.exercises', { count: sheet.exercises }),
        ].join(' · ')
      : sheet.kind === 'log'
        ? t('sheets.log', { count: sheet.entries })
        : t(`sheets.${sheet.kind}`);

  return (
    <PressableScale
      haptic="select"
      onPress={onPress}
      // Nothing to read on an empty sheet.
      disabled={empty}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: picked, disabled: empty }}
      className={cn(
        'flex-row items-center gap-3 rounded-2xl bg-surface py-3 pr-4 pl-3',
        dimmed && 'opacity-45',
      )}
    >
      <View className="size-10 items-center justify-center rounded-xl bg-elevated">
        <Icon name="table" size={18} color={colors.fgMid} />
      </View>
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text variant="bodyStrong" numberOfLines={1} className="shrink">
            {sheet.name}
          </Text>
          {recommended ? (
            <View className="rounded-md bg-accent/16 px-1.5 py-0.5">
              <Text className="font-inter-semibold text-[10px] leading-3 tracking-[0.6px] text-accent uppercase">
                {t('sheets.recommended')}
              </Text>
            </View>
          ) : null}
        </View>
        <Text variant="caption" tone="subtle" numberOfLines={1} className="font-inter">
          {contents}
        </Text>
      </View>
      <View
        className={cn(
          'size-6 items-center justify-center rounded-md',
          picked ? 'bg-accent' : 'border-2 border-track',
        )}
      >
        {picked ? <Icon name="check" size={11} color={colors.onAccent} /> : null}
      </View>
    </PressableScale>
  );
}

/**
 * 05 · after "Passt so?": a workbook with several sheets, to read only those the plan is in.
 * Sheets that look like a plan are recommended and picked; the rest are dimmed.
 */
export function SheetsScreen() {
  const { t } = useTranslation('planImport');
  const { step } = usePlanFlow();
  const source = useImportStore((s) => s.source);
  const workbook = useImportStore((s) => s.workbook);
  const pickSheets = useImportStore((s) => s.pickSheets);
  // Back here again: as picked before.
  const [picked, setPicked] = useState(
    () =>
      new Set(
        source?.kind === 'file' && source.sheets
          ? source.sheets
          : workbook
            ? recommendedSheets(workbook)
            : [],
      ),
  );
  if (source?.kind !== 'file' || !workbook) return <Redirect href={step('/import')} />;

  const plans = workbook.some((s) => s.kind === 'plan');
  const unrelated = (sheet: SheetSummary) =>
    sheet.kind === 'empty' || (plans && (sheet.kind === 'other' || sheet.kind === 'text'));

  function toggle(name: string) {
    setPicked((current) => {
      const next = new Set(current);
      if (!next.delete(name)) next.add(name);
      return next;
    });
  }

  function read() {
    pickSheets(workbook?.filter((s) => picked.has(s.name)).map((s) => s.name) ?? []);
    router.push(step('/import/analysis'));
  }

  return (
    <StepScreen
      step={2}
      total={IMPORT_STEPS}
      title={t('sheets.title')}
      subtitle={t('sheets.subtitle', { name: source.file.name, count: workbook.length })}
      subtitleTone="subtle"
      scroll
      footer={
        <Button
          label={picked.size ? t('sheets.cta', { count: picked.size }) : t('sheets.none')}
          disabled={!picked.size}
          onPress={read}
        />
      }
    >
      <View className="gap-2.5 px-4 pt-5">
        {workbook.map((sheet) => (
          <SheetRow
            key={sheet.name}
            sheet={sheet}
            picked={picked.has(sheet.name)}
            recommended={sheet.kind === 'plan'}
            dimmed={unrelated(sheet)}
            onPress={() => toggle(sheet.name)}
          />
        ))}
      </View>
    </StepScreen>
  );
}

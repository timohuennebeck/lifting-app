import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { haptics } from '@/shared/lib/haptics';
import { IMPORT_SHEETS_MAX } from '@/shared/lib/limits';
import { Button } from '@/shared/ui/button';
import { StepScreen } from '@/shared/ui/step-screen';

import { SheetRow } from '../components/sheet-row';
import type { SheetSummary } from '../lib/sheet-summary';
import { useImportStep } from '../hooks/use-import-step';
import { baseName, CTA_STYLE, TITLE_STYLE } from '../lib/steps';
import { useWorkoutImportStore } from '../stores/workout-import-store';

/**
 * Sheets that seem to hold workouts or a plan; all that aren't empty when none do. At most as
 * many as are read at once.
 */
function recommended(sheets: SheetSummary[]) {
  const likely = sheets.filter((s) => s.kind === 'log' || s.kind === 'plan');
  return (likely.length ? likely : sheets.filter((s) => s.kind !== 'empty'))
    .slice(0, IMPORT_SHEETS_MAX)
    .map((s) => s.name);
}

/** 13s: a workbook's sheets, to read only those with the training in them. */
export function SheetsScreen() {
  const { t } = useTranslation('workoutImport');
  const { step } = usePlanFlow();
  const counter = useImportStep('sheets');
  const file = useWorkoutImportStore((s) => s.file);
  const summaries = useWorkoutImportStore((s) => s.read?.summaries ?? null);
  const chosen = useWorkoutImportStore((s) => s.sheets);
  const pickSheets = useWorkoutImportStore((s) => s.pickSheets);
  // Back here again: as picked before.
  const [picked, setPicked] = useState(
    () => new Set(chosen ?? (summaries ? recommended(summaries) : [])),
  );
  if (!file || !summaries) return <Redirect href={step('/import')} />;

  const advised = new Set(
    summaries.filter((s) => s.kind === 'log' || s.kind === 'plan').map((s) => s.name),
  );

  function toggle(name: string) {
    // No more than are read at once: the tap only shakes.
    if (!picked.has(name) && picked.size >= IMPORT_SHEETS_MAX) {
      haptics.error();
      return;
    }
    setPicked((current) => {
      const next = new Set(current);
      if (!next.delete(name)) next.add(name);
      return next;
    });
  }

  function read() {
    pickSheets(summaries?.filter((s) => picked.has(s.name)).map((s) => s.name) ?? []);
    router.push(step('/import/reading'));
  }

  return (
    <StepScreen
      {...TITLE_STYLE}
      subtitleClassName="mt-2.5 leading-[21.75px]"
      step={counter.step}
      total={counter.total}
      title={t('sheets.title')}
      subtitle={t('sheets.subtitle', { name: baseName(file.name), count: summaries.length })}
      scroll
      footer={
        <Button
          {...CTA_STYLE}
          label={picked.size ? t('sheets.cta', { count: picked.size }) : t('sheets.none')}
          disabled={!picked.size}
          onPress={read}
        />
      }
    >
      <View className="gap-2 px-4 pt-5.5">
        {summaries.map((sheet) => (
          <SheetRow
            key={sheet.name}
            sheet={sheet}
            picked={picked.has(sheet.name)}
            recommended={advised.has(sheet.name)}
            onPress={() => toggle(sheet.name)}
          />
        ))}
      </View>
    </StepScreen>
  );
}

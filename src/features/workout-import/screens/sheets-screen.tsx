import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { Button } from '@/shared/ui/button';
import { StepScreen } from '@/shared/ui/step-screen';

import { SheetRow } from '../components/sheet-row';
import type { SheetSummary } from '../lib/sheet-summary';
import { baseName, CTA_STYLE, flowSteps, TITLE_STYLE } from '../lib/steps';
import { useWorkoutImportStore } from '../stores/workout-import-store';

/** Sheets that seem to hold workouts or a plan; all that aren't empty when none do. */
function recommended(sheets: SheetSummary[]) {
  const likely = sheets.filter((s) => s.kind === 'log' || s.kind === 'plan');
  return (likely.length ? likely : sheets.filter((s) => s.kind !== 'empty')).map((s) => s.name);
}

/** 13s: a workbook's sheets, to read only those with the training in them. */
export function SheetsScreen() {
  const { t } = useTranslation('workoutImport');
  const { inApp, step } = usePlanFlow();
  const file = useWorkoutImportStore((s) => s.file);
  const summaries = useWorkoutImportStore((s) => s.read?.summaries ?? null);
  const chosen = useWorkoutImportStore((s) => s.sheets);
  const readFile = useWorkoutImportStore((s) => s.read);
  const pickSheets = useWorkoutImportStore((s) => s.pickSheets);
  // Back here again: as picked before.
  const [picked, setPicked] = useState(
    () => new Set(chosen ?? (summaries ? recommended(summaries) : [])),
  );
  if (!file || !summaries) return <Redirect href={step('/import')} />;
  const counter = flowSteps(readFile, inApp);

  const advised = new Set(
    summaries.filter((s) => s.kind === 'log' || s.kind === 'plan').map((s) => s.name),
  );

  function toggle(name: string) {
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
      step={counter.offset + 2}
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

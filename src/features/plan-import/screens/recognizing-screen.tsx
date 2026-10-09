import { Redirect, router, Stack } from 'expo-router';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { haptics } from '@/shared/lib/haptics';
import { useAccentColor } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { type ScanChip, ScanStage, useTimedProgress } from '@/shared/ui/scan-stage';
import { StepHeader } from '@/shared/ui/step-header';

import { IMPORT_STEPS } from '../lib/format';
import { applyVoiceScript, VOICE_SCRIPTS } from '../lib/voice-scripts';
import { useImportStore } from '../stores/import-store';

const DURATION_MS = 3600;
/** Chip positions and float speeds from design 06b-4 (relative to its content area). */
const POSITIONS = [
  [28, 110, 3],
  [194, 78, 3.6],
  [230, 168, 4.1],
  [50, 262, 3.3],
  [208, 330, 3.9],
  [84, 350, 3.5],
] as const;
/** Offset from the design's content area to the scan frame used by ScanStage. */
const FRAME_OFFSET = 130;

/** 06b-4: "recognizing" animation, then the spoken changes land in the plan. */
export function RecognizingScreen() {
  const { t } = useTranslation(['planImport', 'exercises', 'common']);
  const accent = useAccentColor();
  const plan = useImportStore((s) => s.plan);
  const take = useImportStore((s) => s.voiceTake);
  const done = useRef(false);
  const script = VOICE_SCRIPTS[take % VOICE_SCRIPTS.length];
  const existing = plan?.days.find((d) => d.weekday === script.weekday);
  const dayName = existing?.name ?? t(`planImport:voice.days.${script.dayName}`);

  function finish() {
    if (done.current) return;
    done.current = true;
    const { editPlan, selectDay, nextVoiceTake } = useImportStore.getState();
    let dayIndex = 0;
    editPlan((current) => {
      const applied = applyVoiceScript(current, script, dayName);
      dayIndex = applied.dayIndex;
      return applied.plan;
    });
    selectDay(dayIndex);
    nextVoiceTake();
    haptics.success();
    router.back();
  }

  const progress = useTimedProgress(DURATION_MS, finish);
  if (!plan) return <Redirect href="/import" />;

  const stages = t('planImport:recognizing.stages', { returnObjects: true });
  const long = t('common:weekdays.long', { returnObjects: true });
  const labels = [
    `${long[script.weekday]} · ${dayName}`,
    ...script.remove
      .filter((id) => existing?.exercises.some((e) => e.exerciseId === id))
      .map((id) => `− ${t(`exercises:${id}.name`)}`),
    ...script.add.flatMap((e) => [t(`exercises:${e.exerciseId}.name`), `${e.sets} × ${e.reps}`]),
  ].slice(0, POSITIONS.length);
  const chips: ScanChip[] = labels.map((label, i) => ({
    label,
    x: POSITIONS[i][0],
    y: POSITIONS[i][1] + FRAME_OFFSET,
    duration: POSITIONS[i][2],
    delay: i * 0.4,
    accent: label.includes('×'),
  }));

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false, animation: 'fade' }} />
      <ScanStage
        progress={progress}
        stages={stages}
        chips={chips}
        header={<StepHeader step={IMPORT_STEPS} total={IMPORT_STEPS} hideBack />}
      >
        <View className="size-30 items-center justify-center">
          <Svg width={160} height={160} style={{ position: 'absolute', left: -20, top: -20 }}>
            <Defs>
              <RadialGradient id="mic-glow" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={accent} stopOpacity={0.45} />
                <Stop offset="1" stopColor={accent} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={80} cy={80} r={80} fill="url(#mic-glow)" />
          </Svg>
          <Icon name="mic" size={54} color={accent} />
        </View>
      </ScanStage>
    </>
  );
}

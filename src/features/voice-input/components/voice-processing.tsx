import { useTranslation } from 'react-i18next';

import { useExerciseName } from '@/shared/data/exercises';
import { useTimedProgress } from '@/shared/hooks/use-timed-progress';
import { type ScanChip, ScanStage } from '@/shared/ui/scan-stage';

import { MicGlow } from './mic-glow';

/** The progress is paced for this long and stops short of the end until the exercises are in. */
const EXPECTED_MS = 8000;

/** The "working on it" stage while the exercises the user said are matched (design 3). */
export function VoiceProcessing() {
  const { t, i18n } = useTranslation('voice');
  const progress = useTimedProgress(EXPECTED_MS);
  const hackSquat = useExerciseName('hack-squat', i18n.language);
  const benchPress = useExerciseName('bench-press', i18n.language);
  const frenchPress = useExerciseName('french-press', i18n.language);
  const chips: ScanChip[] = [
    { label: hackSquat, x: 28, y: 246, duration: 3.4 },
    { label: benchPress, x: 231, y: 293, duration: 3.9, delay: 0.6 },
    { label: '3 × 12', x: 50, y: 387, accent: true, duration: 3.6, delay: 1.1 },
    { label: frenchPress, x: 208, y: 462, duration: 4.1, delay: 0.3 },
  ];

  return (
    <ScanStage
      progress={Math.min(0.95, progress)}
      stages={t('stages', { returnObjects: true })}
      chips={chips}
    >
      <MicGlow />
    </ScanStage>
  );
}

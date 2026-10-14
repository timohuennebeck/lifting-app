import { Redirect, router } from 'expo-router';
import { useEffect, useEffectEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { singleFlight } from '@/shared/lib/async';
import { haptics } from '@/shared/lib/haptics';
import { clamp } from '@/shared/lib/math';
import { useUserId } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { useTimedProgress } from '@/shared/ui/scan-stage';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { AnalysisRow } from '../components/analysis-row';
import { GroupMarquee } from '../components/group-marquee';
import { useProgressChecks } from '../data/progress-checks';
import {
  AnalysisError,
  assessProgress,
  type ProgressCheckResult,
} from '../lib/progress-check-service';
import { GROUPS, POSES } from '../lib/poses';
import { useCloseCheck } from '../hooks/use-close-check';
import { hasAllShots, useProgressCheckStore } from '../stores/progress-check-store';

/** Roughly how long the analysis takes; the animation waits at 99 % if it takes longer. */
const DURATION_MS = 14000;
/** Height of everything but the photo rows (header, percentage, chips, button). */
const CHROME_HEIGHT = 330;
const ROW_GAP = 14;
/** Photo height of a row: as tall as the screen allows, within these bounds. */
const MIN_PHOTO = 72;
const MAX_PHOTO = 124;

/**
 * 08c-H: uploads the three photos and has them analysed, pose by pose in rows, then offers the
 * result. Photos the analysis can't judge go back to the camera, shown with what's wrong.
 */
export function AnalysisScreen() {
  const { t } = useTranslation(['progressCheck', 'common']);
  const close = useCloseCheck();
  const insets = useSafeAreaInsets();
  const footerInset = useFooterInset();
  const { height } = useWindowDimensions();
  const checkId = useProgressCheckStore((s) => s.checkId);
  const shots = useProgressCheckStore((s) => s.shots);
  const userId = useUserId();
  const { data: checks } = useProgressChecks();
  const [result, setResult] = useState<ProgressCheckResult | null>(null);
  const progress = useTimedProgress(DURATION_MS);
  const complete = hasAllShots(shots);

  const analyze = useEffectEvent(() => {
    if (!checkId || !userId || !hasAllShots(shots)) return;
    // Marked first: whatever got uploaded is removed again if the check is discarded.
    useProgressCheckStore.getState().setUploaded();
    let active = true;
    // One run per check: a remounted screen picks up the same one instead of paying twice.
    singleFlight(`progress-check-analysis:${checkId}`, () => assessProgress(checkId, userId, shots))
      .then((outcome) => {
        if (!active) return;
        if (outcome.status === 'retake') {
          haptics.warning();
          useProgressCheckStore.getState().rejectShots(outcome.issues);
          router.back();
          return;
        }
        setResult(outcome.result);
        useProgressCheckStore.getState().setResult(outcome.result);
      })
      .catch((error) => {
        if (!active) return;
        console.warn('Progress-check analysis failed', error);
        const reason = error instanceof AnalysisError ? error.reason : 'failed';
        Alert.alert(t(`analysis.errors.${reason}`));
        router.back();
      });
    return () => {
      active = false;
    };
  });

  useEffect(() => analyze(), []);

  // Waits at 99 % if the analysis takes longer than the animation.
  const pct = Math.floor(Math.min(result ? 1 : 0.99, progress) * 100);
  const done = pct >= 100;

  useEffect(() => {
    if (done) haptics.success();
  }, [done]);

  if (!checkId || !complete) return <Redirect href="/progress-check/camera" />;

  // The tiles fill one after another; the stage text moves on in its own steps.
  const share = 100 / POSES.length;
  const segment = done ? POSES.length - 1 : Math.floor(pct / share);
  const stages = t('analysis.stages', { returnObjects: true });
  const finalStage = checks?.length
    ? t('analysis.finalStage.next')
    : t('analysis.finalStage.first');
  const steps = [...stages, finalStage];
  const stage = done ? t('analysis.done') : steps[Math.floor((pct / 100) * steps.length)];
  const rowsHeight = height - insets.top - footerInset - CHROME_HEIGHT;
  const photoHeight = clamp(
    (rowsHeight - ROW_GAP * (POSES.length - 1)) / POSES.length,
    MIN_PHOTO,
    MAX_PHOTO,
  );

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <ScreenHeader icon="close" title={t('analysis.title')} onBack={close} />
      <View className="px-4 pt-3.5" style={{ gap: ROW_GAP }}>
        {POSES.map((pose, i) => {
          const progress = done ? 1 : clamp((pct - i * share) / share, 0, 1);
          let state: 'waiting' | 'active' | 'done' = 'waiting';
          if (progress >= 1) state = 'done';
          else if (i === segment) state = 'active';
          return (
            <AnalysisRow
              key={pose}
              uri={shots[pose]?.uri ?? ''}
              label={t(`poses.${pose}.name`)}
              progress={progress}
              state={state}
              height={photoHeight}
            />
          );
        })}
      </View>
      <View className="items-center gap-1.5 px-5 pt-6.5">
        <Text className="font-inter-semibold text-[56px] leading-16 text-accent tabular-nums">
          {`${pct}%`}
        </Text>
        <Text
          variant="bodyStrong"
          className="mt-1.5 text-center text-base"
          accessibilityLiveRegion="polite"
        >
          {stage}
        </Text>
      </View>
      <View className="mt-4.5">
        <GroupMarquee
          chips={GROUPS.map((g, i) => ({ label: t(`groups.${g}`), on: pct >= i * 14 + 14 }))}
        />
      </View>
      <View className="mt-auto px-4" style={{ paddingBottom: footerInset }}>
        {done ? (
          <Button
            label={t('analysis.cta')}
            onPress={() => router.replace(`/progress-check/result/${checkId}`)}
          />
        ) : (
          <View className="h-15 items-center justify-center">
            <Text variant="caption" tone="subtle" className="font-inter">
              {t('analysis.keepOpen')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

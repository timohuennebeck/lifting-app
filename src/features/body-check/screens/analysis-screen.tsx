import { Redirect, router } from 'expo-router';
import { useEffect, useEffectEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { haptics } from '@/shared/lib/haptics';
import { clamp } from '@/shared/lib/math';
import { useUserId } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { useTimedProgress } from '@/shared/ui/scan-stage';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { AnalysisTile } from '../components/analysis-tile';
import { GroupMarquee } from '../components/group-marquee';
import { useBodyChecks } from '../data/body-checks';
import {
  AnalysisError,
  type AnalysisOutcome,
  analyzeBodyCheck,
  type BodyCheckResult,
} from '../lib/body-check-service';
import { GROUPS, POSES, type BodyPose } from '../lib/poses';
import { useCloseCheck } from '../hooks/use-close-check';
import { type Shot, useBodyCheckStore } from '../stores/body-check-store';

/** Roughly how long the analysis takes; the animation waits at 99 % if it takes longer. */
const DURATION_MS = 14000;
const TILE_MAX = 216;
/** Height of everything but the tile row (header, score, chips, CTA). */
const CHROME_HEIGHT = 330;
/** Side padding and gaps of the tile row. */
const ROW_CHROME = 32 + 2 * 10;

/** Running analyses by check, so a remounted screen picks up the same one instead of paying twice. */
const running = new Map<string, Promise<AnalysisOutcome>>();

function analysisOf(checkId: string, userId: string, photos: Record<BodyPose, Shot>) {
  let analysis = running.get(checkId);
  if (!analysis) {
    analysis = analyzeBodyCheck(checkId, userId, photos).finally(() => running.delete(checkId));
    running.set(checkId, analysis);
  }
  return analysis;
}

/**
 * 08c-H: uploads the three photos and has them analysed behind a reveal animation, then offers
 * the result. Photos the analysis can't judge go back to the review screen for a retake.
 */
export function AnalysisScreen() {
  const { t } = useTranslation(['bodyCheck', 'common']);
  const close = useCloseCheck();
  const insets = useSafeAreaInsets();
  const footerInset = useFooterInset();
  const { width, height } = useWindowDimensions();
  const checkId = useBodyCheckStore((s) => s.checkId);
  const shots = useBodyCheckStore((s) => s.shots);
  const userId = useUserId();
  const { data: checks } = useBodyChecks();
  const [result, setResult] = useState<BodyCheckResult | null>(null);
  const progress = useTimedProgress(DURATION_MS);
  const complete = POSES.every((p) => shots[p]);

  const analyze = useEffectEvent(() => {
    if (!checkId || !userId || !complete) return;
    const store = useBodyCheckStore.getState();
    // Marked first: whatever got uploaded is removed again if the check is discarded.
    store.setUploaded();
    let active = true;
    analysisOf(checkId, userId, shots as Record<BodyPose, Shot>)
      .then((outcome) => {
        if (!active) return;
        if (outcome.status === 'retake') {
          haptics.warning();
          useBodyCheckStore.getState().rejectShots(outcome.issues);
          router.back();
          return;
        }
        setResult(outcome.result);
        useBodyCheckStore.getState().setResult(outcome.result);
      })
      .catch((error) => {
        if (!active) return;
        console.warn('Body-check analysis failed', error);
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

  if (!checkId || !complete) return <Redirect href="/body-check/review" />;

  // The tiles fill one after another; the stage text moves on in its own steps.
  const share = 100 / POSES.length;
  const segment = done ? POSES.length - 1 : Math.floor(pct / share);
  const stages = t('analysis.stages', { returnObjects: true });
  const finalStage = checks?.length
    ? t('analysis.finalStage.next')
    : t('analysis.finalStage.first');
  const steps = [...stages, finalStage];
  const stage = done ? t('analysis.done') : steps[Math.floor((pct / 100) * steps.length)];
  const tileWidth = (width - ROW_CHROME) / POSES.length;
  const tileHeight = clamp(
    Math.min(tileWidth * 1.5, height - insets.top - footerInset - CHROME_HEIGHT),
    120,
    TILE_MAX,
  );

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <ScreenHeader title={t('analysis.title')} onBack={close} />
      <View className="flex-row gap-2.5 px-4 pt-3.5">
        {POSES.map((pose, i) => (
          <AnalysisTile
            key={pose}
            uri={shots[pose]?.uri ?? ''}
            label={t(`poses.${pose}.short`)}
            progress={done ? 1 : clamp((pct - i * share) / share, 0, 1)}
            active={!done && i === segment}
            height={tileHeight}
          />
        ))}
      </View>
      <View className="items-center gap-1.5 px-5 pt-6.5">
        <Text className="font-inter-semibold text-[48px] leading-12 text-accent">{`${pct}%`}</Text>
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
            onPress={() => router.replace(`/body-check/result/${checkId}`)}
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

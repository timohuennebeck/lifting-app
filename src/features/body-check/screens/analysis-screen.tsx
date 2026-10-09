import { Redirect, router } from 'expo-router';
import { useEffect, useEffectEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProfile } from '@/shared/data/profile';
import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { haptics } from '@/shared/lib/haptics';
import { clamp } from '@/shared/lib/math';
import { Button } from '@/shared/ui/button';
import { useTimedProgress } from '@/shared/ui/scan-stage';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { AnalysisTile } from '../components/analysis-tile';
import { GroupMarquee } from '../components/group-marquee';
import { useBodyChecks } from '../data/body-checks';
import { analyzeBodyCheck, type BodyCheckResult } from '../lib/body-check-service';
import { GROUPS, POSES } from '../lib/poses';
import { useCloseCheck } from '../hooks/use-close-check';
import { useBodyCheckStore } from '../stores/body-check-store';

const DURATION_MS = 9000;
const TILE_MAX = 216;
/** Height of everything but the two tile rows (header, score, chips, CTA). */
const CHROME_HEIGHT = 330;

/** 08c-H: analyses the four photos behind a reveal animation, then offers the result. */
export function AnalysisScreen() {
  const { t } = useTranslation(['bodyCheck', 'common']);
  const close = useCloseCheck();
  const insets = useSafeAreaInsets();
  const footerInset = useFooterInset();
  const { height } = useWindowDimensions();
  const checkId = useBodyCheckStore((s) => s.checkId);
  const shots = useBodyCheckStore((s) => s.shots);
  const { profile, isLoading: profileLoading } = useProfile();
  const { data: checks } = useBodyChecks();
  const [result, setResult] = useState<BodyCheckResult | null>(null);
  const progress = useTimedProgress(DURATION_MS);
  const ready = !!checks && !profileLoading;

  const analyze = useEffectEvent(() => {
    const photos = POSES.flatMap((pose) => {
      const shot = shots[pose];
      return shot ? [{ ...shot, pose }] : [];
    });
    const last = checks?.at(-1);
    const previous = last
      ? { score: last.score, groupScores: last.groupScores, metrics: last.metrics }
      : null;
    let active = true;
    analyzeBodyCheck(photos, profile, previous)
      .then((r) => {
        if (!active) return;
        setResult(r);
        useBodyCheckStore.getState().setResult(r);
      })
      .catch((error) => {
        if (!active) return;
        console.warn('Body-check analysis failed', error);
        Alert.alert(t('analysis.error'));
        router.back();
      });
    return () => {
      active = false;
    };
  });

  useEffect(() => {
    if (ready) return analyze();
  }, [ready]);

  // Waits at 99 % if the analysis takes longer than the animation.
  const pct = Math.floor(Math.min(result ? 1 : 0.99, progress) * 100);
  const done = pct >= 100;

  useEffect(() => {
    if (done) haptics.success();
  }, [done]);

  if (!checkId || POSES.some((p) => !shots[p])) return <Redirect href="/body-check/review" />;

  const segment = done ? POSES.length - 1 : Math.floor(pct / 25);
  const stages = t('analysis.stages', { returnObjects: true });
  const finalStage = checks?.length
    ? t('analysis.finalStage.next')
    : t('analysis.finalStage.first');
  const stage = done ? t('analysis.done') : [...stages, finalStage][segment];
  const tileHeight = clamp((height - insets.top - footerInset - CHROME_HEIGHT) / 2, 120, TILE_MAX);

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <ScreenHeader icon="close" title={t('analysis.title')} onBack={close} />
      <View className="gap-2.5 px-4 pt-3.5">
        {[0, 2].map((row) => (
          <View key={row} className="flex-row gap-2.5">
            {POSES.slice(row, row + 2).map((pose, j) => {
              const i = row + j;
              return (
                <AnalysisTile
                  key={pose}
                  uri={shots[pose]?.uri ?? ''}
                  label={t(`poses.${pose}.short`)}
                  progress={done ? 1 : clamp((pct - i * 25) / 25, 0, 1)}
                  active={!done && i === segment}
                  height={tileHeight}
                />
              );
            })}
          </View>
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

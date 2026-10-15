import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { PoseChips } from '@/features/progress-check/components/pose-chips';
import {
  type ProgressCheck,
  useProgressCheckPhotos,
  useProgressChecks,
} from '@/features/progress-check/data/progress-checks';
import {
  progressCheckUnlockDate,
  isProgressCheckAge,
} from '@/features/progress-check/lib/eligibility';
import type { Pose } from '@/features/progress-check/lib/poses';
import { startProgressCheck } from '@/features/progress-check/stores/progress-check-store';
import { type Profile, useProfile } from '@/shared/data/profile';
import { cn } from '@/shared/lib/cn';
import { formatLongDate, formatShortDate } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { CameraAccessSheet, useCameraAccess } from '@/shared/ui/camera/camera-access-sheet';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

import { comparedPair } from '../lib/comparison';
import { useCompareStore } from '../stores/compare-store';
import { BodyPhotoCard, CompareArrow, NextCheckCard } from './body-photo-card';
import { CheckHistoryRow } from './check-history-row';

function openCamera() {
  startProgressCheck();
  router.push('/progress-check/camera');
}

const openCheck = (id: string) => router.push(`/progress-check/result/${id}`);
const openCompare = (side: 'a' | 'b') =>
  router.push({ pathname: '/body-compare', params: { side } });

// Faint stripes over a locked card as one path, each bottom-left to top-right, 13pt apart along
// the edges (about 9pt across), enough to cover the card; the card clips them to its corners.
const HATCH = Array.from({ length: 16 }, (_, k) => `M${(k + 1) * 13} 0L0 ${(k + 1) * 13}`).join('');

interface PlaceholderCardProps {
  letter: 'A' | 'B';
  /** Neon outline and badge: the check that comes first. */
  lit: boolean;
  /** Hatched, with a padlock instead of the question mark (under 18). */
  locked?: boolean;
  tilt: number;
}

/** An empty photo card of the comparison, tilted, with a question mark or a padlock. */
function PlaceholderCard({ letter, lit, locked, tilt }: PlaceholderCardProps) {
  return (
    <View
      className={cn(
        'h-30 w-23 items-center justify-center rounded-[18px] bg-surface',
        lit ? 'border-2 border-accent' : 'border border-line',
        locked && 'overflow-hidden',
      )}
      style={{ transform: [{ rotate: `${tilt}deg` }] }}
    >
      {locked ? (
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Path d={HATCH} stroke={colors.fg} strokeOpacity={0.05} strokeWidth={1.5} />
        </Svg>
      ) : null}
      <View
        className={cn(
          'absolute top-2 left-2 size-6 items-center justify-center rounded-full',
          lit ? 'bg-accent' : 'bg-control',
        )}
      >
        <Text variant="caption" tone={lit ? 'onAccent' : 'subtle'} className="text-xs">
          {letter}
        </Text>
      </View>
      {locked ? (
        <Icon name="lock" size={26} color={colors.track} />
      ) : (
        <Text
          className={cn(
            'font-inter-semibold text-[34px] leading-10',
            lit ? 'text-dim' : 'text-track',
          )}
        >
          ?
        </Text>
      )}
    </View>
  );
}

/**
 * The gap between the two placeholder cards, with what sits in it centred and drawn over the
 * cards' edges where it is wider. A column of the row rather than an absolute overlay: the row
 * is only as wide as its cards, and percentages of that size don't centre reliably on device.
 */
function CardGap({ className, children }: { className: string; children: ReactNode }) {
  return <View className={cn('z-10 items-center', className)}>{children}</View>;
}

interface NoChecksProps {
  /** Old enough for progress checks; under-18s get a locked state instead. */
  allowed: boolean;
  /** Says on which day the lock lifts; unknown leaves that out. */
  birthDate: Profile['birthDate'] | undefined;
  onStart: () => void;
}

/** Empty state before the first check: two blank cards to compare later. */
function NoChecks({ allowed, birthDate, onStart }: NoChecksProps) {
  const { t } = useTranslation('body');
  if (!allowed) {
    return (
      <View className="flex-1 items-center justify-center px-8 pt-6 pb-12">
        {/* Both cards dim and locked, the "18+" seal in the gap over both of their edges. */}
        <View
          className="flex-row items-center"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <PlaceholderCard letter="A" lit={false} locked tilt={-7} />
          <CardGap className="w-8">
            <View
              className="size-14.5 items-center justify-center rounded-full border-[3px] border-bg bg-accent"
              style={{ transform: [{ rotate: '-8deg' }] }}
            >
              <Text tone="onAccent" className="font-inter-bold text-xl">
                18+
              </Text>
            </View>
          </CardGap>
          <PlaceholderCard letter="B" lit={false} locked tilt={7} />
        </View>
        <Text variant="headline" className="mt-9 text-center">
          {t('adultsOnly.title')}
        </Text>
        <Text variant="paragraph" tone="subtle" className="mt-2 text-center">
          {t('adultsOnly.body')}
          {birthDate
            ? ` ${t('adultsOnly.unlocksOn', { date: formatLongDate(progressCheckUnlockDate(birthDate)) })}`
            : null}
        </Text>
      </View>
    );
  }
  return (
    <View className="flex-1 items-center justify-center px-8 pt-6 pb-12">
      <View
        className="flex-row items-center"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <PlaceholderCard letter="A" lit={false} tilt={-7} />
        <CardGap className="w-14">
          <CompareArrow inline muted />
        </CardGap>
        <PlaceholderCard letter="B" lit={false} tilt={7} />
      </View>
      <Text variant="headline" className="mt-9 text-center">
        {t('empty.title')}
      </Text>
      <Text variant="paragraph" tone="subtle" className="mt-2 text-center">
        {t('empty.body')}
      </Text>
      <Button label={t('start')} className="mt-6 h-12 px-7" onPress={onStart} />
    </View>
  );
}

/** Progress tab, "Körper": the body score, before/after photos and the check history. */
export function BodyView() {
  const { t } = useTranslation(['body', 'progressCheck']);
  const camera = useCameraAccess(openCamera);
  const { profile } = useProfile();
  const { data: checks = [] } = useProgressChecks();
  const { data: photos = {} } = useProgressCheckPhotos();
  const [pose, setPose] = useState<Pose>('front');
  const allowed = isProgressCheckAge(profile?.birthDate);

  const saved = useCompareStore();
  const first = checks[0];
  const latest = checks[checks.length - 1];
  // With two checks or more, two are compared side by side: first and latest, or the user's pick.
  const pair = comparedPair(checks, saved);
  const compared = !!pair;
  const labelOf = (check: ProgressCheck) =>
    t('checkLabel', { n: checks.indexOf(check) + 1, date: formatShortDate(check.createdAt) });
  const delta = latest && first ? latest.score - first.score : 0;
  const nextTitle = t('check', { n: checks.length + 1 });

  return (
    // A check starts from the next check's card or row whenever the user wants; the first from
    // the empty state. Under-18s get no new checks.
    <>
      {/* Only over a score: the empty and the locked state explain themselves. */}
      {latest ? (
        <Text variant="paragraph" tone="subtle" className="px-5 pt-4">
          {t('subtitle')}
        </Text>
      ) : null}

      {!latest ? (
        <NoChecks allowed={allowed} birthDate={profile?.birthDate} onStart={camera.request} />
      ) : (
        <>
          <View className="flex-row items-end justify-between gap-3 px-5 pt-5.5">
            <View className="flex-row items-baseline gap-1">
              <Text className="font-inter-semibold text-[80px] leading-20 tracking-[-3px]">
                {latest.score}
              </Text>
              <Text variant="label" className="text-lg text-dim">
                /100
              </Text>
            </View>
            {compared ? (
              <View className="mb-1 rounded-full bg-accent px-2.75 py-1.5">
                <Text variant="caption" tone="onAccent">
                  {t('sinceStart', { delta: `${delta >= 0 ? '+' : '−'}${Math.abs(delta)}` })}
                </Text>
              </View>
            ) : (
              <View className="mb-1 rounded-full bg-elevated px-2.75 py-1.5">
                <Text variant="caption">{t('baseline')}</Text>
              </View>
            )}
          </View>

          {/* No padding on the row itself: the arrow is centred on its width. */}
          <View className="px-4 pt-6">
            <View className="flex-row gap-2.5">
              {pair ? (
                <>
                  <BodyPhotoCard
                    checkId={pair.before.id}
                    pose={pose}
                    storagePath={photos[pair.before.id]?.[pose]}
                    label={labelOf(pair.before)}
                    score={pair.before.score}
                    muted
                    onPress={() => openCheck(pair.before.id)}
                    onEdit={() => openCompare('a')}
                    editLabel={t('compare.edit')}
                  />
                  <BodyPhotoCard
                    checkId={pair.after.id}
                    pose={pose}
                    storagePath={photos[pair.after.id]?.[pose]}
                    label={labelOf(pair.after)}
                    score={pair.after.score}
                    after
                    selected
                    done={pair.after.id === latest.id}
                    onPress={() => openCheck(pair.after.id)}
                    onEdit={() => openCompare('b')}
                    editLabel={t('compare.edit')}
                  />
                </>
              ) : (
                <BodyPhotoCard
                  checkId={latest.id}
                  pose={pose}
                  storagePath={photos[latest.id]?.[pose]}
                  label={labelOf(latest)}
                  score={latest.score}
                  after
                  selected
                  done
                  onPress={() => openCheck(latest.id)}
                />
              )}
              {compared ? <CompareArrow /> : null}
              {!compared && allowed ? (
                <NextCheckCard title={nextTitle} note={t('startNow')} onPress={camera.request} />
              ) : null}
            </View>
          </View>

          <PoseChips pose={pose} onChange={setPose} className="px-4 pt-3.5" />

          <Text variant="overline" tone="subtle" className="px-5 pt-7 text-xs">
            {t('history')}
          </Text>
          <View className="px-5 pt-1">
            {/* The next check is listed first and starts it. */}
            {allowed ? (
              <CheckHistoryRow
                title={nextTitle}
                onPress={camera.request}
                trailing={
                  <View className="h-6.5 justify-center rounded-full border-[1.5px] border-accent px-2.5">
                    <Text variant="caption" tone="accent" className="text-xs">
                      {t('startShort')}
                    </Text>
                  </View>
                }
              />
            ) : null}
            {checks
              .map((check, i) => (
                <CheckHistoryRow
                  key={check.id}
                  title={t('check', { n: i + 1 })}
                  date={formatShortDate(check.createdAt)}
                  score={check.score}
                  latest={check === latest}
                  onPress={() => openCheck(check.id)}
                />
              ))
              .reverse()}
          </View>
        </>
      )}
      <CameraAccessSheet {...camera.sheet} body={t('progressCheck:camera.access')} />
    </>
  );
}

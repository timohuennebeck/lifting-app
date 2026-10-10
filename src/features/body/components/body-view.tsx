import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useBodyCheckPhotos } from '@/features/body-check/data/body-checks';
import { POSES, type BodyPose } from '@/features/body-check/lib/poses';
import { startBodyCheck } from '@/features/body-check/stores/body-check-store';
import { saveProfile, useProfile } from '@/shared/data/profile';
import { formatShortDate } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { CameraAccessSheet, useCameraAccess } from '@/shared/ui/camera/camera-access-sheet';
import { Card } from '@/shared/ui/card';
import { Chip } from '@/shared/ui/chip';
import { Icon } from '@/shared/ui/icon';
import { afterSheetClose } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

import { useNextCheck } from '../hooks/use-next-check';
import { BodyPhotoCard, NextCheckCard } from './body-photo-card';
import { CheckHistoryRow } from './check-history-row';
import { CheckRhythmSheet } from './check-rhythm-sheet';

function openCamera() {
  startBodyCheck();
  router.push('/body-check/camera');
}

const openCheck = (id: string) => router.push(`/body-check/result/${id}`);

/** Progress tab, "Körper": the body score, before/after photos and the check history. */
export function BodyView() {
  const { t } = useTranslation(['body', 'bodyCheck']);
  const camera = useCameraAccess(openCamera);
  const { profile } = useProfile();
  const { checks, allowed, interval, dueAt, due, earliestAt, canStart, daysLeft } = useNextCheck();
  const { data: photos = {} } = useBodyCheckPhotos();
  const [pose, setPose] = useState<BodyPose>('front');
  const [rhythmOpen, setRhythmOpen] = useState(false);
  // A due check starts right away; before that, the next check opens the rhythm sheet.
  const openNext = due ? camera.request : () => setRhythmOpen(true);

  const first = checks[0];
  const latest = checks[checks.length - 1];
  const delta = latest && first ? latest.score - first.score : 0;
  const nextTitle = t('check', { n: checks.length + 1 });

  return (
    // A check starts from the next check's card or row once it is due (earlier from the rhythm
    // sheet they open); the first from the empty state. Under-18s get no new checks.
    <>
      <Text variant="paragraph" tone="subtle" className="px-5 pt-4">
        {t('subtitle')}
      </Text>

      {!latest ? (
        <Card className="mx-4 mt-6 items-center gap-4 py-8">
          <View className="size-16 items-center justify-center rounded-full bg-elevated">
            <Icon name="camera" size={26} color={allowed ? colors.accent : colors.subtle} />
          </View>
          <Text variant="headline" className="text-center">
            {t(allowed ? 'empty.title' : 'adultsOnly.title')}
          </Text>
          <Text variant="paragraph" tone="muted" className="text-center">
            {t(allowed ? 'empty.body' : 'adultsOnly.body')}
          </Text>
          {allowed ? (
            <Button label={t('start')} size="md" className="mt-1 px-6" onPress={camera.request} />
          ) : null}
        </Card>
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
            {checks.length > 1 ? (
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
              {checks.length > 1 ? (
                <BodyPhotoCard
                  checkId={first.id}
                  pose={pose}
                  storagePath={photos[first.id]?.[pose]?.storagePath}
                  label={t('checkLabel', { n: 1, date: formatShortDate(first.createdAt) })}
                  score={first.score}
                />
              ) : null}
              <BodyPhotoCard
                checkId={latest.id}
                pose={pose}
                storagePath={photos[latest.id]?.[pose]?.storagePath}
                label={t('checkLabel', {
                  n: checks.length,
                  date: formatShortDate(latest.createdAt),
                })}
                score={latest.score}
                latest
              />
              {checks.length > 1 ? (
                <View
                  pointerEvents="none"
                  className="absolute top-1/2 left-1/2 -mt-5 -ml-5 size-10 items-center justify-center rounded-full bg-accent"
                >
                  <Icon name="arrow-right" size={16} color={colors.onAccent} />
                </View>
              ) : allowed ? (
                <NextCheckCard
                  title={nextTitle}
                  note={due ? t('dueNow') : t('dueOn', { date: formatShortDate(dueAt) })}
                  onPress={openNext}
                />
              ) : null}
            </View>
          </View>

          <View className="flex-row justify-center gap-1.5 px-4 pt-3.5">
            {POSES.map((p) => (
              <Chip
                key={p}
                label={t(`bodyCheck:poses.${p}.short`)}
                selected={p === pose}
                onPress={() => setPose(p)}
                className="h-7.5 px-2.75"
              />
            ))}
          </View>

          <Text variant="overline" tone="subtle" className="px-5 pt-7 text-xs">
            {t('history')}
          </Text>
          <View className="px-5 pt-1">
            {/* The next check is always listed first, so its date is never a surprise. */}
            {allowed ? (
              <CheckHistoryRow
                title={nextTitle}
                date={due ? t('today') : formatShortDate(dueAt)}
                onPress={openNext}
                trailing={
                  due ? (
                    <View className="h-6.5 justify-center rounded-full border-[1.5px] border-accent px-2.5">
                      <Text variant="caption" tone="accent" className="text-xs">
                        {t('due')}
                      </Text>
                    </View>
                  ) : (
                    <View className="h-8 justify-center rounded-full bg-elevated px-3">
                      <Text variant="caption" className="text-xs">
                        {t('inDays', { count: daysLeft })}
                      </Text>
                    </View>
                  )
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
      <CheckRhythmSheet
        visible={rhythmOpen}
        onClose={() => setRhythmOpen(false)}
        interval={interval}
        onIntervalChange={(days) => {
          if (!profile) return;
          void saveProfile(profile.id, { bodyCheckIntervalDays: days }).catch((error) => {
            console.warn('Saving the check rhythm failed', error);
            haptics.error();
          });
        }}
        dueAt={dueAt}
        earliestAt={earliestAt}
        canStart={canStart}
        onStart={() => {
          setRhythmOpen(false);
          afterSheetClose(camera.request);
        }}
      />
      <CameraAccessSheet {...camera.sheet} body={t('bodyCheck:camera.access')} />
    </>
  );
}

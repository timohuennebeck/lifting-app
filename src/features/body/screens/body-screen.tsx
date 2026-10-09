import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useBodyCheckPhotos, useBodyChecks } from '@/features/body-check/data/body-checks';
import { POSES, type BodyPose } from '@/features/body-check/lib/poses';
import { startBodyCheck } from '@/features/body-check/stores/body-check-store';
import { TabScreen } from '@/shared/components/tab-screen';
import { DAY_MS } from '@/shared/lib/date';
import { formatShortDate } from '@/shared/lib/format';
import { colors, useAccentColor } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Chip } from '@/shared/ui/chip';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

import { BodyPhotoCard } from '../components/body-photo-card';
import { CheckHistoryRow } from '../components/check-history-row';

/** A new check is due this many days after the last one. */
const CHECK_INTERVAL_DAYS = 21;

function openCamera() {
  startBodyCheck();
  router.push('/body-check/camera');
}

const openCheck = (id: string) => router.push(`/body-check/result/${id}`);

export function BodyScreen() {
  const { t } = useTranslation('body');
  const accent = useAccentColor();
  const { data: checks = [] } = useBodyChecks();
  const { data: photos = {} } = useBodyCheckPhotos();
  const [pose, setPose] = useState<BodyPose>('front');

  const first = checks[0];
  const latest = checks[checks.length - 1];
  const due =
    latest && new Date().getTime() - Date.parse(latest.createdAt) >= CHECK_INTERVAL_DAYS * DAY_MS;
  const delta = latest && first ? latest.score - first.score : 0;

  return (
    <TabScreen footer={<Button label={t('start')} onPress={openCamera} />}>
      <View className="gap-2 px-5 pt-4">
        <Text variant="headline" className="text-[30px] leading-7.5">
          {t('title')}
        </Text>
        <Text variant="paragraph" tone="subtle">
          {t('subtitle')}
        </Text>
      </View>

      {!latest ? (
        <Card className="mx-4 mt-6 items-center gap-4 py-8">
          <View className="size-16 items-center justify-center rounded-full bg-elevated">
            <Icon name="camera" size={26} color={accent} />
          </View>
          <Text variant="headline" className="text-center">
            {t('empty.title')}
          </Text>
          <Text variant="paragraph" tone="muted" className="text-center">
            {t('empty.body')}
          </Text>
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
            ) : null}
          </View>

          <View className="flex-row gap-2.5 px-4 pt-6">
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
              label={t('checkLabel', { n: checks.length, date: formatShortDate(latest.createdAt) })}
              score={latest.score}
              latest
            />
            {checks.length > 1 ? (
              <View
                pointerEvents="none"
                className="absolute top-32.25 left-1/2 -ml-5 size-10 items-center justify-center rounded-full bg-accent"
              >
                <Icon name="arrow-right" size={16} color={colors.onAccent} />
              </View>
            ) : null}
          </View>

          <View className="flex-row justify-center gap-1.5 px-4 pt-3.5">
            {POSES.map((p) => (
              <Chip
                key={p}
                label={t(`poses.${p}`)}
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
            {due ? (
              <CheckHistoryRow
                title={t('check', { n: checks.length + 1 })}
                date={t('today')}
                onPress={openCamera}
                trailing={
                  <View className="h-6.5 justify-center rounded-full border-[1.5px] border-accent px-2.5">
                    <Text variant="caption" tone="accent" className="text-xs">
                      {t('due')}
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
    </TabScreen>
  );
}

import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { StepTitle } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';

import { PoseStrip } from '../components/pose-strip';
import { POSES, WARN_COLOR, type BodyPose } from '../lib/poses';
import { useBodyCheckStore } from '../stores/body-check-store';

const STAGE_MAX = 400;
/** Space under the photo for the pills, as in the design (400 − 22 − 304). */
const STAGE_CHROME = 96;
const PHOTO_MAX_HEIGHT = 304;

/** Back to the camera, which then shoots `pose`. */
function shoot(pose: BodyPose, replace: boolean) {
  const store = useBodyCheckStore.getState();
  if (replace) store.retake(pose);
  else store.setPose(pose);
  router.back();
}

/**
 * 08b: check each pose's photo, retake weak or missing ones (or those the analysis rejected),
 * then start the analysis.
 */
export function ReviewScreen() {
  const { t } = useTranslation(['bodyCheck', 'common']);
  const insets = useSafeAreaInsets();
  const footerInset = useFooterInset();
  const [stageHeight, setStageHeight] = useState(STAGE_MAX);
  const checkId = useBodyCheckStore((s) => s.checkId);
  const shots = useBodyCheckStore((s) => s.shots);
  const reviewPose = useBodyCheckStore((s) => s.reviewPose);
  if (!checkId) return <Redirect href="/body-check/camera" />;

  const missing = POSES.find((p) => !shots[p]);
  const weak = POSES.find((p) => shots[p]?.issue);
  // Photos the analysis rejected can't be skipped: it would only reject them again.
  const rejected = POSES.some((p) => shots[p]?.rejected);
  const selected = reviewPose ?? missing ?? weak ?? POSES[0];
  const shot = shots[selected];
  const taken = POSES.filter((p) => shots[p]).length;
  const photoHeight = Math.min(PHOTO_MAX_HEIGHT, Math.max(120, stageHeight - STAGE_CHROME));
  const analyze = () => router.push('/body-check/analysis');

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-3.5 py-1.5 pr-5 pl-4">
        <IconButton
          icon="chevron-left"
          iconSize={7}
          accessibilityLabel={t('common:actions.back')}
          onPress={() => router.back()}
        />
        <View className="flex-1 flex-row gap-1">
          {POSES.map((p) => (
            <View
              key={p}
              className={cn('h-1 flex-1 rounded-sm', shots[p] ? 'bg-accent' : 'bg-control')}
              style={shots[p]?.issue ? { backgroundColor: WARN_COLOR } : undefined}
            />
          ))}
        </View>
        <Text variant="caption" tone="subtle">
          {t('common:progress.stepOf', { current: taken, total: POSES.length })}
        </Text>
      </View>
      <StepTitle
        title={t('review.title')}
        subtitle={t(rejected ? 'review.rejectedSubtitle' : 'review.subtitle')}
        className="pt-3.5"
      />

      <View
        className="mx-4 mt-5.5 flex-1 overflow-hidden rounded-[28px] bg-surface"
        style={{ maxHeight: STAGE_MAX, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}
        onLayout={(e) => setStageHeight(e.nativeEvent.layout.height)}
      >
        <View
          className="mt-5.5 self-center overflow-hidden rounded-[10px] bg-raised"
          style={{
            height: photoHeight,
            width: photoHeight * 0.75,
            boxShadow: '0 24px 50px rgba(0,0,0,0.5)',
          }}
        >
          {shot ? (
            <Image
              source={{ uri: shot.uri }}
              contentFit="cover"
              accessibilityLabel={t(`poses.${selected}.name`)}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text variant="caption" tone="subtle" className="font-inter">
                {t('review.noPhoto')}
              </Text>
            </View>
          )}
          <View
            pointerEvents="none"
            className="absolute inset-0 rounded-[10px]"
            style={
              shot?.issue
                ? { borderWidth: 2, borderColor: WARN_COLOR }
                : { borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }
            }
          />
        </View>
        {shot?.issue ? (
          <View
            className="absolute top-3.5 left-3.5 h-8 flex-row items-center gap-1.5 rounded-full pr-3 pl-1.75"
            style={{ backgroundColor: WARN_COLOR }}
          >
            <View className="size-4.5 items-center justify-center rounded-full bg-bg">
              <Text className="font-inter-bold text-xs" style={{ color: WARN_COLOR }}>
                !
              </Text>
            </View>
            <Text variant="caption" tone="onAccent" className="text-xs">
              {t(`review.issues.${shot.issue}`)}
            </Text>
          </View>
        ) : null}
        <View className="absolute bottom-3.5 left-3.5 h-9.5 justify-center rounded-full bg-elevated px-3.5">
          <Text variant="caption">{t(`poses.${selected}.name`)}</Text>
        </View>
        <PressableScale
          haptic="select"
          onPress={() => shoot(selected, !!shot)}
          className="absolute right-3.5 bottom-3.5 h-9.5 flex-row items-center gap-1.5 rounded-full bg-elevated px-3.5"
        >
          <Icon name={shot ? 'refresh' : 'camera'} size={14} />
          <Text variant="caption">{t(shot ? 'review.retakePhoto' : 'review.takePhoto')}</Text>
        </PressableScale>
      </View>

      <View className="pt-4.5">
        <PoseStrip
          shots={shots}
          active={selected}
          onSelect={(p) => useBodyCheckStore.getState().selectReviewPose(p)}
        />
      </View>

      <View className="mt-auto gap-1 px-4 pt-6" style={{ paddingBottom: footerInset }}>
        {missing ? (
          <Button label={t(`review.take.${missing}`)} onPress={() => shoot(missing, false)} />
        ) : weak ? (
          <>
            <Button label={t(`review.retake.${weak}`)} onPress={() => shoot(weak, true)} />
            {rejected ? null : (
              <TextButton
                label={t('review.continueAnyway')}
                tone="secondary"
                className="min-h-11"
                onPress={analyze}
              />
            )}
          </>
        ) : (
          <Button label={t('review.cta')} onPress={analyze} />
        )}
      </View>
    </View>
  );
}

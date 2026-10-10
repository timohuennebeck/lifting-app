import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, Share, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProfile } from '@/shared/data/profile';
import { formatDate } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';
import { useUserId } from '@/shared/stores/session-store';
import { BottomFade } from '@/shared/ui/bottom-fade';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { CheckPhoto } from '../components/check-photo';
import { DeleteCheckSheet } from '../components/delete-check-sheet';
import { GroupBands } from '../components/group-bands';
import { MetricRow } from '../components/metric-row';
import { deleteBodyCheck, saveBodyCheck } from '../data/body-check-mutations';
import { useBodyCheckPhotos, useBodyChecks } from '../data/body-checks';
import { useCloseCheck } from '../hooks/use-close-check';
import { bodyFatRange, bodyFatShare, bodyFatTier, scoreTier } from '../lib/metrics';
import { exitBodyCheck } from '../lib/navigation';
import { POSES, type BodyPose } from '../lib/poses';
import { type Shot, useBodyCheckStore } from '../stores/body-check-store';

/** How long "Saved" shows before the flow closes. */
const SAVED_PAUSE_MS = 700;

/** Leaves the flow after a save and forgets the draft (its photos are kept). */
function leaveSaved() {
  exitBodyCheck();
  useBodyCheckStore.getState().clear();
}

/** 08d-A: score, photo basis, metrics and muscle groups of a check; saves a fresh one. */
export function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation(['bodyCheck', 'common']);
  const insets = useSafeAreaInsets();
  const userId = useUserId();
  const { profile } = useProfile();
  const { data: checks } = useBodyChecks();
  const { data: photos } = useBodyCheckPhotos();
  const draftId = useBodyCheckStore((s) => s.checkId);
  const draftResult = useBodyCheckStore((s) => s.result);
  const shots = useBodyCheckStore((s) => s.shots);
  const closeDraft = useCloseCheck();
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // After saving: a short "Gespeichert" pause, then leave. Closing earlier does the same.
  useEffect(() => {
    if (!justSaved) return;
    const timer = setTimeout(leaveSaved, SAVED_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [justSaved]);

  const index = checks?.findIndex((c) => c.id === id) ?? -1;
  const saved = checks && index >= 0 ? checks[index] : null;
  const draft = !saved && draftId === id ? draftResult : null;
  const check = saved ?? (draft && { ...draft, createdAt: new Date().toISOString() });

  if (!checks || !check) {
    return (
      <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
        <View className="px-4 py-1.5">
          <IconButton
            icon="chevron-left"
            iconSize={7}
            accessibilityLabel={t('common:actions.close')}
            onPress={exitBodyCheck}
          />
        </View>
        {checks ? (
          <Text variant="paragraph" tone="subtle" className="px-5 pt-6">
            {t('result.notFound')}
          </Text>
        ) : null}
      </View>
    );
  }

  const number = saved ? index + 1 : checks.length + 1;
  const first = number === 1;
  const showCta = !!draft || justSaved;
  const { bodyFat, proportions, definition } = check.metrics;
  const fatRange = bodyFatRange(profile?.sex);
  const date = formatDate(new Date(check.createdAt), { day: 'numeric', month: 'long' });

  async function remove() {
    if (!saved || !userId) return;
    setMenuOpen(false);
    exitBodyCheck();
    try {
      await deleteBodyCheck(saved.id, userId);
      haptics.success();
    } catch (error) {
      console.warn('Deleting the body check failed', error);
      haptics.error();
    }
  }

  async function save() {
    const complete = POSES.every((p) => shots[p]);
    if (!draft || !userId || !complete || saving) return;
    setSaving(true);
    try {
      await saveBodyCheck({
        checkId: id,
        userId,
        result: draft,
        photos: shots as Record<BodyPose, Shot>,
      });
      haptics.success();
      setJustSaved(true);
    } catch (error) {
      console.warn('Saving the body check failed', error);
      haptics.error();
      Alert.alert(t('common:errors.generic'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-1.5">
        <IconButton
          icon="chevron-left"
          iconSize={7}
          accessibilityLabel={t('common:actions.close')}
          onPress={justSaved ? leaveSaved : draft ? closeDraft : exitBodyCheck}
        />
        <View className="flex-row items-center gap-2">
          <PressableScale
            haptic="tap"
            onPress={() =>
              Share.share({ message: t('result.shareMessage', { score: check.score }) })
            }
            className="h-10.5 justify-center rounded-full bg-elevated px-4"
          >
            <Text variant="label" className="text-sm">
              {t('result.share')}
            </Text>
          </PressableScale>
          {saved ? (
            <IconButton
              icon="more"
              iconSize={18}
              accessibilityLabel={t('result.more')}
              onPress={() => setMenuOpen(true)}
            />
          ) : null}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pt-2.5"
        contentContainerStyle={{ paddingBottom: showCta ? 120 : insets.bottom + 24 }}
      >
        <View className="px-5">
          <Text variant="label" tone="muted">
            {t(first ? 'result.baselineOn' : 'result.scoreOn', { date })}
          </Text>
          <View className="mt-5.5 flex-row items-end gap-3.5">
            <View className="flex-row items-baseline gap-1">
              {/* A line height under the font size clips the digits on iOS; the negative
                  margins keep the number where the tighter line put it. */}
              <Text className="-my-3.5 pr-1 font-inter-semibold text-[112px] leading-[128px] tracking-[-4px] text-fg">
                {check.score}
              </Text>
              <Text variant="label" className="text-xl text-dim">
                /100
              </Text>
            </View>
            <View className="mb-1.5 rounded-full bg-accent px-2.75 py-1.5">
              <Text variant="caption" tone="onAccent">
                {t('result.check', { n: number })}
              </Text>
            </View>
          </View>
        </View>

        <View className="gap-3 px-5 pt-6.5 pb-2">
          <Text variant="overline" tone="subtle" className="text-xs tracking-[1px]">
            {t('result.basis')}
          </Text>
          <View className="flex-row gap-2">
            {POSES.map((pose) => (
              <View key={pose} className="flex-1 gap-1.5">
                <View className="aspect-3/4 overflow-hidden rounded-xl border border-white/10 bg-surface">
                  <CheckPhoto
                    key={saved ? 'saved' : 'draft'}
                    checkId={id}
                    pose={pose}
                    uri={saved ? undefined : shots[pose]?.uri}
                    storagePath={photos?.[id]?.[pose]?.storagePath}
                    accessibilityLabel={t(`poses.${pose}.name`)}
                  />
                </View>
                <Text variant="caption" tone="muted" className="text-center text-xs">
                  {t(`poses.${pose}.short`)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="px-5 pt-2.5">
          {bodyFat !== undefined ? (
            <MetricRow
              label={t('result.metrics.bodyFat')}
              note={t(`result.bodyFat.${bodyFatTier(bodyFatShare(bodyFat, profile?.sex))}`)}
              value={`~${Math.round(bodyFat)}`}
              unit=" %"
              position={bodyFatShare(bodyFat, profile?.sex)}
              min={`${fatRange.min} %`}
              max={`${fatRange.max} %`}
            />
          ) : null}
          {(
            [
              ['proportions', proportions],
              ['definition', definition],
            ] as const
          ).map(([key, value]) =>
            value !== undefined ? (
              <MetricRow
                key={key}
                label={t(`result.metrics.${key}`)}
                note={t(`result.tiers.${scoreTier(value)}`)}
                value={String(value)}
                position={value / 100}
                min="0"
                max="100"
              />
            ) : null,
          )}
        </View>

        <Text variant="overline" tone="subtle" className="px-5 pt-7 pb-1 text-xs tracking-[1px]">
          {t('result.groups')}
        </Text>
        <GroupBands scores={check.groupScores} />

        <Text variant="caption" className="px-5 pt-4 font-inter text-xs text-dim">
          {t('result.disclaimer')}
        </Text>
      </ScrollView>

      {showCta ? (
        <BottomFade>
          <Button
            label={
              justSaved ? t('result.saved') : t(first ? 'result.saveBaseline' : 'result.saveResult')
            }
            variant={justSaved ? 'secondary' : 'primary'}
            icon={justSaved ? 'check' : undefined}
            loading={saving}
            onPress={justSaved ? undefined : save}
          />
        </BottomFade>
      ) : null}
      <DeleteCheckSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={t('result.check', { n: number })}
        subtitle={date}
        onDelete={remove}
      />
    </View>
  );
}

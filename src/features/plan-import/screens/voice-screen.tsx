import { router, Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useNow } from '@/shared/hooks/use-now';
import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { clamp } from '@/shared/lib/math';
import { colors, useAccentColor } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { StepHeader } from '@/shared/ui/step-header';
import { Text } from '@/shared/ui/text';

import { IMPORT_STEPS } from '../lib/format';
import { parseTranscript, type TokenKind, VOICE_SCRIPTS } from '../lib/voice-scripts';
import { useImportStore } from '../stores/import-store';

const WORD_MS = 260;
const LEAD_MS = 500;
const SETTLE_MS = 400;
const HANDOFF_MS = 700;

/** 06b-3: voice input. MOCK: the mic plays a scripted utterance instead of real recognition. */
export function VoiceScreen() {
  const { t } = useTranslation(['planImport', 'common']);
  const accent = useAccentColor();
  const take = useImportStore((s) => s.voiceTake);
  const scripts = t('planImport:voice.scripts', { returnObjects: true });
  const words = parseTranscript(scripts[take % VOICE_SCRIPTS.length] ?? '');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const now = useNow(80, startedAt !== null);
  const handedOff = useRef(false);

  const elapsed = startedAt === null ? 0 : now - startedAt;
  const shown =
    startedAt === null ? 0 : clamp(Math.floor((elapsed - LEAD_MS) / WORD_MS) + 1, 0, words.length);
  const recognized = startedAt !== null && elapsed >= LEAD_MS + words.length * WORD_MS + SETTLE_MS;
  const tick = Math.floor(now / 250);

  useEffect(() => {
    if (!recognized || handedOff.current) return;
    handedOff.current = true;
    haptics.success();
    const id = setTimeout(() => router.replace('/import/recognizing'), HANDOFF_MS);
    return () => clearTimeout(id);
  }, [recognized]);

  function toggle() {
    if (startedAt === null) {
      haptics.press();
      handedOff.current = false;
      setStartedAt(Date.now());
    } else if (!recognized) {
      haptics.tap();
      setStartedAt(null);
    }
  }

  const color = (kind: TokenKind) => {
    if (!recognized) return colors.fgMid;
    return {
      day: accent,
      number: accent,
      exercise: colors.fg,
      remove: colors.danger,
      filler: colors.dim,
    }[kind];
  };
  const bar = (j: number) =>
    recognized ? 6 : 8 + Math.round(Math.abs(Math.sin(tick * 1.7 + j * 2.3)) * (shown ? 30 : 10));
  const bars = (from: number) => (
    <View className="h-12 flex-row items-center gap-[5px]">
      {[0, 1, 2, 3].map((j) => (
        <Animated.View
          key={j}
          className="w-1 rounded-sm bg-accent"
          style={{ height: bar(from + j), transitionProperty: 'height', transitionDuration: 250 }}
        />
      ))}
    </View>
  );

  return (
    <Screen header={<StepHeader step={IMPORT_STEPS} total={IMPORT_STEPS} hideBack />}>
      <Stack.Screen options={{ animation: 'fade_from_bottom' }} />
      <ScreenHeader
        icon="close"
        iconSize={11}
        title={
          <Text variant="label" className="text-center">
            {t('planImport:voice.title')}
          </Text>
        }
      />
      <View className="px-6 pt-[22px]">
        <Text variant="overline" tone="subtle" className="text-xs tracking-[1px]">
          {t('planImport:voice.format')}
        </Text>
        <View
          className="mt-4 flex-row flex-wrap gap-x-[9px] gap-y-0.5"
          accessibilityLiveRegion="polite"
        >
          {shown ? (
            words.slice(0, shown).map((w, i) => (
              <Text
                key={i}
                className="font-inter-semibold text-[30px] leading-9"
                style={{ color: color(w.kind) }}
              >
                {w.word}
              </Text>
            ))
          ) : (
            <Text className="font-inter-semibold text-[30px] leading-9 text-[#4A4A48]">
              {t('planImport:voice.example')}
            </Text>
          )}
        </View>
      </View>
      <View className="flex-1" />
      <View className="items-center gap-[18px] px-5 pb-14">
        <View className="flex-row items-center gap-[22px]">
          {startedAt !== null ? bars(0) : null}
          <PressableScale
            haptic="none"
            activeScale={0.95}
            accessibilityLabel={
              startedAt === null ? t('planImport:voice.tap') : t('planImport:voice.stop')
            }
            onPress={toggle}
            className={cn(
              'size-24 items-center justify-center rounded-full',
              startedAt === null ? 'bg-elevated' : 'bg-accent',
            )}
          >
            <Icon name="mic" size={24} color={startedAt === null ? colors.fg : colors.onAccent} />
          </PressableScale>
          {startedAt !== null ? bars(4) : null}
        </View>
        <Text variant="label" tone="muted" className="font-inter-medium">
          {startedAt === null
            ? t('planImport:voice.tap')
            : recognized
              ? t('planImport:voice.understood')
              : t('planImport:voice.listening')}
        </Text>
      </View>
    </Screen>
  );
}

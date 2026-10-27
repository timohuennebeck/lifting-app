import {
  Button,
  Capsule,
  Circle,
  HStack,
  ProgressView,
  Image,
  RoundedRectangle,
  Spacer,
  Text,
  VStack,
  ZStack,
} from '@expo/ui/swift-ui';
import {
  accessibilityLabel,
  activityBackgroundTint,
  background,
  buttonStyle,
  font,
  foregroundStyle,
  frame,
  id,
  kerning,
  labelsHidden,
  lineLimit,
  minimumScaleFactor,
  monospacedDigit,
  multilineTextAlignment,
  offset,
  padding,
  progressViewStyle,
  scaleEffect,
  shapes,
  textCase,
  tint,
} from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity, type LiveActivityEnvironment } from 'expo-widgets';

import type { WorkoutActivityProps } from '../lib/activity-props';

/**
 * The live workout on the Lock Screen and in the Dynamic Island (designs LA·P1, LA·P2, LA·N3):
 * the rest countdown with ±10 s and skip while resting, otherwise the next set to log. Runs in
 * the widget runtime, so everything it uses is declared inside (colours mirror `theme.ts`). A
 * rest that ran out shows the next set once the activity is drawn again (it is stale then; iOS
 * doesn't promise to redraw right away). iOS gives it at most 160 pt of height (the expanded
 * island's bottom about 98), hence the sizes and trimmed line boxes.
 */
function WorkoutActivity(props: WorkoutActivityProps, environment: LiveActivityEnvironment) {
  'widget';
  const ACCENT = '#DFFF1F';
  const ON_ACCENT = '#0A0A0A';
  const FG = '#F4F4F0';
  const MUTED = '#8C8C87';
  const CONTROL = '#262626';
  const TRACK = '#2E2E2C';
  // As ACTIVITY_TARGETS.
  const TARGETS = {
    minus: 'workout-rest-minus',
    plus: 'workout-rest-plus',
    skipRest: 'workout-rest-skip',
    logSet: 'workout-log-set',
  };

  const rest = props.rest;
  const resting = rest != null && !environment.isStale && rest.to > Date.now();
  const restRange = rest ? { lower: new Date(rest.from), upper: new Date(rest.to) } : null;
  // A running timer keeps its range through updates; a new identity makes ±10 s show.
  const restKey = rest ? `${rest.from}-${rest.to}` : '';
  const next = props.next;
  const texts = props.texts;

  // The app's `timer` icon (icon.tsx, a 16×18 box): a filled dial, its button and a dark hand.
  const stopwatch = (height: number) => {
    const u = height / 18;
    return (
      <VStack spacing={u}>
        <RoundedRectangle
          cornerRadius={u}
          modifiers={[foregroundStyle(ACCENT), frame({ width: 4 * u, height: 2.5 * u })]}
        />
        <ZStack>
          <Circle modifiers={[foregroundStyle(ACCENT), frame({ width: 13 * u, height: 13 * u })]} />
          <Capsule
            modifiers={[
              foregroundStyle(ON_ACCENT),
              frame({ width: 1.8 * u, height: 5.3 * u }),
              offset({ y: -1.75 * u }),
            ]}
          />
        </ZStack>
      </VStack>
    );
  };

  // Small caps-style label; `tight` for the narrow strip beside the island's camera.
  const label = (text: string, color: string, tight: boolean) => (
    <Text
      modifiers={[
        font({ size: tight ? 11 : 12, weight: 'semibold' }),
        kerning(tight ? 0.5 : 1.2),
        textCase('uppercase'),
        foregroundStyle(color),
        lineLimit(1),
        minimumScaleFactor(0.7),
      ]}
    >
      {text}
    </Text>
  );

  // Counts up from the start (the day is just an upper bound).
  const elapsed = (width: number) => (
    <Text
      timerInterval={{
        lower: new Date(props.startedAt),
        upper: new Date(props.startedAt + 86400000),
      }}
      countsDown={false}
      modifiers={[
        font({ size: 14, weight: 'semibold' }),
        monospacedDigit(),
        foregroundStyle(FG),
        multilineTextAlignment('trailing'),
        frame({ width, alignment: 'trailing' }),
      ]}
    />
  );

  // A timer text takes all the width it gets, so it gets a fixed one, its digits placed in it.
  const countdown = (size: number, width: number, alignment: 'center' | 'trailing') =>
    restRange ? (
      <Text
        timerInterval={restRange}
        countsDown
        modifiers={[
          font({ size, weight: 'bold' }),
          monospacedDigit(),
          foregroundStyle(ACCENT),
          multilineTextAlignment(alignment),
          frame({ width, alignment }),
          id(`countdown-${restKey}`),
        ]}
      />
    ) : null;

  // The label carries the shape, so all of it takes the tap (a plain button's area is its label).
  const pill = (target: string, text: string, height: number) => (
    <Button target={target} modifiers={[buttonStyle('plain')]}>
      <Text
        modifiers={[
          font({ size: 16, weight: 'semibold' }),
          foregroundStyle(ON_ACCENT),
          lineLimit(1),
          frame({ maxWidth: Infinity }),
          frame({ height }),
          background(ACCENT, shapes.capsule()),
        ]}
      >
        {text}
      </Text>
    </Button>
  );

  // As the rest sheet's −/+ buttons: a circular arrow around "10" on a round control.
  const nudge = (
    target: string,
    symbol: 'gobackward.10' | 'goforward.10',
    text: string,
    size: number,
  ) => (
    <Button target={target} modifiers={[buttonStyle('plain'), accessibilityLabel(text)]}>
      <Image
        systemName={symbol}
        modifiers={[
          font({ size: Math.round(size * 0.46), weight: 'medium' }),
          foregroundStyle(FG),
          frame({ width: size, height: size }),
          background(CONTROL, shapes.circle()),
        ]}
      />
    </Button>
  );

  const restHeader = (
    <HStack spacing={6}>
      {stopwatch(15)}
      {label(texts.rest, ACCENT, false)}
    </HStack>
  );

  // `roomy` on the Lock Screen, which has a little more height to give than the island: there
  // the gaps are wider (about 156 pt of the 160 in all).
  const restBody = (roomy: boolean) => (
    <VStack spacing={roomy ? 10 : 5}>
      {/* As tall as the circles: the digits' line box is taller than the digits. */}
      <HStack modifiers={[frame({ height: roomy ? 42 : 44 })]}>
        {nudge(TARGETS.minus, 'gobackward.10', texts.minus, roomy ? 42 : 44)}
        <Spacer />
        {countdown(40, 130, 'center')}
        <Spacer />
        {nudge(TARGETS.plus, 'goforward.10', texts.plus, roomy ? 42 : 44)}
      </HStack>
      {restRange ? (
        <ProgressView
          timerInterval={restRange}
          countsDown
          modifiers={[
            progressViewStyle('linear'),
            labelsHidden(),
            tint(ACCENT),
            scaleEffect({ x: 1, y: 1.5 }),
            id(`bar-${restKey}`),
          ]}
        />
      ) : null}
      {pill(TARGETS.skipRest, texts.skipRest, 40)}
    </VStack>
  );

  const setHeader = (tight: boolean) =>
    next ? (
      <HStack spacing={tight ? 4 : 6}>
        {label(texts.setBefore, MUTED, tight)}
        <Text
          modifiers={[
            font({ size: tight ? 10 : 11, weight: 'bold' }),
            monospacedDigit(),
            foregroundStyle(ON_ACCENT),
            frame({ width: tight ? 16 : 18, height: tight ? 16 : 18 }),
            background(ACCENT, shapes.circle()),
          ]}
        >
          {String(next.setIndex + 1)}
        </Text>
        {label(texts.setAfter, MUTED, tight)}
      </HStack>
    ) : (
      label(props.workoutName, MUTED, tight)
    );

  // Trimmed to the digits' height, which the line box exceeds; it leaves room for the button.
  const values = next ? (
    <HStack spacing={7} alignment="firstTextBaseline" modifiers={[frame({ height: 28 })]}>
      {next.values.map((v, i) => (
        <HStack key={`v${i}`} spacing={4} alignment="firstTextBaseline">
          {i > 0 ? (
            <Text modifiers={[font({ size: 26, weight: 'bold' }), foregroundStyle(FG)]}>×</Text>
          ) : null}
          <Text
            modifiers={[
              font({ size: 30, weight: 'bold' }),
              monospacedDigit(),
              foregroundStyle(FG),
              lineLimit(1),
            ]}
          >
            {v.value}
          </Text>
          {v.unit ? (
            <Text modifiers={[font({ size: 15, weight: 'semibold' }), foregroundStyle(MUTED)]}>
              {v.unit}
            </Text>
          ) : null}
        </HStack>
      ))}
    </HStack>
  ) : null;

  // On the Lock Screen with the button about 159 pt in all; without it the lines get more room.
  const setBody = (roomy: boolean) =>
    next ? (
      <VStack spacing={roomy ? 8 : 5}>
        <VStack spacing={roomy ? (next.loggable ? 5 : 7) : 3}>
          {values}
          <HStack spacing={4}>
            {next.done.map((done, i) => (
              <Capsule
                key={`s${i}`}
                modifiers={[foregroundStyle(done ? ACCENT : TRACK), frame({ height: 4 })]}
              />
            ))}
          </HStack>
          <Text
            modifiers={[
              font({ size: 13, weight: 'medium' }),
              foregroundStyle(MUTED),
              lineLimit(1),
              frame({ height: 15 }),
            ]}
          >
            {next.exercise}
          </Text>
        </VStack>
        {next.loggable ? pill(TARGETS.logSet, texts.logSet, 40) : null}
      </VStack>
    ) : texts.allDone ? (
      <Text modifiers={[font({ size: 22, weight: 'bold' }), foregroundStyle(FG), lineLimit(1)]}>
        {texts.allDone}
      </Text>
    ) : null;

  const header = (tight: boolean) => (resting ? restHeader : setHeader(tight));
  const body = (roomy: boolean) => (resting ? restBody(roomy) : setBody(roomy));
  const islandBody = body(false);
  const dot = <Circle modifiers={[foregroundStyle(ACCENT), frame({ width: 10, height: 10 })]} />;

  return {
    banner: (
      <VStack
        spacing={10}
        modifiers={[
          padding({ horizontal: 16, vertical: 13 }),
          background('#000000'),
          activityBackgroundTint('#000000'),
        ]}
      >
        <HStack>
          {header(false)}
          <Spacer />
          {resting ? null : elapsed(72)}
        </HStack>
        {body(true)}
      </VStack>
    ),
    compactLeading: resting ? stopwatch(15) : dot,
    compactTrailing: resting ? countdown(15, 46, 'trailing') : elapsed(58),
    minimal: resting ? stopwatch(15) : dot,
    expandedLeading: <HStack modifiers={[padding({ leading: 6 })]}>{header(true)}</HStack>,
    expandedTrailing: resting ? null : (
      <HStack modifiers={[padding({ trailing: 6 })]}>{elapsed(72)}</HStack>
    ),
    expandedBottom: islandBody ? (
      <VStack modifiers={[padding({ horizontal: 6 })]}>{islandBody}</VStack>
    ) : null,
  };
}

/** iOS only: imported by `live-activity.ios.ts`. */
export const workoutActivity = createLiveActivity<WorkoutActivityProps>(
  'WorkoutActivity',
  WorkoutActivity,
);

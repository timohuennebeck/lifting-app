import {
  Button,
  Capsule,
  Circle,
  HStack,
  ProgressView,
  RoundedRectangle,
  Spacer,
  Text,
  VStack,
  ZStack,
} from '@expo/ui/swift-ui';
import {
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

  const countdown = (size: number, width: number) =>
    restRange ? (
      <Text
        timerInterval={restRange}
        countsDown
        modifiers={[
          font({ size, weight: 'bold' }),
          monospacedDigit(),
          foregroundStyle(ACCENT),
          multilineTextAlignment('center'),
          frame({ width }),
          id(`countdown-${restKey}`),
        ]}
      />
    ) : null;

  // The label carries the shape, so all of it takes the tap (a plain button's area is its label).
  const pill = (target: string, text: string) => (
    <Button target={target} modifiers={[buttonStyle('plain')]}>
      <Text
        modifiers={[
          font({ size: 16, weight: 'semibold' }),
          foregroundStyle(ON_ACCENT),
          lineLimit(1),
          frame({ maxWidth: Infinity }),
          frame({ height: 40 }),
          background(ACCENT, shapes.capsule()),
        ]}
      >
        {text}
      </Text>
    </Button>
  );

  const nudge = (target: string, text: string) => (
    <Button target={target} modifiers={[buttonStyle('plain')]}>
      <Text
        modifiers={[
          font({ size: 13, weight: 'semibold' }),
          foregroundStyle(FG),
          lineLimit(1),
          frame({ width: 44, height: 44 }),
          background(CONTROL, shapes.circle()),
        ]}
      >
        {text}
      </Text>
    </Button>
  );

  const restHeader = (
    <HStack spacing={6}>
      {stopwatch(15)}
      {label(texts.rest, ACCENT, false)}
    </HStack>
  );

  const restBody = (
    <VStack spacing={5}>
      {/* As tall as the circles: the digits' line box is taller than the digits. */}
      <HStack modifiers={[frame({ height: 44 })]}>
        {nudge(TARGETS.minus, texts.minus)}
        <Spacer />
        {countdown(40, 130)}
        <Spacer />
        {nudge(TARGETS.plus, texts.plus)}
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
      {pill(TARGETS.skipRest, texts.skipRest)}
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

  const setBody = next ? (
    <VStack spacing={5}>
      <VStack spacing={3}>
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
      {next.loggable ? pill(TARGETS.logSet, texts.logSet) : null}
    </VStack>
  ) : texts.allDone ? (
    <Text modifiers={[font({ size: 22, weight: 'bold' }), foregroundStyle(FG), lineLimit(1)]}>
      {texts.allDone}
    </Text>
  ) : null;

  const header = (tight: boolean) => (resting ? restHeader : setHeader(tight));
  const body = resting ? restBody : setBody;
  const dot = <Circle modifiers={[foregroundStyle(ACCENT), frame({ width: 10, height: 10 })]} />;

  return {
    banner: (
      <VStack
        spacing={8}
        modifiers={[padding({ horizontal: 16, vertical: 11 }), activityBackgroundTint('#000000')]}
      >
        <HStack>
          {header(false)}
          <Spacer />
          {resting ? null : elapsed(72)}
        </HStack>
        {body}
      </VStack>
    ),
    compactLeading: resting ? stopwatch(15) : dot,
    compactTrailing: resting ? countdown(15, 46) : elapsed(58),
    minimal: resting ? stopwatch(15) : dot,
    expandedLeading: <HStack modifiers={[padding({ leading: 6 })]}>{header(true)}</HStack>,
    expandedTrailing: resting ? null : (
      <HStack modifiers={[padding({ trailing: 6 })]}>{elapsed(72)}</HStack>
    ),
    expandedBottom: body ? <VStack modifiers={[padding({ horizontal: 6 })]}>{body}</VStack> : null,
  };
}

/** iOS only: imported by `live-activity.ios.ts`. */
export const workoutActivity = createLiveActivity<WorkoutActivityProps>(
  'WorkoutActivity',
  WorkoutActivity,
);

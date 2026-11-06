import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

const CARD_SHADOW = '0 18px 34px rgba(0,0,0,0.5)';

/** A file type's label on a card: CSV, XLSX. */
function FileTag({ label, small }: { label: string; small?: boolean }) {
  return (
    <View
      className={cn(
        'self-start bg-fg',
        small ? 'rounded-[3px] px-1 py-0.5' : 'rounded-md px-2 py-1.25',
      )}
    >
      <Text
        className={cn(
          'font-inter-semibold text-bg',
          small ? 'text-[7px] leading-2' : 'text-[11px] leading-[11px] tracking-[0.44px]',
        )}
      >
        {label}
      </Text>
    </View>
  );
}

/** The lines of text a file card hints at. */
function Lines({ widths, height, first }: { widths: number[]; height: number; first?: number }) {
  return widths.map((width, i) => (
    <View
      key={i}
      className="rounded-xs bg-track"
      style={{ height, width: `${width}%`, marginTop: i === 0 ? first : 0 }}
    />
  ));
}

/** One file card of the fan: 110 × 146 with its type and lines. */
function FileCard({ label, raised }: { label: string; raised?: boolean }) {
  return (
    <View
      className={cn(
        'h-36.5 w-27.5 gap-1.75 rounded-2xl px-3 py-3.5',
        raised ? 'bg-control' : 'bg-pill',
      )}
      style={{ boxShadow: CARD_SHADOW }}
    >
      <FileTag label={label} />
      <Lines widths={[80, 60, 72, 50]} height={4} first={6} />
    </View>
  );
}

export interface FileCardsProps {
  /** Left, middle (raised) and right card. */
  labels?: readonly [string, string, string];
  /** Of the 280 × 180 fan. */
  scale?: number;
}

/** 13ia: three fanned export files, the middle one raised. */
export function FileCards({ labels = ['TSV', 'CSV', 'XLSX'], scale = 1 }: FileCardsProps) {
  return (
    <View style={{ width: 280 * scale, height: 180 * scale }} accessibilityElementsHidden>
      <View
        style={{
          width: 280,
          height: 180,
          transform: [
            { translateX: -140 * (1 - scale) },
            { translateY: -90 * (1 - scale) },
            { scale },
          ],
        }}
      >
        <View className="absolute top-6 left-0" style={{ transform: [{ rotate: '-9deg' }] }}>
          <FileCard label={labels[0]} />
        </View>
        <View className="absolute top-6 right-0" style={{ transform: [{ rotate: '9deg' }] }}>
          <FileCard label={labels[2]} />
        </View>
        <View className="absolute top-0 left-21.25">
          <FileCard label={labels[1]} raised />
        </View>
      </View>
    </View>
  );
}

/** 13l: the picked file, 150 × 190, with its type. */
export function PickedFile({ label }: { label: string }) {
  return (
    <View
      className="h-47.5 w-37.5 gap-2.25 rounded-[20px] bg-raised px-4.5 py-5"
      style={{ boxShadow: '0 24px 50px rgba(0,0,0,0.5)' }}
      accessibilityElementsHidden
    >
      <View className="mb-1.5">
        <FileTag label={label} />
      </View>
      <Lines widths={[60, 90, 75, 85]} height={5} />
      <View className="h-1.5" />
      <Lines widths={[50, 80, 65]} height={5} />
    </View>
  );
}

/** A small file card that circles the reading screen (13m31), 42 × 54. */
export function OrbitFile({ label }: { label: string }) {
  return (
    <View
      className="h-13.5 w-10.5 gap-1 rounded-[9px] bg-raised p-1.75"
      style={{ boxShadow: '0 10px 24px rgba(0,0,0,0.5)' }}
    >
      <FileTag label={label} small />
      <Lines widths={[80, 60, 70]} height={3} />
    </View>
  );
}

/** One tick of the plan card: done (filled) or open (ring). */
function Tick({ done }: { done: boolean }) {
  return done ? (
    <View className="size-3.5 items-center justify-center rounded-full bg-fg">
      <Icon name="check" size={7} color={colors.onAccent} />
    </View>
  ) : (
    <View className="size-3.5 rounded-full border-2 border-track" />
  );
}

/** 13p: a stack of plan sheets with ticks, 190 × 122. */
export function PlanCards({ scale = 0.85 }: { scale?: number }) {
  return (
    <View style={{ width: 190 * scale, height: 122 * scale }} accessibilityElementsHidden>
      <View
        style={{
          width: 190,
          height: 122,
          transform: [
            { translateX: -95 * (1 - scale) },
            { translateY: -61 * (1 - scale) },
            { scale },
          ],
        }}
      >
        <View
          className="absolute top-2.5 left-5.5 h-26.5 w-33.5 rounded-[14px] bg-tile"
          style={{ transform: [{ rotate: '-12deg' }], boxShadow: '0 14px 28px rgba(0,0,0,0.5)' }}
        />
        <View
          className="absolute top-2 left-8.5 h-26.5 w-33.5 rounded-[14px] bg-pill"
          style={{ transform: [{ rotate: '9deg' }], boxShadow: '0 14px 28px rgba(0,0,0,0.5)' }}
        />
        <View
          className="absolute top-1 left-7 h-27.5 w-33.5 gap-2.25 rounded-[14px] bg-control px-3 py-2.75"
          style={{ boxShadow: '0 14px 28px rgba(0,0,0,0.5)' }}
        >
          <View className="self-start rounded-md bg-fg px-1.75 py-1">
            <Text className="font-inter-bold text-[10px] leading-[10px] tracking-[0.4px] text-bg">
              PLAN
            </Text>
          </View>
          {[true, true, false].map((done, i) => (
            <View key={i} className="flex-row items-center gap-2">
              <Tick done={done} />
              <View className="h-1 rounded-xs bg-track" style={{ width: [60, 52, 46][i] }} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

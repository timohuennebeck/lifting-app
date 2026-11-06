import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
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

/** A small file card that floats on the reading screen (13m31), 42 × 54. */
export function FloatingFile({ label }: { label: string }) {
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

import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { formatNumber } from '@/shared/lib/format';
import { Text } from '@/shared/ui/text';

import { type BarLoad, plateLook, type PlateCount, type PlateSetup } from '../lib/plates';

/** Why there are no plates to list, as a key of `workout:plates`; null when there are. */
export function plateNote(load: BarLoad, bar: number, carrier: PlateSetup['carrier']) {
  if (load.kind === 'empty') return 'enterWeight' as const;
  if (load.kind === 'below')
    return carrier === 'sled' ? ('belowSled' as const) : ('belowBar' as const);
  if (load.plates.length) return null;
  if (!bar) return 'noPlates' as const;
  return carrier === 'sled' ? ('sledOnly' as const) : ('barOnly' as const);
}

/** The caption over the plates: per side, or on the one loaded end. */
export function plateCaption(setup: PlateSetup) {
  if (setup.sides === 2) return 'perSide' as const;
  return setup.carrier === 'sled' ? ('onMachine' as const) : ('onBar' as const);
}

type Size = 'pad' | 'sheet';

const STYLES = {
  pad: {
    swatch: 'size-2.25 rounded-[2.5px]',
    row: 'h-5 gap-1.75',
    count: 'text-[13px]',
    weight: 'text-[15px]',
    line: 'leading-5',
  },
  sheet: {
    swatch: 'size-3 rounded-[3px]',
    row: 'h-7 gap-2.5',
    count: 'text-base',
    weight: 'text-[19px]',
    line: 'leading-7',
  },
} as const;

interface PlateItemProps {
  plate: PlateCount;
  unit: 'kg' | 'lb';
  size: Size;
  /** Smaller text, for the folded line. */
  compact?: boolean;
}

/** A plate's colour as a small square, then "1× 25 kg". */
function PlateItem({ plate, unit, size, compact }: PlateItemProps) {
  const s = STYLES[size];
  return (
    <View className={cn('flex-row items-center', s.row)}>
      <View className={s.swatch} style={{ backgroundColor: plateLook(plate.weight, unit).color }} />
      <Text
        className={cn(
          'font-inter-semibold text-fg tabular-nums',
          compact ? 'text-sm' : s.weight,
          s.line,
        )}
      >
        <Text className={cn('font-inter-medium text-subtle', compact ? 'text-xs' : s.count)}>
          {`${plate.count}× `}
        </Text>
        {`${formatNumber(plate.weight, 2)} ${unit}`}
      </Text>
    </View>
  );
}

export interface PlateListProps {
  plates: PlateCount[];
  unit: 'kg' | 'lb';
  size: Size;
  /** On one line (the folded number pad); else in columns of two, heaviest top left. */
  line?: boolean;
}

/** The plates per side, each with how many of it. */
export function PlateList({ plates, unit, size, line }: PlateListProps) {
  if (line) {
    return (
      <View className="flex-1 flex-row items-center gap-3 overflow-hidden">
        {plates.map((p) => (
          <PlateItem key={p.weight} plate={p} unit={unit} size={size} compact />
        ))}
      </View>
    );
  }
  const columns: PlateCount[][] = [];
  plates.forEach((p, i) => {
    if (i % 2 === 0) columns.push([p]);
    else columns[columns.length - 1].push(p);
  });
  return (
    <View className={cn('flex-row', size === 'pad' ? 'gap-3.5' : 'gap-7')}>
      {columns.map((column) => (
        <View
          key={column[0].weight}
          className={size === 'pad' ? 'min-w-18 gap-1' : 'min-w-27.5 gap-2.5'}
        >
          {column.map((p) => (
            <PlateItem key={p.weight} plate={p} unit={unit} size={size} />
          ))}
        </View>
      ))}
    </View>
  );
}

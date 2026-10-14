import { formatNumber } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';

import { Text } from './text';

/** Limits up to this long always show their count; longer texts only near the limit. */
const ALWAYS_UP_TO = 200;
const NEAR_LIMIT = 0.9;

export interface CharCountProps {
  length: number;
  max: number;
  className?: string;
}

/** "12 / 24": the characters typed of a field's limit, under the field. */
export function CharCount({ length, max, className }: CharCountProps) {
  if (max > ALWAYS_UP_TO && length < max * NEAR_LIMIT) return null;
  return (
    <Text
      variant="caption"
      tone={length >= max ? 'default' : 'subtle'}
      className={cn('self-end px-1 font-inter text-xs tabular-nums', className)}
    >
      {`${formatNumber(length)} / ${formatNumber(max)}`}
    </Text>
  );
}

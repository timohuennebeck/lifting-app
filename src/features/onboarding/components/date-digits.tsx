import { Fragment } from 'react';
import { Text as RNText } from 'react-native';

import { Text } from '@/shared/ui/text';

import { type DateField, FIELD_DIGITS, splitDigits } from '../lib/birth-date-input';

export interface DateDigitsProps {
  /** Typed so far, in the order of `fields`. */
  digits: string;
  fields: readonly DateField[];
  separator: string;
  /** Letters standing in for the digits not typed yet, e.g. TT, MM and JJJJ. */
  placeholder: Record<DateField, string>;
}

/**
 * The birth date as typed, big, with dim letters for the digits still missing (14.0M.JJJJ); the
 * next one to type is lit like a cursor. Sized so the widest placeholder (DD/MM/AAAA) fits a
 * 360pt screen.
 */
export function DateDigits({ digits, fields, separator, placeholder }: DateDigitsProps) {
  const parts = splitDigits(digits, fields);
  const label = fields
    .map((field) => parts[field] + placeholder[field].slice(parts[field].length))
    .join(separator);

  return (
    <Text
      accessibilityLabel={label}
      numberOfLines={1}
      className="text-center font-inter-semibold text-[48px] leading-14 tracking-[-1px] tabular-nums"
    >
      {fields.map((field, i) => {
        const typed = parts[field];
        const rest = placeholder[field].slice(typed.length);
        // A mark lights up once the field before it is complete.
        const before = fields[i - 1];
        const lit = i > 0 && parts[before].length === FIELD_DIGITS[before];
        const next = typed.length < FIELD_DIGITS[field] && (i === 0 || lit);
        return (
          <Fragment key={field}>
            {i > 0 ? <RNText className={lit ? undefined : 'text-track'}>{separator}</RNText> : null}
            {typed}
            {next ? <RNText className="text-accent">{rest[0]}</RNText> : null}
            <RNText className="text-track">{next ? rest.slice(1) : rest}</RNText>
          </Fragment>
        );
      })}
    </Text>
  );
}

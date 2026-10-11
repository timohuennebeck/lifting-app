import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AGE_RANGE } from '@/shared/data/profile';
import { haptics } from '@/shared/lib/haptics';
import { Button } from '@/shared/ui/button';
import { DigitPad } from '@/shared/ui/number-keypad';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';

import { DateDigits } from '../components/date-digits';
import { DATE_DIGITS, dateLayout, readBirthDate, toDigits } from '../lib/birth-date-input';
import { ABOUT_STEPS } from '../lib/flow';
import { useDraft, useUpdateDraft } from '../stores/onboarding-store';

export function BirthDateScreen() {
  const { t } = useTranslation('onboarding');
  const { t: tc } = useTranslation();
  const { birthDate } = useDraft();
  const update = useUpdateDraft();
  const { fields, separator } = dateLayout();
  // No default date; coming back shows the one given before.
  const [digits, setDigits] = useState(() => (birthDate ? toDigits(birthDate, fields) : ''));
  const input = readBirthDate(digits, fields);
  const failed = input.status === 'invalid' || input.status === 'tooYoung';

  // The draft only holds a valid date, so Continue and the account step can rely on it.
  const type = (next: string) => {
    const result = readBirthDate(next, fields);
    const fails = result.status === 'invalid' || result.status === 'tooYoung';
    if (fails && !failed) haptics.error();
    setDigits(next);
    update({ birthDate: result.status === 'valid' ? result.birthDate : null });
  };

  return (
    <StepScreen
      step={3}
      total={ABOUT_STEPS}
      title={t('birthDate.title')}
      footer={
        <Button
          label={tc('actions.continue')}
          disabled={input.status !== 'valid'}
          onPress={() => router.push('/units')}
        />
      }
    >
      <View className="flex-1 justify-between pt-10">
        <View className="items-center gap-2 px-4">
          <DateDigits
            digits={digits}
            fields={fields}
            separator={separator}
            placeholder={{
              day: t('birthDate.placeholder.day'),
              month: t('birthDate.placeholder.month'),
              year: t('birthDate.placeholder.year'),
            }}
          />
          {/* Kept in place while empty so the date doesn't move. */}
          <Text
            variant="label"
            tone={failed ? 'danger' : 'subtle'}
            accessibilityLiveRegion="polite"
            className="text-center"
          >
            {input.status === 'valid'
              ? t('birthDate.age', { count: input.age })
              : input.status === 'tooYoung'
                ? t('birthDate.tooYoung', { min: AGE_RANGE.min })
                : input.status === 'invalid'
                  ? t('birthDate.invalid')
                  : ' '}
          </Text>
        </View>
        <DigitPad
          className="px-4 pb-3"
          onKey={(key) => digits.length < DATE_DIGITS && type(digits + key)}
          onBackspace={() => digits && type(digits.slice(0, -1))}
        />
      </View>
    </StepScreen>
  );
}

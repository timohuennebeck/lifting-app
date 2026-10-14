import { useTranslation } from 'react-i18next';

import { formatDuration } from '@/shared/lib/format';

import { CompactStepper } from './compact-stepper';

export interface RestStepperProps {
  /** Rest in seconds. */
  value: number;
  onChange: (seconds: number) => void;
}

/** Rest between sets as "1:30 Min." with minus and plus in 15 s steps, 0:15 to 10:00. */
export function RestStepper({ value, onChange }: RestStepperProps) {
  const { t } = useTranslation('training');
  return (
    <CompactStepper
      value={value}
      onChange={onChange}
      min={15}
      max={600}
      step={15}
      format={formatDuration}
      unit={t('sets.minutes')}
    />
  );
}

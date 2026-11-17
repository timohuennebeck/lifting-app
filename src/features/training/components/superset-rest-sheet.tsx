import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/shared/ui/button';
import { RestStepper } from '@/shared/ui/rest-stepper';
import { Sheet } from '@/shared/ui/sheet';

export interface SupersetRestSheetProps {
  /** The superset's letter while the sheet shows; null hides it. */
  letter: string | null;
  /** The rest after each round it has now. */
  seconds: number;
  onSave: (seconds: number) => void;
  onClose: () => void;
}

interface BodyProps {
  seconds: number;
  onSave: (seconds: number) => void;
}

/** The stepper starts from the saved rest each time the sheet opens. */
function SupersetRestBody({ seconds, onSave }: BodyProps) {
  const { t } = useTranslation('common');
  const [value, setValue] = useState(seconds);
  return (
    <View className="gap-4 pt-1">
      <RestStepper value={value} onChange={setValue} />
      <Button label={t('actions.save')} onPress={() => onSave(value)} />
    </View>
  );
}

/**
 * The rest after each round of a superset. It stays as set: reordering, adding an exercise or
 * splitting the superset doesn't change it.
 */
export function SupersetRestSheet({ letter, seconds, onSave, onClose }: SupersetRestSheetProps) {
  const { t } = useTranslation('training');
  return (
    <Sheet
      visible={letter !== null}
      onClose={onClose}
      title={t('superset.restTitle')}
      subtitle={t('superset.restHint', { letter: letter ?? '' })}
    >
      <SupersetRestBody seconds={seconds} onSave={onSave} />
    </Sheet>
  );
}

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import {
  AGE_RANGE,
  bodyWeightFromDisplay,
  bodyWeightRange,
  bodyWeightToDisplay,
  FIRST_NAME_MAX,
  heightFromDisplay,
  heightRange,
  heightToDisplay,
  type Profile,
  type ProfilePatch,
  type Sex,
} from '@/shared/data/profile';
import { feetInches, formatNumber, weightUnit } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { Chip } from '@/shared/ui/chip';
import { NumberStepper } from '@/shared/ui/number-stepper';
import { RulerPicker } from '@/shared/ui/ruler-picker';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';

export type BodyField = 'firstName' | 'sex' | 'age' | 'weight' | 'height';

const SEXES: Sex[] = ['female', 'male', 'unspecified'];

export interface BodyFieldSheetProps {
  field: BodyField | null;
  visible: boolean;
  /** Changes on every open so the editor starts from the saved value. */
  session: number;
  profile: Profile;
  onSave: (patch: ProfilePatch) => void;
  onClose: () => void;
}

export function BodyFieldSheet({
  field,
  visible,
  session,
  profile,
  onSave,
  onClose,
}: BodyFieldSheetProps) {
  const { t } = useTranslation('profile');
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={field ? t(`settings.fields.${field}`) : undefined}
      className="bg-bg"
    >
      {field ? (
        <FieldEditor
          key={session}
          field={field}
          profile={profile}
          onSave={(patch) => {
            onSave(patch);
            onClose();
          }}
        />
      ) : null}
    </Sheet>
  );
}

interface FieldEditorProps {
  field: BodyField;
  profile: Profile;
  onSave: (patch: ProfilePatch) => void;
}

function FieldEditor({ field, profile, onSave }: FieldEditorProps) {
  const { t } = useTranslation('profile');
  const { t: tc } = useTranslation();
  const units = profile.unitSystem;
  const imperial = units === 'imperial';
  const [name, setName] = useState(profile.firstName);
  const [age, setAge] = useState(profile.age ?? 28);
  // Weight/height are edited in the display unit and converted on save.
  const [weight, setWeight] = useState(() => bodyWeightToDisplay(profile.weightKg ?? 75, units));
  const [height, setHeight] = useState(() => heightToDisplay(profile.heightCm ?? 175, units));

  if (field === 'sex') {
    return (
      <View className="flex-row flex-wrap gap-2 px-1 pb-2">
        {SEXES.map((sex) => (
          <Chip
            key={sex}
            label={t(`settings.sexes.${sex}`)}
            selected={profile.sex === sex}
            onPress={() => onSave({ sex })}
          />
        ))}
      </View>
    );
  }

  let editor;
  let patch: ProfilePatch;
  if (field === 'firstName') {
    editor = (
      <TextField
        value={name}
        onChangeText={setName}
        clearable
        autoCapitalize="words"
        maxLength={FIRST_NAME_MAX}
        returnKeyType="done"
        onSubmitEditing={() => name.trim() && onSave({ firstName: name.trim() })}
      />
    );
    patch = { firstName: name.trim() };
  } else if (field === 'age') {
    editor = (
      <NumberStepper
        value={age}
        onChange={setAge}
        min={AGE_RANGE.min}
        max={AGE_RANGE.max}
        unit={t('settings.years')}
      />
    );
    patch = { age };
  } else if (field === 'weight') {
    const range = bodyWeightRange(units);
    editor = (
      <View className="items-center gap-2">
        <Text variant="display">{formatNumber(weight)}</Text>
        <Text variant="overline" tone="subtle">
          {tc(`units.${weightUnit(units)}`)}
        </Text>
        <RulerPicker
          value={weight}
          onChange={setWeight}
          min={range.min}
          max={range.max}
          step={range.step}
        />
      </View>
    );
    patch = { weightKg: bodyWeightFromDisplay(weight, units) };
  } else {
    const range = heightRange(units);
    editor = (
      <View className="items-center gap-2">
        <Text variant="display">{imperial ? feetInches(height) : height}</Text>
        <Text variant="overline" tone="subtle">
          {imperial ? t('settings.feetInches') : tc('units.cm')}
        </Text>
        <RulerPicker
          value={height}
          onChange={setHeight}
          min={range.min}
          max={range.max}
          step={1}
          majorEvery={imperial ? 12 : 10}
        />
      </View>
    );
    patch = { heightCm: heightFromDisplay(height, units) };
  }

  return (
    <View className="gap-6">
      {editor}
      <Button
        label={tc('actions.save')}
        disabled={field === 'firstName' && !name.trim()}
        onPress={() => onSave(patch)}
      />
    </View>
  );
}

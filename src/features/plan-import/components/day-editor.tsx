import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Chip } from '@/shared/ui/chip';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import type { ImportedDay } from '../lib/plan-import-service';
import { REVIEW_COLOR } from './imported-exercise-row';

export interface DayEditorProps {
  day: ImportedDay;
  /** Name restored when the field is left empty. */
  fallbackName: string;
  onEdit: (edit: (day: ImportedDay) => ImportedDay) => void;
}

/** Editable day name, exercise count and weekday picker of one imported day. */
export function DayEditor({ day, fallbackName, onEdit }: DayEditorProps) {
  const { t } = useTranslation(['planImport', 'common']);
  const narrow = t('common:weekdays.narrow', { returnObjects: true });
  const long = t('common:weekdays.long', { returnObjects: true });
  const setWeekday = (weekday: number | null) =>
    onEdit(({ rawDay: _raw, ...d }) => ({ ...d, weekday }));

  return (
    <View className="px-4 pt-5">
      <View className="flex-row items-center gap-2.5">
        <TextInput
          value={day.name}
          onChangeText={(name) => onEdit((d) => ({ ...d, name }))}
          onEndEditing={() => {
            if (!day.name.trim()) onEdit((d) => ({ ...d, name: fallbackName }));
          }}
          accessibilityLabel={t('planImport:confirm.dayName')}
          maxLength={24}
          selectionColor={colors.fg}
          keyboardAppearance="dark"
          returnKeyType="done"
          className="min-w-0 flex-1 font-inter-semibold text-headline text-fg"
        />
        <Icon name="pencil" size={14} color={colors.subtle} />
      </View>
      <Text variant="caption" tone="subtle" className="mt-1 font-inter">
        {`${day.weekday !== null ? long[day.weekday] : t('planImport:confirm.noDay')} · ${t('planImport:confirm.exercises', { count: day.exercises.length })}`}
      </Text>
      {day.rawDay ? (
        <Text variant="caption" className="mt-3" style={{ color: REVIEW_COLOR }}>
          {t('planImport:confirm.dayUnknown', { raw: day.rawDay })}
        </Text>
      ) : null}
      <View className="mt-3 flex-row gap-1.5">
        {narrow.map((label, wd) => {
          const on = day.weekday === wd;
          return (
            <PressableScale
              key={wd}
              haptic="select"
              accessibilityRole="radio"
              accessibilityLabel={long[wd]}
              accessibilityState={{ selected: on }}
              onPress={() => setWeekday(on ? null : wd)}
              className={cn(
                'h-10 flex-1 items-center justify-center rounded-full',
                on ? 'bg-accent' : 'bg-pill',
              )}
            >
              <Text variant="caption" tone={on ? 'onAccent' : 'secondary'}>
                {label}
              </Text>
            </PressableScale>
          );
        })}
      </View>
      <Chip
        label={t('planImport:confirm.noDay')}
        selected={day.weekday === null && !day.rawDay}
        showCheck
        onPress={() => setWeekday(null)}
        className="mt-2 h-9 self-start"
      />
    </View>
  );
}

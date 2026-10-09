import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { exerciseName } from '@/shared/data/exercises';
import { colors } from '@/shared/lib/theme';
import { Chip } from '@/shared/ui/chip';
import { Text } from '@/shared/ui/text';

export interface ReviewPromptProps {
  /** What the import read, e.g. "Read as “Cbl. row cl.”". */
  message: string;
  /** Accepts the guess as it is. */
  onConfirm: () => void;
  /** Other catalog exercises the text could mean. */
  alternatives?: string[];
  onPickAlternative?: (exerciseId: string) => void;
}

/** Amber "please check" box for something the plan import wasn't sure about. */
export function ReviewPrompt({
  message,
  onConfirm,
  alternatives = [],
  onPickAlternative,
}: ReviewPromptProps) {
  const { t, i18n } = useTranslation('planImport');
  return (
    <View
      className="gap-2.5 rounded-[18px] p-3"
      style={{ borderWidth: 1.5, borderColor: `${colors.review}80` }}
    >
      <Text variant="caption" style={{ color: colors.review }}>
        {message}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        <Chip label={t('confirm.correct')} selected showCheck onPress={onConfirm} />
        {alternatives.map((id) => (
          <Chip
            key={id}
            label={exerciseName(id, i18n.language)}
            onPress={() => onPickAlternative?.(id)}
          />
        ))}
      </View>
    </View>
  );
}

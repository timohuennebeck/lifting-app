import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { colors } from '@/shared/lib/theme';
import { Text } from '@/shared/ui/text';

import { MIN_PASSWORD_LENGTH, passwordScore } from '../lib/credentials';

/** Colour and verdict per score 1–4. */
const LEVEL_COLORS = ['#FF4D4D', '#FF9F2E', '#FFD426', colors.accent] as const;
const LEVEL_KEYS = ['weak', 'okay', 'good', 'strong'] as const;

export interface PasswordStrengthProps {
  password: string;
}

/** Four-segment meter with a coloured verdict under the password field. */
export function PasswordStrength({ password }: PasswordStrengthProps) {
  const { t } = useTranslation('auth');
  const score = passwordScore(password);
  const color = score > 0 ? LEVEL_COLORS[score - 1] : colors.muted;
  let verdict = '';
  if (password.length >= MIN_PASSWORD_LENGTH) verdict = t(`strength.${LEVEL_KEYS[score - 1]}`);
  else if (password) verdict = t('strength.tooShort');

  return (
    <View className="gap-2 px-1 pt-1.5">
      <View className="flex-row gap-1">
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            className="h-1 flex-1 rounded-sm"
            style={{ backgroundColor: i < score ? color : colors.control }}
          />
        ))}
      </View>
      <View className="flex-row justify-between">
        <Text variant="caption" tone="subtle" className="font-inter">
          {t('strength.label')}
        </Text>
        <Text variant="caption" style={{ color }} accessibilityLiveRegion="polite">
          {verdict}
        </Text>
      </View>
    </View>
  );
}

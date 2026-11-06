import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';
import { TextField } from '@/shared/ui/text-field';

import { passwordStrength } from '../lib/email-auth';

const LEVELS = ['weak', 'fair', 'good', 'strong'] as const;
/** A strength's bar colour: weak red, fair amber, then the accent. */
const TINTS = ['bg-red', 'bg-red', 'bg-amber', 'bg-accent', 'bg-accent'] as const;

/** "oder mit E-Mail" between the Google and Apple buttons and the fields. */
export function EmailDivider() {
  const { t } = useTranslation('auth');
  return (
    <View className="flex-row items-center gap-3.5 py-1">
      <View className="h-px flex-1 bg-line" />
      <Text variant="caption" tone="subtle" className="font-inter">
        {t('email.divider')}
      </Text>
      <View className="h-px flex-1 bg-line" />
    </View>
  );
}

export interface EmailFieldsProps {
  email: string;
  password: string;
  onChangeEmail: (email: string) => void;
  onChangePassword: (password: string) => void;
  /** A new account: its password gets the strength bars. */
  isNew?: boolean;
  /** Return on the password's keyboard. */
  onSubmit: () => void;
  /** Signing in: "Passwort vergessen?" under the password. */
  onForgot?: () => void;
  editable?: boolean;
}

export interface PasswordFieldProps {
  value: string;
  onChange: (password: string) => void;
  /** A new password: the strength bars under it. */
  isNew?: boolean;
  onSubmit: () => void;
  editable?: boolean;
  autoFocus?: boolean;
}

/** A password with a show/hide eye; a new one shows how strong it is. */
export function PasswordField({
  value,
  onChange,
  isNew,
  onSubmit,
  editable = true,
  autoFocus,
}: PasswordFieldProps) {
  const { t } = useTranslation('auth');
  const [shown, setShown] = useState(false);
  const strength = passwordStrength(value);

  return (
    <View className="gap-2.5">
      <TextField
        label={t('password.label')}
        value={value}
        onChangeText={onChange}
        placeholder={isNew ? t('password.newPlaceholder') : t('password.placeholder')}
        secureTextEntry={!shown}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={isNew ? 'new-password' : 'current-password'}
        textContentType={isNew ? 'newPassword' : 'password'}
        returnKeyType="go"
        onSubmitEditing={onSubmit}
        editable={editable}
        autoFocus={autoFocus}
        trailing={
          <PressableScale
            haptic="select"
            accessibilityRole="button"
            accessibilityLabel={shown ? t('password.hide') : t('password.show')}
            onPress={() => setShown((s) => !s)}
            className="size-10 items-center justify-center"
          >
            <Icon name={shown ? 'eye-off' : 'eye'} size={20} color={colors.subtle} />
          </PressableScale>
        }
      />
      {isNew ? (
        <View className="gap-2">
          <View className="flex-row gap-1.5">
            {[1, 2, 3, 4].map((step) => (
              <View
                key={step}
                className={cn(
                  'h-1 flex-1 rounded-full',
                  step <= strength ? TINTS[strength] : 'bg-control',
                )}
              />
            ))}
          </View>
          <Text variant="caption" tone="subtle" className="px-1 font-inter">
            {value
              ? `${t('password.strength')} · ${t(`password.levels.${LEVELS[strength - 1]}`)}`
              : t('password.strength')}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/** Email and password; signing in, "Passwort vergessen?" under the password. */
export function EmailFields({
  email,
  password,
  onChangeEmail,
  onChangePassword,
  isNew,
  onSubmit,
  onForgot,
  editable = true,
}: EmailFieldsProps) {
  const { t } = useTranslation('auth');
  return (
    <View className="gap-5">
      <TextField
        label={t('email.label')}
        value={email}
        onChangeText={onChangeEmail}
        placeholder={t('email.placeholder')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="username"
        returnKeyType="next"
        editable={editable}
      />
      <View className="gap-1">
        <PasswordField
          value={password}
          onChange={onChangePassword}
          isNew={isNew}
          onSubmit={onSubmit}
          editable={editable}
        />
        {onForgot ? (
          <TextButton
            label={t('forgot.link')}
            tone="muted"
            className="min-h-10 self-end px-1"
            textClassName="font-inter-medium text-sm"
            onPress={onForgot}
          />
        ) : null}
      </View>
    </View>
  );
}

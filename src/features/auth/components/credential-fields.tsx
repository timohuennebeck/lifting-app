import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type TextInput, View } from 'react-native';

import { TextField } from '@/shared/ui/text-field';

import { isValidEmail } from '../lib/credentials';
import { PasswordStrength } from './password-strength';

export interface CredentialFieldsProps {
  email: string;
  password: string;
  onChangeEmail: (email: string) => void;
  onChangePassword: (password: string) => void;
  /** 'new' shows the strength meter and asks the OS for a strong password. */
  mode: 'new' | 'existing';
  onSubmit: () => void;
  editable?: boolean;
}

/** Email + password inputs shared by account creation and sign-in. */
export function CredentialFields({
  email,
  password,
  onChangeEmail,
  onChangePassword,
  mode,
  onSubmit,
  editable = true,
}: CredentialFieldsProps) {
  const { t } = useTranslation('auth');
  const passwordRef = useRef<TextInput>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const emailError =
    emailTouched && email.length > 0 && !isValidEmail(email) ? t('errors.invalidEmail') : undefined;

  return (
    <View className="gap-2.5">
      <TextField
        compact
        label={t('email')}
        value={email}
        onChangeText={(v) => onChangeEmail(v.trim())}
        onBlur={() => setEmailTouched(true)}
        placeholder={t('emailPlaceholder')}
        error={emailError}
        editable={editable}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType={mode === 'new' ? 'emailAddress' : 'username'}
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <TextField
        compact
        ref={passwordRef}
        label={t('password')}
        value={password}
        onChangeText={onChangePassword}
        placeholder={t('passwordPlaceholder')}
        editable={editable}
        secureTextEntry
        revealable
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={mode === 'new' ? 'new-password' : 'current-password'}
        textContentType={mode === 'new' ? 'newPassword' : 'password'}
        returnKeyType="go"
        onSubmitEditing={onSubmit}
        className="mt-1"
      />
      {mode === 'new' ? <PasswordStrength password={password} /> : null}
    </View>
  );
}

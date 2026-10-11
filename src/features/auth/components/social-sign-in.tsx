import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

import { appleSignInAvailable, providerReady, type SocialProvider } from '../lib/social-sign-in';

function GoogleLogo() {
  return (
    <Svg width={20} height={20} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"
      />
      <Path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <Path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <Path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"
      />
    </Svg>
  );
}

function AppleLogo() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        fill={colors.fg}
        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
      />
    </Svg>
  );
}

const PROVIDERS = [
  { id: 'google', name: 'Google', Logo: GoogleLogo },
  { id: 'apple', name: 'Apple', Logo: AppleLogo },
] as const satisfies readonly { id: SocialProvider; name: string; Logo: () => ReactNode }[];

export interface SocialSignInProps {
  /** Signs in with the provider; the screen decides what follows. */
  onSignIn: (provider: SocialProvider) => void;
  /** The provider whose sign-in is running: a spinner in place of its logo. */
  busy?: SocialProvider | null;
  disabled?: boolean;
}

/**
 * Google and (on Apple devices) Apple buttons plus the "or with email" divider. Until Google's
 * client IDs are set up, its button explains in a sheet that it isn't available yet.
 */
export function SocialSignIn({ onSignIn, busy, disabled }: SocialSignInProps) {
  const { t } = useTranslation('auth');
  const [unavailable, setUnavailable] = useState(false);
  const providers = PROVIDERS.filter(({ id }) => id !== 'apple' || appleSignInAvailable);

  return (
    <View>
      <View className="flex-row gap-2.5">
        {providers.map(({ id, name, Logo }) => (
          <PressableScale
            key={id}
            disabled={disabled}
            accessibilityState={{ disabled, busy: busy === id }}
            onPress={() => (providerReady(id) ? onSignIn(id) : setUnavailable(true))}
            className="h-13 flex-1 flex-row items-center justify-center gap-2.5 rounded-full bg-pill"
          >
            {busy === id ? <ActivityIndicator size="small" color={colors.fg} /> : <Logo />}
            <Text variant="label">{name}</Text>
          </PressableScale>
        ))}
      </View>
      <View className="flex-row items-center gap-3 px-1 pt-4.5">
        <View className="h-px flex-1 bg-white/10" />
        <Text variant="caption" tone="subtle" className="font-inter">
          {t('social.orEmail')}
        </Text>
        <View className="h-px flex-1 bg-white/10" />
      </View>
      <Sheet
        visible={unavailable}
        onClose={() => setUnavailable(false)}
        title={t('social.unavailableTitle')}
        subtitle={t('social.unavailableBody', { provider: 'Google' })}
      >
        <Button label={t('social.ok')} onPress={() => setUnavailable(false)} />
      </Sheet>
    </View>
  );
}

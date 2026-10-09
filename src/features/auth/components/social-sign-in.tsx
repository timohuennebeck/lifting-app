import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Button } from '@/shared/ui/button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

type Provider = 'Google' | 'Facebook';

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

function FacebookLogo() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        fill="#0866FF"
        d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07"
      />
      <Path
        fill="#FFFFFF"
        d="M16.67 15.56l.53-3.5h-3.32V9.8c0-.96.46-1.89 1.96-1.89h1.5V4.95s-1.37-.24-2.68-.24c-2.74 0-4.54 1.68-4.54 4.7v2.66H7.08v3.49h3.04V24a12.3 12.3 0 0 0 3.76 0v-8.44z"
      />
    </Svg>
  );
}

const PROVIDERS = [
  { name: 'Google', Logo: GoogleLogo },
  { name: 'Facebook', Logo: FacebookLogo },
] as const satisfies readonly { name: Provider; Logo: () => ReactNode }[];

/**
 * Google / Facebook buttons plus the "or with email" divider.
 * Social sign-in is not wired up yet, so the buttons explain that in a sheet.
 */
export function SocialSignIn() {
  const { t } = useTranslation('auth');
  const [provider, setProvider] = useState<Provider>('Google');
  const [open, setOpen] = useState(false);

  return (
    <View>
      <View className="flex-row gap-2.5">
        {PROVIDERS.map(({ name, Logo }) => (
          <PressableScale
            key={name}
            onPress={() => {
              setProvider(name);
              setOpen(true);
            }}
            className="h-13 flex-1 flex-row items-center justify-center gap-2.5 rounded-full bg-pill"
          >
            <Logo />
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
        visible={open}
        onClose={() => setOpen(false)}
        title={t('social.unavailableTitle')}
        subtitle={t('social.unavailableBody', { provider })}
      >
        <Button label={t('social.ok')} onPress={() => setOpen(false)} />
      </Sheet>
    </View>
  );
}

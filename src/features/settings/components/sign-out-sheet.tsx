import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { UserAvatar } from '@/shared/components/user-avatar';
import { Button } from '@/shared/ui/button';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

export interface SignOutSheetProps {
  visible: boolean;
  onClose: () => void;
  name: string;
  email: string;
  /** Changes and photos not uploaded yet: signing out deletes them from this device. */
  unsynced: number;
  onSignOut: () => void;
}

/** "Als Lena abmelden?" with the account it signs out of; warns when unsynced data would go. */
export function SignOutSheet({
  visible,
  onClose,
  name,
  email,
  unsynced,
  onSignOut,
}: SignOutSheetProps) {
  const { t } = useTranslation(['profile', 'common']);
  return (
    <Sheet visible={visible} onClose={onClose}>
      <View className="flex-row items-center gap-3.5 px-1 pt-3">
        <UserAvatar size={52} className="border-0" />
        <View className="min-w-0 flex-1 gap-0.5">
          <Text variant="bodyStrong" numberOfLines={2}>
            {name
              ? t('settings.signOutConfirm.titleNamed', { name })
              : t('settings.signOutConfirm.title')}
          </Text>
          {email ? (
            <Text tone="subtle" className="text-sm" numberOfLines={1}>
              {email}
            </Text>
          ) : null}
        </View>
      </View>
      {unsynced > 0 ? (
        <Text variant="caption" tone="danger" className="px-1 pt-4 font-inter text-sm leading-5">
          {t('settings.signOutConfirm.unsynced', { count: unsynced })}
        </Text>
      ) : null}
      <View className="flex-row gap-2.5 pt-6">
        <View className="min-w-0 flex-1">
          <Button label={t('common:actions.cancel')} variant="secondary" onPress={onClose} />
        </View>
        <View className="min-w-0 flex-1">
          <Button label={t('settings.signOut')} haptic="warning" onPress={onSignOut} />
        </View>
      </View>
    </Sheet>
  );
}

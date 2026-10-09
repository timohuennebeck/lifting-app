import { PermissionStatus, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { colors } from '@/shared/lib/theme';

import { Button } from '../button';
import { Icon } from '../icon';
import { afterSheetClose, Sheet } from '../sheet';
import { Text } from '../text';
import { TextButton } from '../text-button';

export interface CameraAccessSheetProps {
  visible: boolean;
  onClose: () => void;
  onContinue: () => void;
  /** Why the camera is needed, e.g. "For your body check photos." */
  body: string;
}

/** Asks for the camera before the screen that needs it (designs 08a·0d and 08a·0e). */
export function CameraAccessSheet({ visible, onClose, onContinue, body }: CameraAccessSheetProps) {
  const { t } = useTranslation();
  return (
    <Sheet visible={visible} onClose={onClose}>
      <View className="gap-2 px-1 pt-2">
        <View className="mb-2.5 size-12 items-center justify-center rounded-full bg-accent">
          <Icon name="photo-camera" size={20} color={colors.onAccent} />
        </View>
        <Text variant="headline">{t('cameraAccess.title')}</Text>
        <Text variant="paragraph" tone="muted" className="text-[15px] leading-5.5">
          {body}
        </Text>
      </View>
      <View className="gap-1 pt-6">
        <Button label={t('actions.continue')} onPress={onContinue} />
        <TextButton label={t('actions.notNow')} tone="secondary" onPress={onClose} />
      </View>
    </Sheet>
  );
}

/**
 * Opens a camera screen through the access sheet while the system hasn't asked yet:
 * "Continue" asks, then `open` runs (the camera screen handles a refusal). Once access was
 * decided, `request` opens it straight away.
 */
export function useCameraAccess(open: () => void) {
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [visible, setVisible] = useState(false);

  return {
    request: async () => {
      // Right after mount the status may still be loading.
      const { status } = permission ?? (await getPermission());
      if (status === PermissionStatus.UNDETERMINED) setVisible(true);
      else open();
    },
    sheet: {
      visible,
      onClose: () => setVisible(false),
      onContinue: () => {
        setVisible(false);
        // The system dialog shows once the sheet is gone.
        afterSheetClose(async () => {
          await requestPermission();
          open();
        });
      },
    },
  };
}

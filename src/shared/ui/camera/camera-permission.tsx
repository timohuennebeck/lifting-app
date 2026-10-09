import type { PermissionResponse } from 'expo-camera';
import type { ReactNode } from 'react';
import { Linking, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/shared/ui/button';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { StepTitle } from '@/shared/ui/step-screen';

export interface CameraPermissionCopy {
  title: string;
  body: string;
  /** CTA while the system may still ask. */
  allow: string;
  /** CTA once access was denied for good. */
  settings: string;
}

export interface CameraPermissionProps {
  permission: PermissionResponse;
  onRequest: () => void;
  onClose: () => void;
  copy: CameraPermissionCopy;
  /** Space under the actions. */
  bottomInset: number;
  /** Extra actions under the CTA, e.g. picking from the library. */
  children?: ReactNode;
}

/** Stands in for a camera without access: asks the system, or opens the settings. */
export function CameraPermission({
  permission,
  onRequest,
  onClose,
  copy,
  bottomInset,
  children,
}: CameraPermissionProps) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top, paddingBottom: bottomInset }}>
      <ScreenHeader onBack={onClose} />
      <StepTitle title={copy.title} subtitle={copy.body} subtitleTone="subtle" />
      <View className="flex-1" />
      <View className="gap-2 px-4">
        <Button
          label={permission.canAskAgain ? copy.allow : copy.settings}
          icon="camera"
          onPress={() => (permission.canAskAgain ? onRequest() : Linking.openSettings())}
        />
        {children}
      </View>
    </View>
  );
}

import { PermissionStatus, useCameraPermissions } from 'expo-camera';
import { useEffect } from 'react';
import { AppState } from 'react-native';

/**
 * The camera permission on a camera screen. The user asked for the camera by opening it, so a
 * permission the system hasn't asked about yet is asked right away; and it is read again when the
 * app comes back, since access may have been granted in the system settings meanwhile.
 */
export function useCameraScreenPermission() {
  const [permission, requestPermission, getPermission] = useCameraPermissions();

  const status = permission?.status;
  useEffect(() => {
    if (status === PermissionStatus.UNDETERMINED) requestPermission();
  }, [status, requestPermission]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') getPermission();
    });
    return () => sub.remove();
  }, [getPermission]);

  return [permission, requestPermission] as const;
}

import { Platform } from 'react-native';

/** The platform as the database stores it (`public.platform`); null in the web preview. */
export const devicePlatform =
  Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : null;

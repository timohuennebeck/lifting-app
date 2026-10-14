import { createQueryKeys } from '@lukemorales/query-key-factory';

/** Photo keys; check rows use the core `queryKeys.progressChecks`. */
export const progressCheckPhotoKeys = createQueryKeys('progressCheckPhotos', {
  list: null,
  signedUrl: (storagePath: string) => [storagePath],
});

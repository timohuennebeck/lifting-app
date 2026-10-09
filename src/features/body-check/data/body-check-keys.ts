import { createQueryKeys } from '@lukemorales/query-key-factory';

/** Photo keys; check rows use the core `queryKeys.bodyChecks`. */
export const bodyCheckPhotoKeys = createQueryKeys('bodyCheckPhotos', {
  list: null,
  pendingCount: (userId: string) => [userId],
  signedUrl: (storagePath: string) => [storagePath],
});

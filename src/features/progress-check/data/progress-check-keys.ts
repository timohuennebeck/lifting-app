import { createQueryKeys } from '@lukemorales/query-key-factory';

/** The check rows, their photo rows and the signed URLs of uploaded photos. */
export const progressCheckKeys = createQueryKeys('progressChecks', {
  list: null,
  photos: null,
  signedUrl: (storagePath: string) => [storagePath],
});

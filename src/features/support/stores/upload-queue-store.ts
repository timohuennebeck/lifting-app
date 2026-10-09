import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@/shared/lib/storage';

interface UploadQueueState {
  /** Bucket paths whose local copy still has to be uploaded. */
  pending: string[];
  enqueue: (paths: string[]) => void;
  done: (path: string) => void;
  reset: () => void;
}

/** Screenshots saved with a message but not uploaded yet; survives app restarts. */
export const useUploadQueueStore = create<UploadQueueState>()(
  persist(
    (set) => ({
      pending: [],
      enqueue: (paths) =>
        set((s) => ({ pending: [...s.pending, ...paths.filter((p) => !s.pending.includes(p))] })),
      done: (path) => set((s) => ({ pending: s.pending.filter((p) => p !== path) })),
      reset: () => set({ pending: [] }),
    }),
    { name: 'support-uploads', storage: createJSONStorage(() => zustandStorage) },
  ),
);

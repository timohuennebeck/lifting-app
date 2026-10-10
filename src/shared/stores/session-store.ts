import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

interface SessionState {
  session: Session | null;
  /** True once the persisted session has been read on launch. */
  ready: boolean;
  /**
   * Signed in by a password reset code but no new password chosen yet: the app stays on the
   * reset flow until it is.
   */
  recovering: boolean;
  setSession: (session: Session | null) => void;
  setRecovering: (recovering: boolean) => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  session: null,
  ready: false,
  recovering: false,
  setSession: (session) => set({ session, ready: true }),
  setRecovering: (recovering) => set({ recovering }),
}));

export const useUserId = () => useSessionStore((s) => s.session?.user.id ?? null);

/** For non-React code paths (mutations); throws when signed out. */
export function requireUserId(): string {
  const id = useSessionStore.getState().session?.user.id;
  if (!id) throw new Error('Not signed in');
  return id;
}

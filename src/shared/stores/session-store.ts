import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

interface SessionState {
  session: Session | null;
  /** True once the persisted session has been read on launch. */
  ready: boolean;
  setSession: (session: Session | null) => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  session: null,
  ready: false,
  setSession: (session) => set({ session, ready: true }),
}));

export const useUserId = () => useSessionStore((s) => s.session?.user.id ?? null);

/** For non-React code paths (mutations); throws when signed out. */
export function requireUserId(): string {
  const id = useSessionStore.getState().session?.user.id;
  if (!id) throw new Error('Not signed in');
  return id;
}

import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { storedSession } from '@/shared/data/supabase';

interface SessionState {
  /** The signed-in session; at launch the one saved on the device (see storedSession). */
  session: Session | null;
  setSession: (session: Session | null) => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  session: storedSession(),
  setSession: (session) => set({ session }),
}));

export const useUserId = () => useSessionStore((s) => s.session?.user.id ?? null);

/** For non-React code paths (mutations); throws when signed out. */
export function requireUserId(): string {
  const id = useSessionStore.getState().session?.user.id;
  if (!id) throw new Error('Not signed in');
  return id;
}

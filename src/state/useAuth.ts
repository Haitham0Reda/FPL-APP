/**
 * Auth store — user identity + Pro subscription state.
 *
 * Phase 0 wires this up to the local user record created during
 * onboarding (Team ID import + manual). Phase 1 swaps in the
 * Firebase/Auth0/Supabase auth layer per PRD §6.2.
 */
import { create } from "zustand";

import type { User } from "../types/domain";

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  signOut: () => set({ user: null }),
}));

export const useUser = (): User | null => useAuthStore((s) => s.user);
export const useIsPro = (): boolean => useAuthStore((s) => !!s.user?.isPro);

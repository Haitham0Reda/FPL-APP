/**
 * src/state/useAuthStore.ts
 *
 * "Login" for this app = the user's FPL Team ID, persisted locally.
 * No password is ever collected or stored — see docs/fpl-api-notes.md.
 *
 * The user finds their Team ID in the URL when viewing their team on
 * fantasy.premierleague.com/entry/{TEAM_ID}/event/{gw}
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
export const useAuthStore = create()(persist(set => ({
  teamId: null,
  isLoggedIn: false,
  setTeamId: teamId => set({
    teamId,
    isLoggedIn: true
  }),
  logout: () => set({
    teamId: null,
    isLoggedIn: false
  })
}), {
  name: 'elite-fpl-auth',
  storage: createJSONStorage(() => AsyncStorage)
}));
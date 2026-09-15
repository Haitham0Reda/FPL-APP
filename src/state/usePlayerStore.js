/**
 * Player/team/fixture data store.
 *
 * Single source of truth for all FPL reference data fetched from the API.
 * Persisted to AsyncStorage so the app can boot offline after first launch.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBootstrap, getFixtures } from '@/data/fpl/client';
import { useCurrentGameweekStore } from './useCurrentGameweek';

const store = (set, get) => ({
  // Raw API payloads
  bootstrapData: null,
  fixtures: [],
  events: [],

  // Derived lookup maps (populated by bootstrap())
  playersById: {},
  teamsById: {},
  fixturesByTeam: {},
  fixturesByGameweek: {},

  // Status
  status: 'idle', // idle | loading | ready | error
  error: null,
  lastUpdated: null,

  bootstrap: async () => {
    const state = get();
    if (state.status === 'loading') return;

    set({ status: 'loading', error: null });

    try {
      const [bootstrapData, fixturesData] = await Promise.all([
        getBootstrap(),
        getFixtures(),
      ]);

      const playersById = {};
      bootstrapData.elements.forEach(p => {
        playersById[String(p.id)] = p;
      });

      const teamsById = {};
      bootstrapData.teams.forEach(t => {
        teamsById[String(t.id)] = t;
      });

      const fixturesByTeam = {};
      const fixturesByGameweek = {};
      fixturesData.forEach(f => {
        const gw = String(f.event);
        if (!fixturesByGameweek[gw]) fixturesByGameweek[gw] = [];
        fixturesByGameweek[gw].push(f);

        const homeId = String(f.team_h);
        const awayId = String(f.team_a);
        if (!fixturesByTeam[homeId]) fixturesByTeam[homeId] = [];
        if (!fixturesByTeam[awayId]) fixturesByTeam[awayId] = [];
        fixturesByTeam[homeId].push(f);
        fixturesByTeam[awayId].push(f);
      });

      set({
        bootstrapData,
        fixtures: fixturesData,
        events: bootstrapData.events || [],
        playersById,
        teamsById,
        fixturesByTeam,
        fixturesByGameweek,
        status: 'ready',
        error: null,
        lastUpdated: Date.now(),
      });

      // Seed the shared "selected gameweek" store from real bootstrap data
      // once, so the top-bar GW stepper and every screen scoped to it start
      // on the actual current/next gameweek instead of a hardcoded GW1.
      const gwState = useCurrentGameweekStore.getState();
      if (!gwState.initializedFromApi) {
        const events = bootstrapData.events || [];
        const seedEvent = events.find(e => e.is_current) || events.find(e => e.is_next);
        if (seedEvent) {
          useCurrentGameweekStore.setState({ gameweek: seedEvent.id, initializedFromApi: true });
        }
      }
    } catch (err) {
      set({
        status: 'error',
        error: err.message || 'Failed to load FPL data',
      });
      throw err;
    }
  },

  clear: () => set({
    bootstrapData: null,
    fixtures: [],
    events: [],
    playersById: {},
    teamsById: {},
    fixturesByTeam: {},
    fixturesByGameweek: {},
    status: 'idle',
    error: null,
    lastUpdated: null,
  }),
});

const usePlayerStore = create(persist(store, {
  name: 'elite-fpl-player-data',
  storage: createJSONStorage(() => AsyncStorage),
  version: 2,
  migrate: (persistedState, version) => {
    if (version < 2) return { ...persistedState, status: 'idle' };
    return persistedState;
  },
}));

export { usePlayerStore };

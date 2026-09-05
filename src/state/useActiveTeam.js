/**
 * Active team store.
 *
 * Holds the user's currently-focused Team (or Draft) across all screens.
 * The team switcher in the top bar mutates this; SquadScreen, CompareScreen,
 * and LiveScreen all read from it.
 *
 * In Phase 0 the source of truth is the local WatermelonDB / SQLite layer
 * — wire up a real `loadActiveTeam` query from `data/fpl/teams.ts` here.
 */
import { create } from "zustand";
export const useActiveTeamStore = create(set => ({
  team: null,
  setTeam: team => set({
    team
  })
}));

/** Selector hook — stable across renders. */
export const useActiveTeam = () => useActiveTeamStore(s => s.team);
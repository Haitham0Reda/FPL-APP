/**
 * Current gameweek store.
 *
 * The top-bar GW stepper (PRD §3) mutates this. The Captain tab,
 * Fixtures tab, and Planner all read from it to scope their queries.
 *
 * Bounds enforcement (min=1, max=38) lives here so individual screens
 * don't have to validate.
 */
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
const MIN_GW = 1;
const MAX_GW = 38;
export const useCurrentGameweekStore = create(set => ({
  gameweek: 1,
  // Flips true the first time we seed `gameweek` from real bootstrap data
  // (see usePlayerStore.bootstrap()), so that seed only happens once and
  // never clobbers the user's manual stepper navigation afterwards.
  initializedFromApi: false,
  setGameweek: gw => {
    const clamped = Math.max(MIN_GW, Math.min(MAX_GW, Math.round(gw)));
    set({
      gameweek: clamped
    });
  }
}));

/**
 * Returns a stable `{ gameweek, setGameweek }` object.
 * `useShallow` ensures the returned reference only changes when one of the
 * selected fields actually changes — without it, every render would produce
 * a fresh object and force a re-render of every consumer.
 */
export const useCurrentGameweek = () => useCurrentGameweekStore(useShallow(s => ({
  gameweek: s.gameweek,
  setGameweek: s.setGameweek
})));
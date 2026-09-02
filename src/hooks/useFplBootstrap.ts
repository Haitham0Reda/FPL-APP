/**
 * Hook for accessing FPL bootstrap-static data.
 * 
 * This is the PRIMARY data source for the app — contains all players, teams,
 * gameweeks, and game settings. Cache it aggressively and refresh strategically.
 * 
 * REFRESH STRATEGY:
 *   • On app launch (automatic via TanStack Query)
 *   • On pull-to-refresh (call refetch())
 *   • Every 5-10 minutes during price-change windows (~1:30 AM GMT)
 *   • After gameweek deadline passes
 * 
 * USAGE:
 *   const { data, isLoading, error, refetch } = useFplBootstrap();
 *   const players = data?.elements ?? [];
 *   const teams = data?.teams ?? [];
 *   const currentGameweek = data?.events.find(e => e.is_current);
 */

import { useQuery } from "@tanstack/react-query";
import { fplApi, fplQueryKeys } from "../data/fpl/client";

export const useFplBootstrap = () => {
  return useQuery({
    queryKey: fplQueryKeys.bootstrap(),
    queryFn: fplApi.bootstrap,
    // Cache for 5 minutes — bootstrap data changes slowly except during price windows
    staleTime: 5 * 60 * 1000,
    // Keep in cache for 30 minutes even when unmounted
    gcTime: 30 * 60 * 1000,
    // Retry on errors (exponential backoff handled by queryClient)
    retry: true,
    // Refetch on window focus (when user returns to app)
    refetchOnWindowFocus: true,
    // Don't refetch on mount if data is fresh
    refetchOnMount: false,
  });
};

/**
 * Helper hook to get current gameweek from bootstrap data.
 * Returns the gameweek object marked as `is_current`, or undefined if not found.
 */
export const useCurrentGameweek = () => {
  const { data, ...rest } = useFplBootstrap();
  const currentGameweek = data?.events.find((event) => event.is_current);
  return { gameweek: currentGameweek, ...rest };
};

/**
 * Helper hook to get next gameweek from bootstrap data.
 * Returns the gameweek object marked as `is_next`, or undefined if not found.
 */
export const useNextGameweek = () => {
  const { data, ...rest } = useFplBootstrap();
  const nextGameweek = data?.events.find((event) => event.is_next);
  return { gameweek: nextGameweek, ...rest };
};

/**
 * Helper hook to get all players from bootstrap data.
 * Returns empty array while loading to prevent crashes.
 */
export const useFplPlayers = () => {
  const { data, ...rest } = useFplBootstrap();
  return { players: data?.elements ?? [], ...rest };
};

/**
 * Helper hook to get all teams from bootstrap data.
 * Returns empty array while loading to prevent crashes.
 */
export const useFplTeams = () => {
  const { data, ...rest } = useFplBootstrap();
  return { teams: data?.teams ?? [], ...rest };
};

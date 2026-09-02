/**
 * src/hooks/useFplData.ts
 *
 * React Query hooks over the FPL client. Assumes a QueryClientProvider is
 * already set up in src/app/ (per the scaffold's architecture map).
 */
import type { QueryFunctionContext } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import {
  getBootstrap,
  getFixtures,
  getEntry,
  getEntryPicks,
  getEntryHistory,
  FplApiError,
  type FplEvent,
} from '@/data/fpl/client';
import { useAuthStore } from '@/state/useAuth';

/** All players/teams/gameweeks. Long staleTime — this barely changes
 *  intra-day and is the heaviest payload, so don't refetch aggressively. */
export function useBootstrap() {
  return useQuery({
    queryKey: ['fpl', 'bootstrap'],
    queryFn: ({ signal }: QueryFunctionContext) => getBootstrap(signal),
    staleTime: 1000 * 60 * 30, // 30 min
  });
}

export function useFixtures(eventId?: number) {
  return useQuery({
    queryKey: ['fpl', 'fixtures', eventId ?? 'all'],
    queryFn: ({ signal }: QueryFunctionContext) => getFixtures(eventId, signal),
    staleTime: 1000 * 60 * 10,
  });
}

/** Convenience: derive the current gameweek from bootstrap events. */
export function useCurrentGameweek() {
  const { data, ...rest } = useBootstrap();
  const currentEvent = data?.events.find((e: FplEvent) => e.is_current) ?? data?.events.find((e: FplEvent) => e.is_next);
  return { currentEvent, ...rest };
}

/** The logged-in user's team profile (name, rank, points). */
export function useMyEntry() {
  const teamId = useAuthStore((s: { teamId: number | null }) => s.teamId);

  return useQuery({
    queryKey: ['fpl', 'entry', teamId],
    queryFn: ({ signal }: QueryFunctionContext) => {
      if (!teamId) throw new Error('No team ID set — user is not logged in.');
      return getEntry(teamId, signal);
    },
    enabled: teamId !== null,
    staleTime: 1000 * 60 * 5,
    retry: (failureCount: number, error: Error) => {
      // Don't retry on 404 — that means the team ID itself is invalid.
      if (error instanceof FplApiError && error.status === 404) return false;
      return failureCount < 2;
    },
  });
}

/** The logged-in user's squad/picks for a specific gameweek. */
export function useMyPicks(eventId: number | undefined) {
  const teamId = useAuthStore((s: { teamId: number | null }) => s.teamId);

  return useQuery({
    queryKey: ['fpl', 'entry', teamId, 'picks', eventId],
    queryFn: ({ signal }: QueryFunctionContext) => {
      if (!teamId || !eventId) throw new Error('Missing team ID or event ID.');
      return getEntryPicks(teamId, eventId, signal);
    },
    enabled: teamId !== null && eventId !== undefined,
    staleTime: 1000 * 60 * 5,
  });
}

/** The logged-in user's season history (points per gameweek, chips used). */
export function useMyHistory() {
  const teamId = useAuthStore((s: { teamId: number | null }) => s.teamId);

  return useQuery({
    queryKey: ['fpl', 'entry', teamId, 'history'],
    queryFn: ({ signal }: QueryFunctionContext) => {
      if (!teamId) throw new Error('No team ID set.');
      return getEntryHistory(teamId, signal);
    },
    enabled: teamId !== null,
    staleTime: 1000 * 60 * 15,
  });
}

/** Validate a team ID exists before saving it as "logged in" (used on the
 *  login/onboarding screen — call this on submit, not automatically). */
export async function validateTeamId(teamId: number): Promise<boolean> {
  try {
    await getEntry(teamId);
    return true;
  } catch (err) {
    if (err instanceof FplApiError && err.status === 404) return false;
    throw err; // network/other errors bubble up so the UI can show a retry
  }
}
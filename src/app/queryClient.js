/**
 * TanStack Query client — server-state cache.
 * PRD §6.1: "TanStack Query for server-state, caching, background refetch".
 *
 * Defaults here are tuned for an FPL-style workload:
 *   • staleTime 60s for hot endpoints (live points, fixtures)
 *   • bootstrap-static should be cached more aggressively (see hook usage)
 *   • retry with exponential backoff up to 3 attempts
 *
 * REFRESH STRATEGY:
 *   • bootstrap-static: Poll on app launch, pull-to-refresh, or every 5-10 minutes
 *     during price-change windows (typically 1:30 AM GMT)
 *   • Live data: Poll frequently during matches (every 30-60s)
 *   • Manager picks: Cache per gameweek, refresh on demand
 */
import { QueryClient } from "@tanstack/react-query";
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: (failureCount, error) => {
        // Don't retry on 4xx — only transient 5xx / timeout.
        const message = error?.message ?? "";
        if (/\b(4\d\d)\b/.test(message)) return false;
        return failureCount < 3;
      },
      retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30_000),
      refetchOnWindowFocus: true,
      networkMode: "offlineFirst"
    },
    mutations: {
      retry: 0
    }
  }
});
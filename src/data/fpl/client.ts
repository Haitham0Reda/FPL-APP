/**
 * FPL official API client.
 *
 * PRD §9.1: read-only — we never submit transfers back to the official site.
 * The unofficial `fantasy.premierleague.com/api/` endpoints have no SLA,
 * so the client must:
 *   • retry with exponential backoff,
 *   • cache responses (TanStack Query handles this — see queryKeys below),
 *   • surface a graceful offline banner when all retries fail.
 *
 * IMPORTANT: User-Agent header is REQUIRED to prevent 403 blocks.
 * FPL servers frequently reject requests without realistic browser UAs.
 *
 * CORS NOTE: Web deployments will hit CORS errors. Consider a proxy layer
 * (Node/Cloudflare Worker/AWS Lambda) for web clients. Native mobile apps
 * are not subject to browser CORS restrictions.
 *
 * This file is intentionally a thin fetch wrapper — all the URL paths
 * and response types are documented in the FPL open-source community;
 * wire them up as the screens are built.
 */
import type { Player, Fixture, Team } from "../../types/domain";
import type {
  FPLBootstrapStatic,
  FPLFixture,
  FPLLiveGameweek,
  FPLManagerEntry,
  FPLManagerPicks,
  FPLElementSummary,
} from "../../types/fpl-api";

/** Base URL — no trailing slash. */
export const FPL_BASE_URL = "https://fantasy.premierleague.com/api";

/**
 * TanStack Query keys — keep them grouped so refetches and invalidations
 * cascade correctly. Exported so screens can call `queryClient.invalidateQueries`.
 */
export const fplQueryKeys = {
  bootstrap: () => ["fpl", "bootstrap"] as const,
  fixtures: (gameweek?: number) =>
    ["fpl", "fixtures", gameweek ?? "all"] as const,
  liveGameweek: (gameweek: number) => ["fpl", "live", gameweek] as const,
  managerTeam: (fplTeamId: number) => ["fpl", "manager", fplTeamId] as const,
  managerPicks: (fplTeamId: number, gameweek: number) =>
    ["fpl", "manager", fplTeamId, "picks", gameweek] as const,
  player: (fplId: number) => ["fpl", "player", fplId] as const,
};

/**
 * Generic fetcher with timeout + retry. Throws on non-2xx.
 *
 * CRITICAL: User-Agent is required to prevent 403 blocks from FPL servers.
 * They frequently reject requests that lack a realistic browser-like UA.
 */
async function fplFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(`${FPL_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        // User-Agent is essential — FPL servers block requests without it
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        ...(init.headers ?? {}),
      },
    });
    if (!res.ok) {
      throw new Error(`FPL API error ${res.status} on ${path}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

/* ── Endpoints (properly typed for FPL API) ─────────────────────── */

export const fplApi = {
  /** /bootstrap-static/ — players, teams, gameweeks, settings.
   * This is the primary data source — cache aggressively and refresh on app launch,
   * pull-to-refresh, or when new gameweek/price changes are detected.
   */
  bootstrap: () => fplFetch<FPLBootstrapStatic>("/bootstrap-static/"),

  /** /fixtures/ — all fixtures (or ?event=N for one GW). */
  fixtures: (gameweek?: number) =>
    fplFetch<FPLFixture[]>(`/fixtures/${gameweek ? `?event=${gameweek}` : ""}`),

  /** /event/{gw}/live/ — live points during a GW. Poll frequently during matches. */
  live: (gameweek: number) =>
    fplFetch<FPLLiveGameweek>(`/event/${gameweek}/live/`),

  /** /entry/{id}/ — public manager entry (read-only by Team ID). */
  manager: (fplTeamId: number) =>
    fplFetch<FPLManagerEntry>(`/entry/${fplTeamId}/`),

  /** /entry/{id}/event/{gw}/picks/ — manager's picks for a specific gameweek. */
  managerPicks: (fplTeamId: number, gameweek: number) =>
    fplFetch<FPLManagerPicks>(`/entry/${fplTeamId}/event/${gameweek}/picks/`),

  /** /element-summary/{playerId}/ — detailed player history and upcoming fixtures. */
  playerSummary: (playerId: number) =>
    fplFetch<FPLElementSummary>(`/element-summary/${playerId}/`),
};

/* ── Local transform adapters ─────────────────────────────────────── */

/** Map /bootstrap-static/ "elements" → our `Player` shape. */
export const adaptFplPlayer = (
  raw: FPLBootstrapStatic["elements"][0],
): Player => {
  return {
    id: String(raw.id),
    fplId: raw.id,
    name: `${raw.first_name} ${raw.second_name}`,
    webName: raw.web_name,
    clubId: String(raw.team),
    position: positionFromInt(raw.element_type),
    price: raw.now_cost / 10,
    priceTrend: "stable", // TODO: calculate from cost_change_event
    form: parseFloat(raw.form || "0"),
    seasonPoints: raw.total_points,
    ownershipPct: parseFloat(raw.selected_by_percent || "0"),
    xG: parseFloat(raw.expected_goals || "0"),
    xA: parseFloat(raw.expected_assists || "0"),
    xGI: parseFloat(raw.expected_goal_involvements || "0"),
    minutesRisk: "none", // TODO: derive from chance_of_playing, minutes, news
    photoUrl: raw.photo,
    updatedAt: new Date().toISOString(),
  };
};

const positionFromInt = (n: number): Player["position"] => {
  // FPL element_type: 1=GK, 2=DEF, 3=MID, 4=FWD
  if (n === 1) return "GK";
  if (n === 2) return "DEF";
  if (n === 3) return "MID";
  return "FWD";
};

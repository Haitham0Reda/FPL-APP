/**
 * src/data/fpl/client.ts
 *
 * Thin, typed client over the official (unofficial/undocumented) FPL public
 * API. No login/password required — "login" in this app means the user
 * enters their FPL Team ID (visible in the URL when they view their team
 * on fantasy.premierleague.com), and we pull everything from public,
 * read-only endpoints.
 *
 * Base host: https://fantasy.premierleague.com/api
 *
 * NOTE: This is an unofficial API — there's no versioning guarantee and
 * fields can change without notice. Keep parsing defensive (optional
 * chaining / fallback defaults) rather than assuming shape stability.
 */

const BASE_URL = 'https://fantasy.premierleague.com/api';

// ---------------------------------------------------------------------------
// Low-level fetch helper
// ---------------------------------------------------------------------------

class FplApiError extends Error {
  status: number;
  endpoint: string;

  constructor(message: string, status: number, endpoint: string) {
    super(message);
    this.name = 'FplApiError';
    this.status = status;
    this.endpoint = endpoint;
  }
}

async function fplFetch<T>(path: string, signal?: AbortSignal): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const init: RequestInit = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      // FPL's API sometimes 403s requests without a UA-like header.
      'User-Agent': 'EliteFPL/1.0',
    },
  };

  if (signal) {
    init.signal = signal;
  }

  const response = await fetch(url, init);

  if (!response.ok) {
    throw new FplApiError(
      `FPL API request failed: ${response.status} ${response.statusText}`,
      response.status,
      path
    );
  }

  return (await response.json()) as T;
}

// ---------------------------------------------------------------------------
// Domain types (trim/extend against src/types/domain.ts as needed)
// ---------------------------------------------------------------------------

export interface FplEvent {
  id: number;
  name: string; // "Gameweek 5"
  deadline_time: string; // ISO
  finished: boolean;
  is_current: boolean;
  is_next: boolean;
  average_entry_score: number;
  highest_score: number | null;
}

export interface FplTeam {
  id: number;
  name: string;
  short_name: string;
  strength: number;
}

export interface FplElementType {
  id: number; // 1=GKP, 2=DEF, 3=MID, 4=FWD
  singular_name_short: string; // "GKP", "DEF", "MID", "FWD"
}

export interface FplPlayer {
  id: number;
  first_name: string;
  second_name: string;
  web_name: string;
  team: number; // FplTeam.id
  element_type: number; // FplElementType.id
  now_cost: number; // tenths, e.g. 125 = £12.5m
  total_points: number;
  form: string;
  selected_by_percent: string;
  status: string; // 'a' available, 'i' injured, 'd' doubtful, 's' suspended, 'u' unavailable
  news: string;
  chance_of_playing_next_round: number | null;
}

export interface FplBootstrap {
  events: FplEvent[];
  teams: FplTeam[];
  element_types: FplElementType[];
  elements: FplPlayer[];
}

export interface FplFixture {
  id: number;
  event: number | null;
  team_h: number;
  team_a: number;
  team_h_difficulty: number;
  team_a_difficulty: number;
  kickoff_time: string | null;
  finished: boolean;
  team_h_score: number | null;
  team_a_score: number | null;
}

export interface FplEntrySummary {
  id: number;
  player_first_name: string;
  player_last_name: string;
  name: string; // team name
  summary_overall_points: number;
  summary_overall_rank: number;
  summary_event_points: number;
  summary_event_rank: number | null;
  current_event: number;
}

export interface FplPick {
  element: number; // player id
  position: number;
  multiplier: number; // 0 bench, 1 starter, 2 captain, 3 triple captain
  is_captain: boolean;
  is_vice_captain: boolean;
}

export interface FplEntryPicksResponse {
  active_chip: string | null;
  entry_history: {
    event: number;
    points: number;
    total_points: number;
    rank: number | null;
    overall_rank: number;
    bank: number;
    value: number;
    event_transfers: number;
    event_transfers_cost: number;
  };
  picks: FplPick[];
}

// ---------------------------------------------------------------------------
// Public endpoints
// ---------------------------------------------------------------------------

/** All players, teams, gameweeks, element types. The single biggest payload
 *  — fetch once, cache aggressively (this changes maybe a few times a day). */
export function getBootstrap(signal?: AbortSignal): Promise<FplBootstrap> {
  return fplFetch<FplBootstrap>('/bootstrap-static/', signal);
}

/** All fixtures for the season. Pass eventId to filter to one gameweek. */
export function getFixtures(
  eventId?: number,
  signal?: AbortSignal
): Promise<FplFixture[]> {
  const qs = eventId ? `?event=${eventId}` : '';
  return fplFetch<FplFixture[]>(`/fixtures/${qs}`, signal);
}

/** Detailed history + upcoming fixtures for a single player. */
export function getPlayerSummary(playerId: number, signal?: AbortSignal) {
  return fplFetch<{
    fixtures: FplFixture[];
    history: Record<string, unknown>[];
    history_past: Record<string, unknown>[];
  }>(`/element-summary/${playerId}/`, signal);
}

/** A manager's team profile — name, overall rank/points. This is the
 *  "login" call: given a team ID, confirm it's real and pull headline data. */
export function getEntry(
  teamId: number,
  signal?: AbortSignal
): Promise<FplEntrySummary> {
  return fplFetch<FplEntrySummary>(`/entry/${teamId}/`, signal);
}

/** A manager's picks (squad + captain + bench) for a given gameweek. */
export function getEntryPicks(
  teamId: number,
  eventId: number,
  signal?: AbortSignal
): Promise<FplEntryPicksResponse> {
  return fplFetch<FplEntryPicksResponse>(
    `/entry/${teamId}/event/${eventId}/picks/`,
    signal
  );
}

/** A manager's gameweek-by-gameweek history for the season. */
export function getEntryHistory(teamId: number, signal?: AbortSignal) {
  return fplFetch<{
    current: Record<string, unknown>[];
    past: Record<string, unknown>[];
    chips: Record<string, unknown>[];
  }>(`/entry/${teamId}/history/`, signal);
}

export { FplApiError };
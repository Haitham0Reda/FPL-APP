/**
 * src/data/fpl/client.js
 *
 * Thin client over the official (unofficial/undocumented) FPL public API.
 * No login/password required — "login" in this app means the user enters
 * their FPL Team ID.
 *
 * Base host: https://fantasy.premierleague.com/api
 *
 * NOTE: This is an unofficial API — there's no versioning guarantee and
 * fields can change without notice. Keep parsing defensive.
 */

const BASE_URL = 'https://fantasy.premierleague.com/api';

// ---------------------------------------------------------------------------
// Low-level fetch helper with simple in-memory cache + TTL
// ---------------------------------------------------------------------------

const cache = new Map();

async function fplFetch(path, signal, ttlMs = 0) {
  const url = `${BASE_URL}${path}`;

  if (ttlMs > 0 && cache.has(url)) {
    const cached = cache.get(url);
    if (Date.now() - cached.ts < ttlMs) {
      return cached.data;
    }
    cache.delete(url);
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'User-Agent': 'EliteFPL/1.0',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`FPL API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (ttlMs > 0) {
    cache.set(url, { data, ts: Date.now() });
  }

  return data;
}

// ---------------------------------------------------------------------------
// Public endpoints
// ---------------------------------------------------------------------------

export function getBootstrap(signal) {
  return fplFetch('/bootstrap-static/', signal, 30 * 60 * 1000);
}

export function getFixtures(eventId, signal) {
  const qs = eventId ? `?event=${eventId}` : '';
  return fplFetch(`/fixtures/${qs}`, signal, 30 * 60 * 1000);
}

export function getPlayerSummary(playerId, signal) {
  return fplFetch(`/element-summary/${playerId}/`, signal);
}

export function getEntry(teamId, signal) {
  return fplFetch(`/entry/${teamId}/`, signal);
}

export function getEntryPicks(teamId, eventId, signal) {
  return fplFetch(`/entry/${teamId}/event/${eventId}/picks/`, signal);
}

export function getEntryHistory(teamId, signal) {
  return fplFetch(`/entry/${teamId}/history/`, signal);
}

export function getEventLive(eventId, signal) {
  return fplFetch(`/event/${eventId}/live/`, signal, 2 * 60 * 1000);
}

export function getLeagueStandings(leagueId, signal) {
  return fplFetch(`/leagues-classic/${leagueId}/standings/`, signal);
}

export function clearCache() {
  cache.clear();
}

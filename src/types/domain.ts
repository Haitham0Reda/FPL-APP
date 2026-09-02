/**
 * Elite FPL — core domain types.
 * Mirrors PRD §7. These types describe the shape of data exchanged
 * between the client, the local DB (WatermelonDB / SQLite), and the
 * backend API. Field names are intentionally FPL-API-aligned (camelCase)
 * so the official /api/ response can be adapted with minimal mapping.
 */

// ── Identity ───────────────────────────────────────────────────

export type Language = "en" | "ar";

export interface User {
  id: string;
  email: string;
  displayName: string;
  language: Language;
  isPro: boolean;
  /** ISO date string. */
  proExpiresAt?: string;
  biometricEnabled: boolean;
  /** ISO date string. */
  createdAt: string;
}

// ── Teams & drafts ─────────────────────────────────────────────

/**
 * A Team is a manager's *logical* FPL identity inside Elite FPL.
 * It may or may not be linked to an official FPL Team ID — manual teams
 * have `fplTeamId = null` (PRD §7 `Team`).
 */
export interface Team {
  id: string;
  userId: string;
  /** null when the team is a fully hypothetical draft parent. */
  fplTeamId?: number;
  /** e.g. "El Samaka", "Zero To Hero". */
  name: string;
  /** Exactly one `isLive: true` Team per User is expected at any time. */
  isLive: boolean;
  overallRank?: number;
  totalPoints?: number;
  /** Team value in £m (e.g. 98.0). */
  value: number;
  /** In The Bank, £m. */
  bank: number;
  currentGameweek: number;
  /** ISO date string. */
  createdAt: string;
  /** ISO date string. */
  updatedAt: string;
}

/**
 * A Draft is a sandboxed variant of a Team used for "what-if" planning.
 * Forks the live squad or starts from scratch. Promotable to live via
 * the §4.1 "This is my real team now" flow.
 */
export interface Draft {
  id: string;
  teamId: string;
  /** e.g. "GW15 Wildcard Draft A". */
  name: string;
  forkedFromLive: boolean;
  squad: SquadPlayer[];
  formation: Formation;
  captainId: string;
  viceCaptainId: string;
  chipsUsed: ChipUsage[];
  notes: DraftNote[];
  /**
   * `local-only` until the next cloud sync round-trip.
   * `conflict` is surfaced with a banner per PRD §4.1.
   */
  syncStatus: "synced" | "local-only" | "conflict";
  createdAt: string;
  updatedAt: string;
}

// ── Players ────────────────────────────────────────────────────

export type Position = "GK" | "DEF" | "MID" | "FWD";

export type PriceTrend = "rising" | "falling" | "stable";

/**
 * Coarse minutes-risk bucket — drives the captain recommendation engine
 * (low/minute-risk players get a multiplier) and the auto-sub logic.
 */
export type MinutesRisk =
  | "none"
  | "rotation"
  | "doubtful"
  | "injured"
  | "suspended";

export interface Player {
  id: string;
  fplId: number;
  name: string;
  /** Display / surname used on the pitch card. */
  webName: string;
  clubId: string;
  position: Position;
  /** £m, e.g. 12.4. */
  price: number;
  priceTrend: PriceTrend;
  /** Last-5 average points per match. */
  form: number;
  seasonPoints: number;
  /** 0–100, global ownership %. */
  ownershipPct: number;
  xG: number;
  xA: number;
  xGI: number;
  /** Expected goals conceded — only meaningful for DEF/GK. */
  xGC?: number;
  minutesRisk: MinutesRisk;
  /** Short human note, e.g. "Knock - 75% to play". */
  newsFlag?: string;
  photoUrl: string;
  updatedAt: string;
}

/**
 * A Player as it sits inside a Team/Draft squad. Distinct from `Player`
 * because squad-specific state (purchase price, bench order, pitch slot)
 * belongs to the squad, not the player.
 */
export interface SquadPlayer {
  playerId: string;
  isStarting: boolean;
  /** 1–4 if on the bench; undefined if in the XI. */
  benchOrder?: number;
  /** Formation slot coordinate on the pitch canvas. */
  pitchPosition?: { x: number; y: number };
  /** For profit/loss tracking across price changes. */
  purchasePrice: number;
}

// ── Formations ─────────────────────────────────────────────────

/**
 * All formations supported by the pitch renderer in v1.
 * Order matches the PRD §4.2 list. Add new ones here and the formation
 * validator in `services/transfers/legality.ts` will enforce shape.
 */
export type Formation =
  | "3-4-3"
  | "3-5-2"
  | "4-4-2"
  | "4-3-3"
  | "5-3-2"
  | "5-4-1"
  | "4-5-1"
  | "5-2-3";

export const ALL_FORMATIONS: readonly Formation[] = [
  "3-4-3",
  "3-5-2",
  "4-4-2",
  "4-3-3",
  "5-3-2",
  "5-4-1",
  "4-5-1",
  "5-2-3",
] as const;

// ── Fixtures ───────────────────────────────────────────────────

export interface Fixture {
  id: string;
  gameweek: number;
  homeClubId: string;
  awayClubId: string;
  /** ISO datetime. */
  kickoff: string;
  /**
   * 1 (easy) – 5 (hard), attack-adjusted per PRD §4.8 Advanced FDR.
   * Distinct from a naive opponent-strength FDR — this is per-side.
   */
  homeFdr: number;
  awayFdr: number;
  isBlank: boolean;
  isDouble: boolean;
}

// ── Predictions ────────────────────────────────────────────────

/**
 * Expected-points projection for a player in a given gameweek.
 * `factors` is surfaced in the UI so recommendations are explainable
 * (PRD §4.6) — never ship a black-box score alone.
 */
export interface XPtsProjection {
  playerId: string;
  gameweek: number;
  xPts: number;
  /** 0–1. */
  startProbability: number;
  modelVersion: string;
  factors: {
    fixtureDifficulty: number;
    formWeight: number;
    underlyingStatsWeight: number;
    minutesRisk: number;
  };
}

// ── Chips ──────────────────────────────────────────────────────

export type ChipKind = "wildcard" | "freehit" | "benchboost" | "triplecaptain";

export interface ChipUsage {
  chip: ChipKind;
  /** null if the chip is still in hand. */
  gameweekUsed?: number;
  available: boolean;
  suggestedWindowStart?: number;
  suggestedWindowEnd?: number;
}

// ── Transfers ──────────────────────────────────────────────────

export interface TransferPlan {
  id: string;
  draftId: string;
  /** 1–8 gameweeks planning horizon (PRD §4.6). */
  horizonGameweeks: number;
  entries: TransferPlanEntry[];
  createdAt: string;
}

export interface TransferPlanEntry {
  gameweek: number;
  transfersIn: string[];
  transfersOut: string[];
  /** Count of -4 hits taken that GW. */
  hitsTaken: number;
  projectedXPts: number;
  freeTransfersAvailable: number;
}

// ── Personalisation ────────────────────────────────────────────

export interface WatchlistItem {
  id: string;
  userId: string;
  playerId: string;
  note?: string;
  /** ISO date string. */
  addedAt: string;
}

export interface DraftNote {
  id: string;
  draftId: string;
  gameweek?: number;
  text: string;
  /** Free-form tags, e.g. ["template", "differential"]. */
  tags: string[];
  createdAt: string;
}

// ── Live / leagues ─────────────────────────────────────────────

export interface MiniLeagueStanding {
  leagueId: string;
  teamId: string;
  managerName: string;
  rank: number;
  lastRank: number;
  liveTotal: number;
  gwPoints: number;
}

export interface PriceChangeAlert {
  playerId: string;
  direction: "rise" | "fall";
  /** 0–1 confidence. */
  confidence: number;
  /** ISO datetime — when the change is expected. */
  predictedAt: string;
}

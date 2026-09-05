/**
 * Elite FPL — core domain types.
 * Mirrors PRD §7. These types describe the shape of data exchanged
 * between the client, the local DB (WatermelonDB / SQLite), and the
 * backend API. Field names are intentionally FPL-API-aligned (camelCase)
 * so the official /api/ response can be adapted with minimal mapping.
 */

// ── Identity ───────────────────────────────────────────────────

/** @typedef {'en' or 'ar'} Language */

/**
 * @typedef {Object} User
 * @property {*} id
 * @property {*} email
 * @property {*} displayName
 * @property {*} language
 * @property {*} isPro
 * @property {*} proExpiresAt (optional)
 * @property {*} biometricEnabled
 * @property {*} createdAt
 */

// ── Teams & drafts ─────────────────────────────────────────────

/**
 * A Team is a manager's *logical* FPL identity inside Elite FPL.
 * It may or may not be linked to an official FPL Team ID — manual teams
 * have `fplTeamId = null` (PRD §7 `Team`).
 */
/**
 * @typedef {Object} Team
 * @property {*} id
 * @property {*} userId
 * @property {*} fplTeamId (optional)
 * @property {*} name
 * @property {*} isLive
 * @property {*} overallRank (optional)
 * @property {*} totalPoints (optional)
 * @property {*} value
 * @property {*} bank
 * @property {*} currentGameweek
 * @property {*} createdAt
 * @property {*} updatedAt
 */

/**
 * A Draft is a sandboxed variant of a Team used for "what-if" planning.
 * Forks the live squad or starts from scratch. Promotable to live via
 * the §4.1 "This is my real team now" flow.
 */
/**
 * @typedef {Object} Draft
 * @property {*} id
 * @property {*} teamId
 * @property {*} name
 * @property {*} forkedFromLive
 * @property {*} squad
 * @property {*} formation
 * @property {*} captainId
 * @property {*} viceCaptainId
 * @property {*} chipsUsed
 * @property {*} notes
 * @property {*} syncStatus - `local-only` until the next cloud sync round-trip. `conflict` is surfaced with a banner per PRD §4.1.
 * @property {*} createdAt
 * @property {*} updatedAt
 */

// ── Players ────────────────────────────────────────────────────

/** @typedef {'GK' or 'DEF' or 'MID' or 'FWD'} Position */

/** @typedef {'rising' or 'falling' or 'stable'} PriceTrend */

/**
 * Coarse minutes-risk bucket — drives the captain recommendation engine
 * (low/minute-risk players get a multiplier) and the auto-sub logic.
 */

/**
 * @typedef {Object} Player
 * @property {*} id
 * @property {*} fplId
 * @property {*} name
 * @property {*} webName
 * @property {*} clubId
 * @property {*} position
 * @property {*} price
 * @property {*} priceTrend
 * @property {*} form
 * @property {*} seasonPoints
 * @property {*} ownershipPct
 * @property {*} xG
 * @property {*} xA
 * @property {*} xGI
 * @property {*} xGC (optional)
 * @property {*} minutesRisk
 * @property {*} newsFlag (optional)
 * @property {*} photoUrl
 * @property {*} updatedAt
 */

/**
 * A Player as it sits inside a Team/Draft squad. Distinct from `Player`
 * because squad-specific state (purchase price, bench order, pitch slot)
 * belongs to the squad, not the player.
 */
/**
 * @typedef {Object} SquadPlayer
 * @property {*} playerId
 * @property {*} isStarting
 * @property {*} benchOrder (optional)
 * @property {*} pitchPosition (optional)
 * @property {*} purchasePrice
 */

// ── Formations ─────────────────────────────────────────────────

/**
 * All formations supported by the pitch renderer in v1.
 * Order matches the PRD §4.2 list. Add new ones here and the formation
 * validator in `services/transfers/legality.ts` will enforce shape.
 */

export const ALL_FORMATIONS = ["3-4-3", "3-5-2", "4-4-2", "4-3-3", "5-3-2", "5-4-1", "4-5-1", "5-2-3"];

// ── Fixtures ───────────────────────────────────────────────────

/**
 * @typedef {Object} Fixture
 * @property {*} id
 * @property {*} gameweek
 * @property {*} homeClubId
 * @property {*} awayClubId
 * @property {*} kickoff
 * @property {*} homeFdr - 1 (easy) – 5 (hard), attack-adjusted per PRD §4.8 Advanced FDR. Distinct from a naive opponent-strength FDR — this is per-side.
 * @property {*} awayFdr
 * @property {*} isBlank
 * @property {*} isDouble
 */

// ── Predictions ────────────────────────────────────────────────

/**
 * Expected-points projection for a player in a given gameweek.
 * `factors` is surfaced in the UI so recommendations are explainable
 * (PRD §4.6) — never ship a black-box score alone.
 */
/**
 * @typedef {Object} XPtsProjection
 * @property {*} playerId
 * @property {*} gameweek
 * @property {*} xPts
 * @property {*} startProbability
 * @property {*} modelVersion
 * @property {*} fixtureDifficulty
 * @property {*} formWeight
 * @property {*} underlyingStatsWeight
 * @property {*} minutesRisk
 */

// ── Chips ──────────────────────────────────────────────────────

/** @typedef {'wildcard' or 'freehit' or 'benchboost' or 'triplecaptain'} ChipKind */

/**
 * @typedef {Object} ChipUsage
 * @property {*} chip
 * @property {*} gameweekUsed (optional)
 * @property {*} available
 * @property {*} suggestedWindowStart (optional)
 * @property {*} suggestedWindowEnd (optional)
 */

// ── Transfers ──────────────────────────────────────────────────

/**
 * @typedef {Object} TransferPlan
 * @property {*} id
 * @property {*} draftId
 * @property {*} horizonGameweeks
 * @property {*} entries
 * @property {*} createdAt
 */

/**
 * @typedef {Object} TransferPlanEntry
 * @property {*} gameweek
 * @property {*} transfersIn
 * @property {*} transfersOut
 * @property {*} hitsTaken
 * @property {*} projectedXPts
 * @property {*} freeTransfersAvailable
 */

// ── Personalisation ────────────────────────────────────────────

/**
 * @typedef {Object} WatchlistItem
 * @property {*} id
 * @property {*} userId
 * @property {*} playerId
 * @property {*} note (optional)
 * @property {*} addedAt
 */

/**
 * @typedef {Object} DraftNote
 * @property {*} id
 * @property {*} draftId
 * @property {*} gameweek (optional)
 * @property {*} text
 * @property {*} tags
 * @property {*} createdAt
 */

// ── Live / leagues ─────────────────────────────────────────────

/**
 * @typedef {Object} MiniLeagueStanding
 * @property {*} leagueId
 * @property {*} teamId
 * @property {*} managerName
 * @property {*} rank
 * @property {*} lastRank
 * @property {*} liveTotal
 * @property {*} gwPoints
 */

/**
 * @typedef {Object} PriceChangeAlert
 * @property {*} playerId
 * @property {*} direction
 * @property {*} confidence
 * @property {*} predictedAt
 */
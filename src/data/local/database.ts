/**
 * Local persistence — WatermelonDB schema bootstrap.
 *
 * The PRD §6.1 stack choice is WatermelonDB or expo-sqlite. We define
 * the schema here for offline squad/draft storage (PRD §6.1, §4.1).
 * Phase 0 wires this up after the screen stubs are approved.
 *
 * Table map:
 *   users          → User
 *   teams          → Team
 *   drafts         → Draft
 *   draft_notes    → DraftNote
 *   watchlist      → WatchlistItem
 *   transfer_plans → TransferPlan
 *   transfer_entries → TransferPlanEntry
 *
 * Player/Fixture data lives in a separate read-only `bootstrap` cache
 * table refreshed from the official FPL API on launch.
 */
import { appSchema, tableSchema } from "@nozbe/watermelondb";

export const databaseSchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: "users",
      columns: [
        { name: "email", type: "string" },
        { name: "display_name", type: "string" },
        { name: "language", type: "string" },
        { name: "is_pro", type: "boolean" },
        { name: "biometric_enabled", type: "boolean" },
        { name: "created_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "teams",
      columns: [
        { name: "user_id", type: "string", isIndexed: true },
        { name: "fpl_team_id", type: "number", isOptional: true },
        { name: "name", type: "string" },
        { name: "is_live", type: "boolean" },
        { name: "overall_rank", type: "number", isOptional: true },
        { name: "total_points", type: "number", isOptional: true },
        { name: "value", type: "number" },
        { name: "bank", type: "number" },
        { name: "current_gameweek", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "drafts",
      columns: [
        { name: "team_id", type: "string", isIndexed: true },
        { name: "name", type: "string" },
        { name: "forked_from_live", type: "boolean" },
        { name: "squad_json", type: "string" },
        { name: "formation", type: "string" },
        { name: "captain_id", type: "string" },
        { name: "vice_captain_id", type: "string" },
        { name: "chips_used_json", type: "string" },
        { name: "sync_status", type: "string" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "draft_notes",
      columns: [
        { name: "draft_id", type: "string", isIndexed: true },
        { name: "gameweek", type: "number", isOptional: true },
        { name: "text", type: "string" },
        { name: "tags_json", type: "string" },
        { name: "created_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "watchlist",
      columns: [
        { name: "user_id", type: "string", isIndexed: true },
        { name: "player_id", type: "string", isIndexed: true },
        { name: "note", type: "string", isOptional: true },
        { name: "added_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "transfer_plans",
      columns: [
        { name: "draft_id", type: "string", isIndexed: true },
        { name: "horizon_gameweeks", type: "number" },
        { name: "entries_json", type: "string" },
        { name: "created_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "bootstrap_cache",
      columns: [
        { name: "key", type: "string", isIndexed: true },
        { name: "payload_json", type: "string" },
        { name: "fetched_at", type: "number" },
      ],
    }),
  ],
});

export const DATABASE_NAME = "elitefpl.db";
export const DATABASE_VERSION = 1;

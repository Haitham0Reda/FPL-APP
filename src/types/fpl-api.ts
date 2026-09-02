/**
 * Official FPL API response types.
 * 
 * Based on https://fantasy.premierleague.com/api/ community documentation.
 * These types represent the raw JSON shapes returned by the API.
 * Adapt them to our domain types using the adapters in client.ts.
 * 
 * Note: The API shape can change slightly between seasons (typically around July/August
 * when new season data goes live). Monitor bootstrap-static in pre-season.
 */

/* ── /bootstrap-static/ ───────────────────────────────────────────── */

export interface FPLBootstrapStatic {
  events: FPLEvent[];
  game_settings: FPLGameSettings;
  phases: FPLPhase[];
  teams: FPLTeam[];
  total_players: number;
  elements: FPLElement[]; // players
  element_stats: FPLElementStat[];
  element_types: FPLElementType[]; // positions: GK, DEF, MID, FWD
}

export interface FPLEvent {
  id: number;
  name: string; // "Gameweek 1"
  deadline_time: string; // ISO timestamp
  average_entry_score: number;
  finished: boolean;
  data_checked: boolean;
  highest_scoring_entry: number | null;
  deadline_time_epoch: number;
  deadline_time_game_offset: number;
  highest_score: number | null;
  is_previous: boolean;
  is_current: boolean;
  is_next: boolean;
  chip_plays: Array<{ chip_name: string; num_played: number }>;
  most_selected: number | null;
  most_transferred_in: number | null;
  top_element: number | null;
  top_element_info: {
    id: number;
    points: number;
  } | null;
  transfers_made: number;
  most_captained: number | null;
  most_vice_captained: number | null;
}

export interface FPLGameSettings {
  league_join_private_max: number;
  league_join_public_max: number;
  league_max_size_public_classic: number;
  league_max_size_public_h2h: number;
  league_max_size_private_h2h: number;
  league_max_ko_rounds_private_h2h: number;
  league_prefix_public: string;
  league_points_h2h_win: number;
  league_points_h2h_lose: number;
  league_points_h2h_draw: number;
  league_ko_first_instead_of_random: boolean;
  cup_start_event_id: number | null;
  cup_stop_event_id: number | null;
  cup_qualifying_method: string | null;
  cup_type: string | null;
  squad_squadplay: number;
  squad_squadsize: number;
  squad_team_limit: number;
  squad_total_spend: number;
  ui_currency_multiplier: number;
  ui_use_special_shirts: boolean;
  ui_special_shirt_exclusions: number[];
  stats_form_days: number;
  sys_vice_captain_enabled: boolean;
  transfers_cap: number;
  transfers_sell_on_fee: number;
  league_h2h_tiebreak_stats: string[];
  timezone: string;
}

export interface FPLPhase {
  id: number;
  name: string; // "Overall"
  start_event: number;
  stop_event: number;
}

export interface FPLTeam {
  code: number;
  draw: number;
  form: null | number;
  id: number;
  loss: number;
  name: string; // "Arsenal"
  played: number;
  points: number;
  position: number;
  short_name: string; // "ARS"
  strength: number;
  team_division: null | string;
  unavailable: boolean;
  win: number;
  strength_overall_home: number;
  strength_overall_away: number;
  strength_attack_home: number;
  strength_attack_away: number;
  strength_defence_home: number;
  strength_defence_away: number;
  pulse_id: number;
}

export interface FPLElement {
  chance_of_playing_next_round: number | null;
  chance_of_playing_this_round: number | null;
  code: number;
  cost_change_event: number;
  cost_change_event_fall: number;
  cost_change_start: number;
  cost_change_start_fall: number;
  dreamteam_count: number;
  element_type: number; // 1=GK, 2=DEF, 3=MID, 4=FWD
  ep_next: string | null; // expected points next GW
  ep_this: string | null;
  event_points: number;
  first_name: string;
  form: string; // avg pts per match (recent)
  id: number;
  in_dreamteam: boolean;
  news: string;
  news_added: string | null; // ISO timestamp
  now_cost: number; // in tenths (e.g., 95 = £9.5m)
  photo: string; // relative path to jpg
  points_per_game: string;
  second_name: string;
  selected_by_percent: string;
  special: boolean;
  squad_number: number | null;
  status: "a" | "d" | "i" | "u" | "s"; // available, doubtful, injured, unavailable, suspended
  team: number; // FPL team ID
  team_code: number;
  total_points: number;
  transfers_in: number;
  transfers_in_event: number;
  transfers_out: number;
  transfers_out_event: number;
  value_form: string;
  value_season: string;
  web_name: string; // short display name
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number; // bonus points system
  influence: string;
  creativity: string;
  threat: string;
  ict_index: string;
  starts: number;
  expected_goals: string;
  expected_assists: string;
  expected_goal_involvements: string;
  expected_goals_conceded: string;
  influence_rank: number;
  influence_rank_type: number;
  creativity_rank: number;
  creativity_rank_type: number;
  threat_rank: number;
  threat_rank_type: number;
  ict_index_rank: number;
  ict_index_rank_type: number;
  corners_and_indirect_freekicks_order: number | null;
  corners_and_indirect_freekicks_text: string;
  direct_freekicks_order: number | null;
  direct_freekicks_text: string;
  penalties_order: number | null;
  penalties_text: string;
  expected_goals_per_90: number;
  saves_per_90: number;
  expected_assists_per_90: number;
  expected_goal_involvements_per_90: number;
  expected_goals_conceded_per_90: number;
  goals_conceded_per_90: number;
  now_cost_rank: number;
  now_cost_rank_type: number;
  form_rank: number;
  form_rank_type: number;
  points_per_game_rank: number;
  points_per_game_rank_type: number;
  selected_rank: number;
  selected_rank_type: number;
  starts_per_90: number;
  clean_sheets_per_90: number;
}

export interface FPLElementStat {
  label: string;
  name: string;
}

export interface FPLElementType {
  id: number;
  plural_name: string; // "Goalkeepers"
  plural_name_short: string; // "GKP"
  singular_name: string; // "Goalkeeper"
  singular_name_short: string; // "GKP"
  squad_select: number; // min required in squad
  squad_min_play: number;
  squad_max_play: number;
  ui_shirt_specific: boolean;
  sub_positions_locked: number[];
  element_count: number;
}

/* ── /fixtures/ ────────────────────────────────────────────────────── */

export interface FPLFixture {
  code: number;
  event: number | null; // gameweek ID
  finished: boolean;
  finished_provisional: boolean;
  id: number;
  kickoff_time: string | null; // ISO timestamp
  minutes: number;
  provisional_start_time: boolean;
  started: boolean;
  team_a: number; // away team FPL ID
  team_a_score: number | null;
  team_h: number; // home team FPL ID
  team_h_score: number | null;
  stats: FPLFixtureStat[];
  team_h_difficulty: number;
  team_a_difficulty: number;
  pulse_id: number;
}

export interface FPLFixtureStat {
  identifier: string; // "goals_scored", "assists", "bonus", etc.
  a: Array<{ value: number; element: number }>; // away players
  h: Array<{ value: number; element: number }>; // home players
}

/* ── /event/{gw}/live/ ─────────────────────────────────────────────── */

export interface FPLLiveGameweek {
  elements: FPLLiveElement[];
}

export interface FPLLiveElement {
  id: number;
  stats: {
    minutes: number;
    goals_scored: number;
    assists: number;
    clean_sheets: number;
    goals_conceded: number;
    own_goals: number;
    penalties_saved: number;
    penalties_missed: number;
    yellow_cards: number;
    red_cards: number;
    saves: number;
    bonus: number;
    bps: number;
    influence: string;
    creativity: string;
    threat: string;
    ict_index: string;
    starts: number;
    expected_goals: string;
    expected_assists: string;
    expected_goal_involvements: string;
    expected_goals_conceded: string;
    total_points: number;
    in_dreamteam: boolean;
  };
  explain: Array<{
    fixture: number;
    stats: Array<{
      identifier: string;
      points: number;
      value: number;
    }>;
  }>;
}

/* ── /entry/{managerId}/ ───────────────────────────────────────────── */

export interface FPLManagerEntry {
  id: number;
  joined_time: string; // ISO timestamp
  started_event: number;
  favourite_team: number | null;
  player_first_name: string;
  player_last_name: string;
  player_region_id: number;
  player_region_name: string;
  player_region_iso_code_short: string;
  player_region_iso_code_long: string;
  summary_overall_points: number;
  summary_overall_rank: number;
  summary_event_points: number;
  summary_event_rank: number;
  current_event: number;
  leagues: {
    classic: Array<{
      id: number;
      name: string;
      short_name: string | null;
      created: string;
      closed: boolean;
      rank: number | null;
      max_entries: number | null;
      league_type: string;
      scoring: string;
      start_event: number;
      entry_can_leave: boolean;
      entry_can_admin: boolean;
      entry_can_invite: boolean;
      has_cup: boolean;
      cup_league: number | null;
      cup_qualified: boolean | null;
      entry_rank: number;
      entry_last_rank: number;
    }>;
    h2h: Array<unknown>; // similar structure
    cup: unknown;
    cup_matches: unknown[];
  };
  name: string;
  name_change_blocked: boolean;
  kit: string | null;
  last_deadline_bank: number;
  last_deadline_value: number;
  last_deadline_total_transfers: number;
}

/* ── /entry/{managerId}/event/{eventId}/picks/ ───────────────────── */

export interface FPLManagerPicks {
  active_chip: string | null; // "bboost", "3xc", "wildcard", "freehit"
  automatic_subs: Array<{
    entry: number;
    element_in: number;
    element_out: number;
    event: number;
  }>;
  entry_history: {
    event: number;
    points: number;
    total_points: number;
    rank: number;
    rank_sort: number;
    overall_rank: number;
    bank: number;
    value: number;
    event_transfers: number;
    event_transfers_cost: number;
    points_on_bench: number;
  };
  picks: Array<{
    element: number; // player FPL ID
    position: number; // 1-15 (1-11 starting, 12-15 bench)
    multiplier: number; // 0, 1, 2 (bench, normal, captain), 3 (triple captain)
    is_captain: boolean;
    is_vice_captain: boolean;
  }>;
}

/* ── /element-summary/{playerId}/ ──────────────────────────────────── */

export interface FPLElementSummary {
  fixtures: Array<{
    id: number;
    code: number;
    team_h: number;
    team_h_score: number | null;
    team_a: number;
    team_a_score: number | null;
    event: number | null;
    finished: boolean;
    minutes: number;
    provisional_start_time: boolean;
    kickoff_time: string | null;
    event_name: string;
    is_home: boolean;
    difficulty: number;
  }>;
  history: Array<{
    element: number;
    fixture: number;
    opponent_team: number;
    total_points: number;
    was_home: boolean;
    kickoff_time: string;
    team_h_score: number;
    team_a_score: number;
    round: number;
    minutes: number;
    goals_scored: number;
    assists: number;
    clean_sheets: number;
    goals_conceded: number;
    own_goals: number;
    penalties_saved: number;
    penalties_missed: number;
    yellow_cards: number;
    red_cards: number;
    saves: number;
    bonus: number;
    bps: number;
    influence: string;
    creativity: string;
    threat: string;
    ict_index: string;
    starts: number;
    expected_goals: string;
    expected_assists: string;
    expected_goal_involvements: string;
    expected_goals_conceded: string;
    value: number;
    transfers_balance: number;
    selected: number;
    transfers_in: number;
    transfers_out: number;
  }>;
  history_past: Array<{
    season_name: string; // "2025/26"
    element_code: number;
    start_cost: number;
    end_cost: number;
    total_points: number;
    minutes: number;
    goals_scored: number;
    assists: number;
    clean_sheets: number;
    goals_conceded: number;
    own_goals: number;
    penalties_saved: number;
    penalties_missed: number;
    yellow_cards: number;
    red_cards: number;
    saves: number;
    bonus: number;
    bps: number;
    influence: string;
    creativity: string;
    threat: string;
    ict_index: string;
    starts: number;
    expected_goals: string;
    expected_assists: string;
    expected_goal_involvements: string;
    expected_goals_conceded: string;
  }>;
}

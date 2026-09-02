/**
 * Navigation route param types.
 * Centralized so screens, links, and deep-link configs all agree.
 */

import type { NavigatorScreenParams } from "@react-navigation/native";

// ── Root bottom tabs ───────────────────────────────────────────

/**
 * "My Team" contains a horizontal sub-tab strip — defined here so the
 * top-bar persistent header (PRD §3) can address them.
 */
export type MyTeamStackParamList = {
  Squad: undefined;
  Fixtures: undefined;
  Captain: undefined;
  Chips: undefined;
  Transfers: undefined;
  Compare: undefined;
  Research: undefined;
  Strategy: undefined;
};

export type RootTabParamList = {
  Home: undefined;
  MyTeam: NavigatorScreenParams<MyTeamStackParamList>;
  Live: undefined;
  Workbook: undefined;
  Profile: undefined;
};

/** Stack pushed modally over the tab bar (onboarding, paywall, player sheet). */
export type RootStackParamList = {
  Tabs: NavigatorScreenParams<RootTabParamList>;
  Onboarding: undefined;
  AddTeam: undefined;
  Paywall: {
    trigger: "third-draft" | "solver" | "workbook" | "multi-gw-planner";
  };
  PlayerDetail: { playerId: string; squadPlayerIds: string[] };
  DraftPicker: { teamId: string };
  SharePreview: { teamId: string; draftId?: string };
};

// Augment React Navigation's global namespace for type-safe `useNavigation`.
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

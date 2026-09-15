/**
 * Persistent top bar inside "My Team" (PRD §3):
 *   • team switcher (avatar + name + chevron)
 *   • Team Value pill (£XX.Xm)
 *   • In The Bank pill (ITB)
 *   • Gameweek selector (chevron stepper + "GW12" label)
 *
 * The bars are surfaced as separate <Pill /> primitives in
 * `components/primitives/Pill.tsx`. Read-side data is wired through
 * `useTeamStore().getActiveTeam()` and the `useCurrentGameweek()` hook
 * (Zustand stores under `state/`).
 */
import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "../components/primitives/Text";
import { spacing } from "../theme";
import { useTeamStore } from "../state/useTeamStore";
import { useCurrentGameweek } from "../state/useCurrentGameweek";
import { triggerHaptic } from "../services/haptic";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MIN_GW = 1;
const MAX_GW = 38;
export const MyTeamTopBar = () => {
  const insets = useSafeAreaInsets();
  const team = useTeamStore(s => s.getActiveTeam());
  const { gameweek, setGameweek } = useCurrentGameweek();

  const handlePrevGW = () => {
    if (gameweek > MIN_GW) {
      triggerHaptic("selection");
      setGameweek(gameweek - 1);
    }
  };

  const handleNextGW = () => {
    if (gameweek < MAX_GW) {
      triggerHaptic("selection");
      setGameweek(gameweek + 1);
    }
  };

  const canGoPrev = gameweek > MIN_GW;
  const canGoNext = gameweek < MAX_GW;

  return (
    <View className="bg-secondary px-3 pb-2 gap-3" style={{ paddingTop: Math.max(insets.top, spacing.md) }}>
      {/* Top Controls Row */}
      <View className="flex-row justify-between gap-3">
        <Pressable className="flex-[1.5] flex-row items-center justify-between bg-surface px-3 py-2 rounded-lg border border-border active:bg-surface-raised">
          <Text className="text-text-primary text-base font-bold">{team?.name ?? "No team"}</Text>
          <Text className="text-text-secondary text-lg font-bold">⌄</Text>
        </Pressable>

        <View className="flex-1 flex-row items-center bg-surface rounded-lg border border-border">
          <Pressable onPress={handlePrevGW} disabled={!canGoPrev} className="flex-1 items-center justify-center h-10">
            <Text className={`text-[22px] font-light ${canGoPrev ? "text-text-primary" : "text-text-secondary opacity-30"}`}>‹</Text>
          </Pressable>
          <View className="items-center justify-center px-1">
            <Text className="text-text-secondary text-[9px] font-bold tracking-[0.5px]">GW</Text>
            <Text className="text-text-primary text-base font-bold -mt-0.5">{gameweek}</Text>
          </View>
          <Pressable onPress={handleNextGW} disabled={!canGoNext} className="flex-1 items-center justify-center h-10">
            <Text className={`text-[22px] font-light ${canGoNext ? "text-text-primary" : "text-text-secondary opacity-30"}`}>›</Text>
          </Pressable>
        </View>
      </View>

      {/* Stats Row */}
      <View className="flex-row items-center gap-5">
        <View className="gap-0.5">
          <Text className="text-text-secondary text-[10px] font-bold tracking-[0.5px]">VALUE</Text>
          <Text className="text-text-primary text-[15px] font-bold">£{Number(team?.value || 0).toFixed(1)}m</Text>
        </View>
        <View className="gap-0.5">
          <Text className="text-text-secondary text-[10px] font-bold tracking-[0.5px]">ITB</Text>
          <Text className="text-text-primary text-[15px] font-bold">£{Number(team?.bank || 0).toFixed(1)}m</Text>
        </View>
        <View className="flex-row items-center bg-status-danger/15 px-2 py-1 rounded-full gap-1">
          <View className="w-1.5 h-1.5 rounded-full bg-status-danger" />
          <Text className="text-status-danger text-[13px] font-bold">{team?.totalPoints ?? 0} pts</Text>
        </View>
      </View>
    </View>
  );
};

/**
 * Persistent top bar inside "My Team" (PRD §3):
 *   • team switcher (avatar + name + chevron)
 *   • Team Value pill (£XX.Xm)
 *   • In The Bank pill (ITB)
 *   • Gameweek selector (chevron stepper + "GW12" label)
 *
 * The bars are surfaced as separate <Pill /> primitives in
 * `components/primitives/Pill.tsx`. Read-side data is wired through
 * the `useActiveTeam()` and `useCurrentGameweek()` hooks (Zustand
 * stores under `state/`).
 */
import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";

import { Text } from "../components/primitives/Text";
import { Pill } from "../components/primitives/Pill";
import { colors, spacing, radius } from "../theme";
import { useActiveTeam } from "../state/useActiveTeam";
import { useCurrentGameweek } from "../state/useCurrentGameweek";
import { triggerHaptic } from "../services/haptic";

const MIN_GW = 1;
const MAX_GW = 38;

export const MyTeamTopBar: React.FC = () => {
  const team = useActiveTeam();
  const { gameweek, setGameweek } = useCurrentGameweek();
  const [teamSwitcherPressed, setTeamSwitcherPressed] = useState(false);

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
    <View style={styles.root}>
      {/* Team Switcher Row */}
      <View style={styles.topRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Switch team. Current team: ${team?.name ?? "No team"}`}
          accessibilityHint="Opens team selection menu"
          style={[
            styles.teamSwitcher,
            teamSwitcherPressed && styles.teamSwitcherPressed,
          ]}
          onPressIn={() => {
            setTeamSwitcherPressed(true);
            triggerHaptic("selection");
          }}
          onPressOut={() => setTeamSwitcherPressed(false)}
          onPress={() => {
            // TODO: Navigate to team switcher modal
          }}
        >
          <View
            style={[
              styles.avatar,
              !team && styles.avatarEmpty,
              teamSwitcherPressed && styles.avatarPressed,
            ]}
          >
            <Text style={styles.avatarText}>
              {(team?.name ?? "?").charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.teamInfo}>
            <Text style={styles.teamName} numberOfLines={1}>
              {team?.name ?? "No team"}
            </Text>
            {team && (
              <Text style={styles.teamRank} numberOfLines={1}>
                Rank: {team.overallRank?.toLocaleString() ?? "—"} • {team.totalPoints ?? 0} pts
              </Text>
            )}
          </View>
          <Text style={styles.chevron}>▾</Text>
        </Pressable>
      </View>

      {/* Stats & GW Stepper Row */}
      <View style={styles.bottomRow}>
        <View style={styles.pillGroup}>
          <Pill
            label="VALUE"
            value={team ? `£${team.value.toFixed(1)}m` : "—"}
            emphasis="default"
          />
          <Pill
            label="ITB"
            value={team ? `£${team.bank.toFixed(1)}m` : "—"}
            emphasis={team && team.bank > 0 ? "positive" : "default"}
          />
        </View>

        <View style={styles.gwStepper}>
          <Pressable
            onPress={handlePrevGW}
            disabled={!canGoPrev}
            accessibilityLabel="Previous gameweek"
            accessibilityState={{ disabled: !canGoPrev }}
            style={[styles.gwStepBtn, !canGoPrev && styles.gwStepBtnDisabled]}
          >
            <Text
              style={[
                styles.gwStepText,
                !canGoPrev && styles.gwStepTextDisabled,
              ]}
            >
              ‹
            </Text>
          </Pressable>
          <View style={styles.gwLabel}>
            <Text style={styles.gwLabelText}>GW{gameweek}</Text>
          </View>
          <Pressable
            onPress={handleNextGW}
            disabled={!canGoNext}
            accessibilityLabel="Next gameweek"
            accessibilityState={{ disabled: !canGoNext }}
            style={[styles.gwStepBtn, !canGoNext && styles.gwStepBtnDisabled]}
          >
            <Text
              style={[
                styles.gwStepText,
                !canGoNext && styles.gwStepTextDisabled,
              ]}
            >
              ›
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.bg.surface,
    borderBottomColor: colors.border.subtle,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  teamSwitcher: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.lg,
    marginHorizontal: -spacing.xs,
  },
  teamSwitcherPressed: {
    backgroundColor: colors.bg.surfaceRaised,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent.primaryMuted,
    borderWidth: 2,
    borderColor: colors.accent.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmpty: {
    borderColor: colors.border.subtle,
    backgroundColor: colors.bg.surfaceRaised,
  },
  avatarPressed: {
    transform: [{ scale: 0.95 }],
  },
  avatarText: {
    color: colors.accent.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  teamInfo: {
    flex: 1,
    gap: 2,
  },
  teamName: {
    color: colors.text.primary,
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  teamRank: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: "500",
  },
  chevron: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: "600",
  },
  pillGroup: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  gwStepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bg.surfaceRaised,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  gwStepBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  gwStepBtnDisabled: {
    opacity: 0.3,
  },
  gwStepText: {
    color: colors.accent.primary,
    fontSize: 20,
    fontWeight: "700",
  },
  gwStepTextDisabled: {
    color: colors.text.secondary,
  },
  gwLabel: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  gwLabelText: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

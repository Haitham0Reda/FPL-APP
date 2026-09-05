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
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MIN_GW = 1;
const MAX_GW = 38;
export const MyTeamTopBar = () => {
  const insets = useSafeAreaInsets();
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
    <View style={[styles.root, { paddingTop: Math.max(insets.top, spacing.md) }]}>
      {/* Top Controls Row */}
      <View style={styles.controlsRow}>
        <Pressable
          style={[styles.teamPicker, teamSwitcherPressed && styles.teamPickerPressed]}
          onPressIn={() => setTeamSwitcherPressed(true)}
          onPressOut={() => setTeamSwitcherPressed(false)}
        >
          <Text style={styles.teamNameText}>{team?.name ?? "No team"}</Text>
          <Text style={styles.chevronIcon}>⌄</Text>
        </Pressable>

        <View style={styles.gwStepper}>
          <Pressable onPress={handlePrevGW} disabled={!canGoPrev} style={styles.stepBtn}>
            <Text style={[styles.stepText, !canGoPrev && styles.stepDisabled]}>‹</Text>
          </Pressable>
          <View style={styles.gwInfo}>
            <Text style={styles.gwLabel}>GW</Text>
            <Text style={styles.gwValue}>{gameweek}</Text>
          </View>
          <Pressable onPress={handleNextGW} disabled={!canGoNext} style={styles.stepBtn}>
            <Text style={[styles.stepText, !canGoNext && styles.stepDisabled]}>›</Text>
          </Pressable>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>VALUE</Text>
          <Text style={styles.statValue}>£{Number(team?.value || 0).toFixed(1)}m</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>ITB</Text>
          <Text style={styles.statValue}>£{Number(team?.bank || 0).toFixed(1)}m</Text>
        </View>
        <View style={styles.pointsBadge}>
          <View style={styles.dot} />
          <Text style={styles.pointsText}>{team?.totalPoints ?? 0} pts</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.bg.primary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  teamPicker: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  teamPickerPressed: {
    backgroundColor: colors.bg.surfaceRaised,
  },
  teamNameText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  chevronIcon: {
    color: colors.text.secondary,
    fontSize: 18,
    fontWeight: '700',
  },
  gwStepper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  stepBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  stepText: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: '300',
  },
  stepDisabled: {
    color: colors.text.secondary,
    opacity: 0.3,
  },
  gwInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  gwLabel: {
    color: colors.text.secondary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  gwValue: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: -2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  statItem: {
    gap: 2,
  },
  statLabel: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statValue: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.status.danger,
  },
  pointsText: {
    color: colors.status.danger,
    fontSize: 13,
    fontWeight: '700',
  },
});
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
import React from "react";
import { View, StyleSheet, Pressable } from "react-native";

import { Text } from "../components/primitives/Text";
import { Pill } from "../components/primitives/Pill";
import { colors, spacing } from "../theme";
import { useActiveTeam } from "../state/useActiveTeam";
import { useCurrentGameweek } from "../state/useCurrentGameweek";

export const MyTeamTopBar: React.FC = () => {
  const team = useActiveTeam();
  const { gameweek, setGameweek } = useCurrentGameweek();

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Switch team"
          style={styles.teamSwitcher}
        >
          {/* Avatar — circular badge with team initial. Replaced by a
              real avatar component once image uploads land. */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(team?.name ?? "?").charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.teamName} numberOfLines={1}>
            {team?.name ?? "No team"}
          </Text>
          <Text style={styles.chevron}>▾</Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <Pill label="Value" value={team ? `£${team.value.toFixed(1)}m` : "—"} />
        <Pill label="ITB" value={team ? `£${team.bank.toFixed(1)}m` : "—"} />
        <View style={styles.gwStepper}>
          <Pressable
            onPress={() => setGameweek(gameweek - 1)}
            accessibilityLabel="Previous gameweek"
            style={styles.gwStepBtn}
          >
            <Text style={styles.gwStepText}>‹</Text>
          </Pressable>
          <View style={styles.gwLabel}>
            <Text style={styles.gwLabelText}>GW{gameweek}</Text>
          </View>
          <Pressable
            onPress={() => setGameweek(gameweek + 1)}
            accessibilityLabel="Next gameweek"
            style={styles.gwStepBtn}
          >
            <Text style={styles.gwStepText}>›</Text>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  teamSwitcher: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.accent.primary, fontWeight: "700" },
  teamName: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  chevron: { color: colors.text.secondary, fontSize: 14 },
  gwStepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bg.surfaceRaised,
    borderRadius: 999,
    paddingHorizontal: spacing.xs,
  },
  gwStepBtn: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  gwStepText: { color: colors.accent.primary, fontSize: 18, fontWeight: "700" },
  gwLabel: { paddingHorizontal: spacing.sm },
  gwLabelText: { color: colors.text.primary, fontSize: 14, fontWeight: "600" },
});

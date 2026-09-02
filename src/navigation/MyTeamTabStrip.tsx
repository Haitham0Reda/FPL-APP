/**
 * Horizontal sub-tab strip used inside "My Team" (PRD §3).
 *
 * The PRD specifies a custom animated segment control rather than a
 * second stack of screens — the same `Squad`/`Fixtures`/etc. screens
 * are mounted once and the active one slides/fades in via Reanimated.
 *
 * This component is intentionally a thin wrapper around a scrollable
 * horizontal pill list. The actual screen-swapping logic lives in
 * `MyTeamNavigator` (parent) which renders this strip above its
 * `Animated.View` content area.
 */
import React, { useCallback } from "react";
import {
  ScrollView,
  Pressable,
  StyleSheet,
  View,
  TextStyle,
} from "react-native";
import { Text } from "../components/primitives/Text";
import { colors, spacing, radius } from "../theme";
import { triggerHaptic } from "../services/haptic";
import type { MyTeamStackParamList } from "../types/navigation";

type SubTabKey = keyof MyTeamStackParamList;

interface SubTab {
  key: SubTabKey;
  label: string;
}

export const MY_TEAM_SUBTABS: readonly SubTab[] = [
  { key: "Squad", label: "Squad" },
  { key: "Fixtures", label: "Fixtures" },
  { key: "Captain", label: "Captain" },
  { key: "Chips", label: "Chips" },
  { key: "Transfers", label: "Transfers" },
  { key: "Compare", label: "Compare" },
  { key: "Research", label: "Research" },
  { key: "Strategy", label: "Strategy" },
] as const;

interface Props {
  active: SubTabKey;
  onChange: (key: SubTabKey) => void;
}

export const MyTeamTabStrip: React.FC<Props> = ({ active, onChange }) => {
  const handlePress = useCallback(
    (key: SubTabKey) => () => {
      if (key !== active) {
        triggerHaptic("swipeToCompare");
      }
      onChange(key);
    },
    [active, onChange],
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      {MY_TEAM_SUBTABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={handlePress(tab.key)}
            style={[styles.pill, isActive && styles.pillActive]}
          >
            <Text style={[styles.label, isActive ? styles.labelActive : null]}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.activeDot} />}
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: colors.bg.surface,
    borderBottomColor: colors.border.subtle,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  container: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  pillActive: {
    backgroundColor: colors.accent.primaryMuted,
  },
  label: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: "500",
  },
  labelActive: {
    color: colors.accent.primary,
    fontWeight: "600",
  } as TextStyle,
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent.primary,
  },
});

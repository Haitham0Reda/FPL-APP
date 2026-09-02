/**
 * Pill — small chip-style label + value pair used in the My Team top bar.
 * E.g. "Value £98.4m", "ITB £1.6m".
 */
import React from "react";
import { View, StyleSheet, type TextStyle, type ViewStyle } from "react-native";

import { Text } from "./Text";
import { colors, spacing, radius } from "../../theme";

interface PillProps {
  label: string;
  value: string;
  /** Visual emphasis — emerald for live/positive, default otherwise. */
  emphasis?: "default" | "positive" | "warning" | "danger";
}

export const Pill: React.FC<PillProps> = ({
  label,
  value,
  emphasis = "default",
}) => {
  const valueColor: string =
    emphasis === "positive"
      ? colors.accent.primary
      : emphasis === "warning"
        ? colors.status.warning
        : emphasis === "danger"
          ? colors.status.danger
          : colors.text.primary;

  const containerStyle: ViewStyle =
    emphasis === "positive"
      ? [styles.root, styles.rootPositive]
      : emphasis === "warning"
        ? [styles.root, styles.rootWarning]
        : emphasis === "danger"
          ? [styles.root, styles.rootDanger]
          : styles.root;

  const valueStyle: TextStyle = {
    color: valueColor,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  };

  const labelStyle: TextStyle = {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: colors.text.secondary,
  };

  return (
    <View style={containerStyle}>
      <Text style={labelStyle}>{label}</Text>
      <Text style={valueStyle}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.bg.surfaceRaised,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    minWidth: 70,
    gap: 2,
  },
  rootPositive: {
    borderColor: colors.accent.primaryMuted,
    backgroundColor: "rgba(16, 185, 129, 0.08)",
  },
  rootWarning: {
    borderColor: "rgba(245, 158, 11, 0.3)",
    backgroundColor: "rgba(245, 158, 11, 0.08)",
  },
  rootDanger: {
    borderColor: "rgba(239, 68, 68, 0.3)",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
  },
});

/**
 * Pill — small chip-style label + value pair used in the My Team top bar.
 * E.g. "Value £98.4m", "ITB £1.6m".
 */
import React from "react";
import { View, StyleSheet, type TextStyle } from "react-native";

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

  const valueStyle: TextStyle = { color: valueColor };

  return (
    <View style={styles.root}>
      <Text preset="dataLabel">{label}</Text>
      <Text style={valueStyle}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.bg.surfaceRaised,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.subtle,
  },
});

/**
 * FDRChip — small colored difficulty pill (1=easy, 5=hard).
 * Color palette is sourced from `colors.fdr`. Used in:
 *   • Fixture ticker rows (PRD §5.4)
 *   • Player card's next-fixture dot
 *   • Club fixture swing chart
 */
import React from "react";
import { View, StyleSheet } from "react-native";

import { Text } from "../primitives/Text";
import { colors, spacing, radius } from "../../theme";

interface FDRChipProps {
  /** 1–5. Anything out of range falls back to neutral (slate). */
  value: number;
  /** Compact variant — just a colored dot, no label. */
  compact?: boolean;
}

export const FDRChip: React.FC<FDRChipProps> = ({ value, compact }) => {
  const color = fdrColor(value);

  if (compact) {
    return (
      <View
        style={[styles.dot, { backgroundColor: color }]}
        accessibilityLabel={`FDR ${value}`}
      />
    );
  }

  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <Text style={[styles.label, { color }]}>{value}</Text>
    </View>
  );
};

const fdrColor = (v: number): string => {
  if (v <= 1) return colors.fdr.fdr1;
  if (v === 2) return colors.fdr.fdr2;
  if (v === 3) return colors.fdr.fdr3;
  if (v === 4) return colors.fdr.fdr4;
  return colors.fdr.fdr5;
};

const styles = StyleSheet.create({
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pill: {
    minWidth: 28,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});

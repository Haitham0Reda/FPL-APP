/**
 * Card — surface-raised container used across the app for grouping.
 * Three elevation levels mapped to PRD §2:
 *   • `flat`     — bg.surface
 *   • `raised`   — bg.surfaceRaised (default — most list rows, modals)
 *   • `overlay`  — bg.surfaceRaised with stronger border, used in sheets
 */
import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";

import { colors, spacing, radius } from "../../theme";

interface CardProps extends ViewProps {
  elevation?: "flat" | "raised" | "overlay";
  padding?: keyof typeof SPACING_MAP;
}

const SPACING_MAP = {
  none: 0,
  sm: spacing.sm,
  base: spacing.base,
  lg: spacing.lg,
} as const;

export const Card: React.FC<CardProps> = ({
  elevation = "raised",
  padding = "base",
  style,
  children,
  ...rest
}) => {
  const bg = elevation === "flat" ? colors.bg.surface : colors.bg.surfaceRaised;
  return (
    <View
      style={[
        styles.root,
        { backgroundColor: bg, padding: SPACING_MAP[padding] },
        elevation === "overlay" && styles.overlayBorder,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.subtle,
  },
  overlayBorder: {
    borderColor: colors.border.subtle,
    borderWidth: 1,
  },
});

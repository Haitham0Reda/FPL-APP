/**
 * Card — surface-raised container used across the app for grouping.
 * Three elevation levels mapped to PRD §2:
 *   • `flat`     — bg.surface
 *   • `raised`   — bg.surfaceRaised (default — most list rows, modals)
 *   • `overlay`  — bg.surfaceRaised with stronger border, used in sheets
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, spacing, radius } from "../../theme";
const SPACING_MAP = {
  none: 0,
  sm: spacing.sm,
  base: spacing.base,
  lg: spacing.lg,
  xl: spacing.xl,
  "2xl": spacing["2xl"]
};
export const Card = ({
  elevation = "raised",
  padding = "base",
  shadow = false,
  style,
  children,
  ...rest
}) => {
  const bg = elevation === "flat" ? colors.bg.surface : colors.bg.surfaceRaised;
  return <View style={[styles.root, {
    backgroundColor: bg,
    padding: SPACING_MAP[padding]
  }, elevation === "overlay" && styles.overlayBorder, shadow && styles.shadow, style]} {...rest}>
      {children}
    </View>;
};
const styles = StyleSheet.create({
  root: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.subtle
  },
  overlayBorder: {
    borderColor: colors.border.subtle,
    borderWidth: 1
  },
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12
  }
});
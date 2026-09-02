/**
 * Button — primary CTA, secondary, ghost.
 * Emerald primary, surface raised secondary, transparent ghost.
 */
import React from "react";
import { Pressable, StyleSheet, ViewStyle } from "react-native";

import { Text } from "./Text";
import { colors, spacing, radius } from "../../theme";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  fullWidth?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  fullWidth,
  disabled,
  style,
}) => {
  const containerStyle = [
    styles.base,
    VARIANT_BG[variant],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];
  const textTone =
    variant === "primary"
      ? "inverse"
      : variant === "danger"
        ? "inverse"
        : "default";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        containerStyle,
        pressed && variant === "primary" && styles.pressed,
      ]}
    >
      <Text preset="title" tone={textTone}>
        {title}
      </Text>
    </Pressable>
  );
};

const VARIANT_BG: Record<Variant, ViewStyle> = {
  primary: { backgroundColor: colors.accent.primary },
  secondary: {
    backgroundColor: colors.bg.surfaceRaised,
    borderColor: colors.border.subtle,
    borderWidth: 1,
  },
  ghost: { backgroundColor: "transparent" },
  danger: { backgroundColor: colors.status.danger },
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: { alignSelf: "stretch" },
  pressed: { backgroundColor: colors.accent.primaryMuted },
  disabled: { opacity: 0.5 },
});

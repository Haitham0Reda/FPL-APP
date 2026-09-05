/**
 * Button — primary CTA, secondary, ghost.
 * Emerald primary, surface raised secondary, transparent ghost.
 * Primary CTAs use a subtle spring scale-down on press.
 */
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Text } from "./Text";
import { colors, spacing, radius } from "../../theme";
export const Button = ({
  title,
  onPress,
  variant = "primary",
  fullWidth,
  disabled,
  style
}) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));
  const containerStyle = [styles.base, VARIANT_BG[variant], fullWidth && styles.fullWidth, disabled && styles.disabled, style];
  const textTone = variant === "primary" ? "inverse" : variant === "danger" ? "inverse" : "default";
  return <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" onPressIn={() => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  }} onPressOut={() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }} style={({ pressed }) => [containerStyle, pressed && variant === "primary" && styles.pressed]}>
      <Animated.View style={animatedStyle}>
        <Text preset="title" tone={textTone}>
          {title}
        </Text>
      </Animated.View>
    </Pressable>;
};
const VARIANT_BG = {
  primary: {
    backgroundColor: colors.accent.primary
  },
  secondary: {
    backgroundColor: colors.bg.surfaceRaised,
    borderColor: colors.border.subtle,
    borderWidth: 1
  },
  ghost: {
    backgroundColor: "transparent"
  },
  danger: {
    backgroundColor: colors.status.danger
  }
};
const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center"
  },
  fullWidth: {
    alignSelf: "stretch"
  },
  pressed: {
    backgroundColor: colors.accent.primaryMuted
  },
  disabled: {
    opacity: 0.5
  }
});

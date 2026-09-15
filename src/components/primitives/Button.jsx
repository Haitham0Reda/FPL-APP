/**
 * Button — primary CTA, secondary, ghost.
 * Emerald primary, surface raised secondary, transparent ghost.
 * Primary CTAs use a subtle spring scale-down on press.
 */
import React from "react";
import { Pressable } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Text } from "./Text";

const VARIANT_CLASS = {
  primary: "bg-primary",
  secondary: "bg-surface-raised border border-border",
  ghost: "bg-transparent",
  danger: "bg-status-danger",
};

export const Button = ({
  title,
  onPress,
  variant = "primary",
  fullWidth,
  disabled,
  style,
  className
}) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));
  const textTone = variant === "primary" ? "inverse" : variant === "danger" ? "inverse" : "default";
  return <Pressable
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    onPressIn={() => {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    }}
    onPressOut={() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }}
    style={style}
    className={[
      "px-5 py-3 rounded-lg items-center justify-center",
      VARIANT_CLASS[variant],
      variant === "primary" && "active:bg-accent-muted",
      fullWidth && "self-stretch",
      disabled && "opacity-50",
      className,
    ].filter(Boolean).join(" ")}
  >
      <Animated.View style={animatedStyle}>
        <Text preset="title" tone={textTone}>
          {title}
        </Text>
      </Animated.View>
    </Pressable>;
};

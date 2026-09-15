/**
 * Card — surface-raised container used across the app for grouping.
 * Three elevation levels mapped to PRD §2:
 *   • `flat`     — bg.surface
 *   • `raised`   — bg.surfaceRaised (default — most list rows, modals)
 *   • `overlay`  — bg.surfaceRaised with stronger border, used in sheets
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import { cssInterop } from "nativewind";

const PADDING_CLASS = {
  none: "p-0",
  sm: "p-2",
  base: "p-4",
  lg: "p-5",
  xl: "p-6",
  "2xl": "p-8",
};

const BG_CLASS = {
  flat: "bg-surface",
  raised: "bg-surface-raised",
  overlay: "bg-surface-raised",
};

// shadowColor/shadowOpacity/shadowRadius/elevation and hairline border width
// have no Tailwind equivalent in NativeWind — kept as plain style objects.
const shadowStyle = {
  shadowColor: '#000',
  shadowOpacity: 0.4,
  shadowRadius: 24,
  elevation: 12,
};

export const Card = ({
  elevation = "raised",
  padding = "base",
  shadow = false,
  style,
  children,
  ...rest
}) => {
  const borderWidthStyle = { borderWidth: elevation === "overlay" ? 1 : StyleSheet.hairlineWidth };
  return <View
    style={[borderWidthStyle, shadow && shadowStyle, style]}
    className={[
      "rounded-xl border-border",
      BG_CLASS[elevation],
      PADDING_CLASS[padding],
    ].filter(Boolean).join(" ")}
    {...rest}
  >
      {children}
    </View>;
};

cssInterop(Card, {
  className: "style"
});
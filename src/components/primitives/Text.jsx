/**
 * Text primitive.
 *
 * Always reaches for a `textStyle` preset (terminal/data-label/numeric/etc.)
 * from `theme.typography`. The PRD's typography rules are non-negotiable
 * (uppercase small-caps data labels, tabular numerals, etc.) — funneling
 * every Text render through this component is how we enforce them.
 *
 * Accepts a `preset` and any RN TextStyle overrides. Never let a screen
 * hand-roll fontSize / fontWeight / color directly.
 */
import React from "react";
import { Text as RNText, StyleSheet } from "react-native";
import { colors, textStyle } from "../../theme";
export const Text = ({
  preset = "body",
  style,
  children,
  numberOfLines,
  accessibilityLabel,
  tone = "default"
}) => {
  const baseStyle = preset === "numeric" ? textStyle.numeric : textStyle[preset];
  const toneStyle = tone === "inverse" ? {
    color: colors.text.onAccent
  } : undefined;
  return <RNText style={[baseStyle, toneStyle, style]} numberOfLines={numberOfLines} accessibilityLabel={accessibilityLabel}
  // Allow nested string children without TS complaints.
  allowFontScaling>
      {children}
    </RNText>;
};
export const styles = StyleSheet.create({});
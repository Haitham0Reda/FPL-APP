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
import { Text as RNText, TextStyle, StyleSheet } from "react-native";

import { colors, textStyle, type TextStylePreset } from "../../theme";

type Variant = TextStylePreset | "numeric";

export interface TextProps {
  preset?: Variant;
  style?: TextStyle | TextStyle[] | (TextStyle | null | undefined)[];
  children?: React.ReactNode;
  numberOfLines?: number;
  /** Forwarded to <Text>. */
  accessibilityLabel?: string;
  /** Inverse tone for use on emerald CTAs (e.g. button labels). */
  tone?: "default" | "inverse";
}

export const Text: React.FC<TextProps> = ({
  preset = "body",
  style,
  children,
  numberOfLines,
  accessibilityLabel,
  tone = "default",
}) => {
  const baseStyle: any =
    preset === "numeric" ? textStyle.numeric : textStyle[preset];
  const toneStyle =
    tone === "inverse" ? { color: colors.text.onAccent } : undefined;

  return (
    <RNText
      style={[baseStyle, toneStyle, style]}
      numberOfLines={numberOfLines}
      accessibilityLabel={accessibilityLabel}
      // Allow nested string children without TS complaints.
      allowFontScaling
    >
      {children}
    </RNText>
  );
};

export const styles = StyleSheet.create({});

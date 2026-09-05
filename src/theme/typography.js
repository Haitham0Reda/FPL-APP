import { Platform } from "react-native";

/**
 * Typography tokens — Elite FPL PRD §2.
 *
 * Geometric sans with strong tabular figures for numbers.
 * iOS: SF Pro (default) with tabular-nums variant.
 * Android: Roboto — use `fontVariant: ['tabular-nums']` where supported.
 * Expo ships @expo-google-fonts/inter; we declare Inter here as the primary
 * web/marketing-aligned face that also has excellent tabular numerals.
 */

const sansFamily = Platform.select({
  ios: "System",
  android: "sans-serif",
  default: "System"
});
export const fontFamily = {
  sans: sansFamily,
  mono: Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace"
  })
};
export const fontWeight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700"
};
export const fontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 22,
  "2xl": 28,
  "3xl": 34,
  "4xl": 42
};
export const lineHeight = {
  tight: 1.15,
  snug: 1.3,
  normal: 1.45,
  relaxed: 1.6
};

/**
 * Text style presets — reuse these across screens rather than re-declaring.
 * The "dataLabel" preset uses uppercase small-caps + letter-spacing for the
 * "terminal" feel called out in PRD §2.
 */
export const textStyle = {
  display: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize["3xl"] * lineHeight.tight,
    color: "#F8FAFC"
  },
  headline: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize["2xl"] * lineHeight.tight,
    color: "#F8FAFC"
  },
  title: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.lg * lineHeight.snug,
    color: "#F8FAFC"
  },
  body: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.base,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.base * lineHeight.normal,
    color: "#F8FAFC"
  },
  caption: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.sm * lineHeight.normal,
    color: "#94A3B8"
  },
  /**
   * "Terminal" label — uppercase, small-caps, reduced size, letter-spaced.
   * Used for: section headers, table column headers, inline numbers/labels.
   */
  dataLabel: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.xs * lineHeight.normal,
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  /**
   * Tabular numeric — any place we render prices/points/xPts.
   * Use `fontVariant: ['tabular-nums']` on iOS, falls back gracefully on Android.
   */
  numeric: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    lineHeight: fontSize.md * lineHeight.snug,
    color: "#F8FAFC",
    fontVariant: ["tabular-nums"]
  }
};
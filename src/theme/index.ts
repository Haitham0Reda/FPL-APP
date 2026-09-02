import { colors } from "./colors";
import {
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  textStyle,
} from "./typography";
import { spacing, radius } from "./spacing";
import { duration, easing, spring, haptic } from "./motion";

/**
 * Aggregated theme — single import surface for screens.
 * Re-exports `colors`, `textStyle`, `spacing`, etc. as a unified theme object
 * so future light-theme support (per PRD §5.13 — dark is default/only in v1)
 * can be a ThemeProvider swap rather than a global rewrite.
 */
export const theme = {
  colors,
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
  textStyle,
  spacing,
  radius,
  duration,
  easing,
  spring,
  haptic,
} as const;

export type Theme = typeof theme;

export { colors } from "./colors";
export {
  textStyle,
  fontFamily,
  fontWeight,
  fontSize,
  lineHeight,
} from "./typography";
export type { TextStylePreset } from "./typography";
export { duration, spring, easing, haptic } from "./motion";
export { spacing, radius } from "./spacing";

export default theme;

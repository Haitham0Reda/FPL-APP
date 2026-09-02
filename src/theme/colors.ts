/**
 * Design tokens — colors.
 * Source: Elite FPL PRD §2 Design Language.
 * Dark theme is the only supported theme in v1.
 */
export const colors = {
  bg: {
    primary: "#0B1220",
    surface: "#0F172A",
    surfaceRaised: "#151E32",
  },
  accent: {
    primary: "#10B981", // emerald
    primaryMuted: "#065F46",
  },
  text: {
    primary: "#F8FAFC",
    secondary: "#94A3B8",
    onAccent: "#0B1220", // dark text on emerald (for captain badge, CTA labels)
  },
  border: {
    subtle: "#1E293B",
  },
  status: {
    danger: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6",
    success: "#10B981", // alias of accent.primary, kept for semantic naming
  },
  // FDR (Fixture Difficulty Rating) palette — 1 (easy) -> 5 (hard)
  fdr: {
    fdr1: "#10B981", // emerald — easy
    fdr2: "#84CC16", // lime
    fdr3: "#94A3B8", // slate — neutral
    fdr4: "#F59E0B", // amber
    fdr5: "#EF4444", // red — hard
  },
} as const;

export type Colors = typeof colors;

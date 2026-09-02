/**
 * Motion tokens — Elite FPL PRD §2.
 *
 * Spring physics for pitch player card animations (~300ms).
 * Tab switches: subtle horizontal slide + fade.
 * Captain armband set: short scale + emerald glow pulse.
 */
export const duration = {
  fast: 120,
  base: 200,
  medium: 300,
  slow: 450,
} as const;

export const easing = {
  // Standard Material easing curves, expressed as tuples for Reanimated.
  standard: [0.4, 0.0, 0.2, 1] as const,
  decelerate: [0.0, 0.0, 0.2, 1] as const,
  accelerate: [0.4, 0.0, 1, 1] as const,
} as const;

/**
 * Spring presets to feed Reanimated's `withSpring`.
 * Player card formation-change: springy settle.
 * Captain pulse: tighter, more pronounced.
 */
export const spring = {
  /** Pitch player card reposition — smooth, low overshoot. */
  pitchCard: { damping: 18, stiffness: 180, mass: 0.9 },
  /** Captain badge set — more bounce. */
  captainPulse: { damping: 12, stiffness: 240, mass: 0.7 },
  /** Tab slide — quick, no overshoot. */
  tabSlide: { damping: 22, stiffness: 220, mass: 1 },
} as const;

/**
 * Haptic feedback map — single source of truth so we never accidentally
 * fire a heavy impact on a routine tap. All values are expo-haptics strings.
 */
export const haptic = {
  captainSet: "impactLight",
  transferConfirmed: "impactLight",
  chipPlayed: "notificationSuccess",
  swipeToCompare: "selection",
} as const;

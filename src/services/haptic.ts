/**
 * Thin wrapper around expo-haptics so screens depend on `haptic.*` strings
 * (per `theme/motion.ts`) rather than the raw expo-haptics API.
 * Keeps the haptic map testable and lets us no-op in dev if needed.
 */
import * as ExpoHaptics from "expo-haptics";

import { haptic as map } from "../theme/motion";

type Style = (typeof map)[keyof typeof map];

/** Maps our semantic style strings to expo-haptics enum values. */
const toExpoStyle = (style: Style): ExpoHaptics.ImpactFeedbackStyle => {
  switch (style) {
    case "impactLight":
      return ExpoHaptics.ImpactFeedbackStyle.Light;
    case "selection":
      return ExpoHaptics.ImpactFeedbackStyle.Light;
    case "notificationSuccess":
      // Notification feedbacks use a separate API in expo-haptics.
      // Cast through unknown so this file doesn't import the heavy enum tree.
      return "notificationSuccess" as unknown as ExpoHaptics.ImpactFeedbackStyle;
    default:
      return ExpoHaptics.ImpactFeedbackStyle.Light;
  }
};

export const triggerHaptic = (kind: keyof typeof map): void => {
  try {
    const style = map[kind];
    if (style === "notificationSuccess") {
      void ExpoHaptics.notificationAsync(
        ExpoHaptics.NotificationFeedbackType.Success,
      );
      return;
    }
    void ExpoHaptics.impactAsync(toExpoStyle(style));
  } catch {
    // Haptics unavailable on web/simulator — swallow.
  }
};

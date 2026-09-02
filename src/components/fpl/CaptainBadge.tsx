/**
 * CaptainBadge — solid emerald "C" or outlined "V" rendered top-right
 * of the on-pitch player card (PRD §4.2).
 *
 * The PRD also specifies a scale + emerald glow pulse on captain set —
 * that animation is owned by the parent (PlayerCard) so the badge can
 * stay pure-presentation. This component is the badge only.
 */
import React from "react";
import { View, StyleSheet } from "react-native";

import { Text } from "../primitives/Text";
import { colors, radius } from "../../theme";

interface CaptainBadgeProps {
  kind: "captain" | "vice" | "none";
}

export const CaptainBadge: React.FC<CaptainBadgeProps> = ({ kind }) => {
  if (kind === "none") return null;

  if (kind === "captain") {
    return (
      <View style={[styles.badge, styles.captain]}>
        <Text preset="dataLabel" tone="inverse" style={styles.captainLabel}>
          C
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, styles.vice]}>
      <Text preset="dataLabel" style={styles.viceLabel}>
        V
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  captain: { backgroundColor: colors.accent.primary },
  captainLabel: { color: colors.text.onAccent, fontSize: 11 },
  vice: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.accent.primary,
  },
  viceLabel: { color: colors.accent.primary, fontSize: 11 },
});

/**
 * PlayerCard — on-pitch compact card (PRD §4.2).
 *
 * Layout:
 *   ┌──────────────┐
 *   │  club  [C]   │  ← CaptainBadge top-right
 *   │  Surname     │
 *   │  £12.4  8.4 │  ← price + xPts (current GW)
 *   └──────────────┘
 *
 * Tap → open PlayerDetail bottom sheet.
 * Long-press → quick menu (set captain, set vice, sub, view, note).
 *
 * Animation: when formation changes, the card's position animates with
 * Reanimated's `withSpring` using `theme.spring.pitchCard`. That's wired
 * in SquadScreen — this card renders inside an Animated.View owned there.
 */
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "../primitives/Text";
import { CaptainBadge } from "./CaptainBadge";
import { FDRChip } from "./FDRChip";
import { colors, spacing, radius } from "../../theme";

interface PlayerCardProps {
  webName: string;
  shirtNumber?: number;
  price: number;
  xpPts: number;
  nextFdr?: number;
  captainRole: "captain" | "vice" | "none";
  onPress?: () => void;
  onLongPress?: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  webName,
  shirtNumber,
  price,
  xpPts,
  nextFdr,
  captainRole,
  onPress,
  onLongPress,
}) => (
  <Pressable
    onPress={onPress}
    onLongPress={onLongPress}
    accessibilityRole="button"
    accessibilityLabel={`${webName}, £${price.toFixed(1)} million, projected ${xpPts.toFixed(1)} points`}
    style={({ pressed }) => [styles.card, pressed && styles.pressed]}
  >
    <View style={styles.header}>
      <Text style={styles.shirt}>#{shirtNumber ?? "—"}</Text>
      <CaptainBadge kind={captainRole} />
    </View>
    <Text style={styles.name} numberOfLines={1}>
      {webName}
    </Text>
    <View style={styles.footer}>
      <Text style={styles.price}>£{price.toFixed(1)}</Text>
      <Text style={styles.xpPts}>{xpPts.toFixed(1)}</Text>
      {typeof nextFdr === "number" && (
        <View style={styles.fdrWrap}>
          <FDRChip value={nextFdr} compact />
        </View>
      )}
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.surfaceRaised,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border.subtle,
    padding: spacing.sm,
    width: 84,
    alignItems: "stretch",
    gap: spacing.xs,
  },
  pressed: { backgroundColor: colors.bg.surface },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shirt: { color: colors.text.secondary, fontSize: 10, fontWeight: "600" },
  name: { color: colors.text.primary, fontSize: 12, fontWeight: "600" },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: {
    color: colors.text.secondary,
    fontSize: 10,
    fontVariant: ["tabular-nums"],
  },
  xpPts: {
    color: colors.accent.primary,
    fontSize: 13,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  fdrWrap: { marginStart: spacing.xs },
});

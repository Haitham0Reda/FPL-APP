/**
 * Shared placeholder shell for stub screens.
 * Lets every screen render the same scaffolding (top label, body, PRD ref)
 * so we can see the navigation working before each feature ships.
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "../../components/primitives/Text";
import { colors, spacing, radius } from "../../theme";

interface PlaceholderProps {
  /** PRD section reference, e.g. "§5.2 Home". */
  prdRef: string;
  /** Short description of what's coming. */
  blurb: string;
}

export const ScreenPlaceholder: React.FC<PlaceholderProps> = ({
  prdRef,
  blurb,
}) => (
  <SafeAreaView style={styles.root} edges={["bottom"]}>
    <View style={styles.body}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{prdRef}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.icon}>
            <Text style={styles.iconText}>⚽</Text>
          </View>
        </View>

        <Text style={styles.title}>Elite FPL</Text>
        <Text style={styles.blurb}>{blurb}</Text>

        <View style={styles.statusContainer}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Phase 0 - In Development</Text>
        </View>
      </View>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    marginBottom: spacing["2xl"],
  },
  badge: {
    backgroundColor: colors.bg.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: colors.accent.primary,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.base,
    paddingBottom: spacing["4xl"],
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent.primaryMuted,
    borderWidth: 2,
    borderColor: colors.accent.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text.primary,
    letterSpacing: -1,
    marginTop: spacing.sm,
  },
  blurb: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text.secondary,
    textAlign: "center",
    maxWidth: 340,
    paddingHorizontal: spacing.base,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg.surfaceRaised,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.primary,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.secondary,
    letterSpacing: -0.1,
  },
});

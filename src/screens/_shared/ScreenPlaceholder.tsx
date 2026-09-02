/**
 * Shared placeholder shell for stub screens.
 * Lets every screen render the same scaffolding (top label, body, PRD ref)
 * so we can see the navigation working before each feature ships.
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "../../components/primitives/Text";
import { colors, spacing } from "../../theme";

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
      <Text preset="dataLabel">{prdRef}</Text>
      <Text preset="headline" style={styles.title}>
        Elite FPL
      </Text>
      <Text style={styles.blurb}>{blurb}</Text>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.primary },
  body: { flex: 1, padding: spacing.lg, gap: spacing.sm },
  title: { marginTop: spacing.xs },
  blurb: { color: colors.text.secondary },
});

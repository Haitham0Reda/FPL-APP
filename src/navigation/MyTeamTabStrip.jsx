/**
 * Horizontal sub-tab strip used inside "My Team" (PRD §3).
 *
 * The PRD specifies a custom animated segment control rather than a
 * second stack of screens — the same `Squad`/`Fixtures`/etc. screens
 * are mounted once and the active one slides/fades in via Reanimated.
 *
 * This component is intentionally a thin wrapper around a scrollable
 * horizontal pill list. The actual screen-swapping logic lives in
 * `MyTeamNavigator` (parent) which renders this strip above its
 * `Animated.View` content area.
 */
import React, { useCallback } from "react";
import { ScrollView, Pressable, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from "react-native-reanimated";
import { Text } from "../components/primitives/Text";
import { colors, spacing, radius } from "../theme";
import { triggerHaptic } from "../services/haptic";
export const MY_TEAM_SUBTABS = [{
  key: "Squad",
  label: "Squad"
}, {
  key: "Fixtures",
  label: "Fixtures"
}, {
  key: "Captain",
  label: "Captain"
}, {
  key: "Chips",
  label: "Chips"
}, {
  key: "Transfers",
  label: "Transfers"
}, {
  key: "Compare",
  label: "Compare"
}, {
  key: "Research",
  label: "Research"
}, {
  key: "Strategy",
  label: "Strategy"
}];
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
export const MyTeamTabStrip = ({
  active,
  onChange
}) => {
  const handlePress = useCallback(key => () => {
    if (key !== active) {
      triggerHaptic("selection");
    }
    onChange(key);
  }, [active, onChange]);
  return <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container} style={styles.scroll}>
        {MY_TEAM_SUBTABS.map(tab => {
        const isActive = tab.key === active;
        return <TabPill key={tab.key} tab={tab} isActive={isActive} onPress={handlePress(tab.key)} />;
      })}
      </ScrollView>
    </View>;
};
const TabPill = ({
  tab,
  isActive,
  onPress
}) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{
      scale: scale.value
    }]
  }));
  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 300
    });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300
    });
  };
  return <AnimatedPressable accessibilityRole="tab" accessibilityState={{
    selected: isActive
  }} accessibilityLabel={`${tab.label} tab${isActive ? ", selected" : ""}`} onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} style={[styles.pill, isActive && styles.pillActive, animatedStyle]}>
      <Text style={[styles.label, isActive && styles.labelActive]}>
        {tab.label}
      </Text>
      {isActive && <View style={styles.activeDot} />}
    </AnimatedPressable>;
};
const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.bg.primary,
    borderBottomColor: colors.border.subtle,
    borderBottomWidth: 1,
  },
  scroll: {
    backgroundColor: 'transparent',
  },
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  pillActive: {
    backgroundColor: colors.accent.primary,
  },
  label: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  labelActive: {
    color: colors.text.onAccent,
    fontWeight: '700',
  },
  activeDot: {
    display: 'none',
  },
});
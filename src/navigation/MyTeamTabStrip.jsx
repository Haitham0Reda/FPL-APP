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
import { ScrollView, Pressable, View } from "react-native";
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from "react-native-reanimated";
import { Text } from "../components/primitives/Text";
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
  return <View className="bg-secondary border-b border-border">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-3 py-2 gap-2"
        className="bg-transparent"
      >
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
  return <Pressable
    accessibilityRole="tab"
    accessibilityState={{ selected: isActive }}
    accessibilityLabel={`${tab.label} tab${isActive ? ", selected" : ""}`}
    onPress={onPress}
    onPressIn={handlePressIn}
    onPressOut={handlePressOut}
    className={`px-3 py-2 rounded-full ${isActive ? "bg-primary" : "bg-white/5"}`}
  >
      <Animated.View style={animatedStyle}>
        <Text className={`text-[13px] font-semibold ${isActive ? "text-text-on-accent font-bold" : "text-text-secondary"}`}>
          {tab.label}
        </Text>
        {isActive && <View className="hidden" />}
      </Animated.View>
    </Pressable>;
};

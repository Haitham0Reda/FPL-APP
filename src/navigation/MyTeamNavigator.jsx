/**
 * "My Team" tab navigator.
 *
 * Renders the persistent top bar (team switcher, value/ITB pills, GW
 * stepper — PRD §3) and the horizontal sub-tab strip below it. The
 * active sub-tab swaps content via a simple state machine — we use
 * a single screen-with-state approach rather than a true nested stack
 * because each sub-tab is essentially a different view of the same
 * squad data and the back button should exit to Home, not walk the
 * sub-tab history.
 */
import React, { useState, useCallback } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { cssInterop } from "nativewind";
import { MyTeamTabStrip, MY_TEAM_SUBTABS } from "./MyTeamTabStrip";
import { MyTeamTopBar } from "./MyTeamTopBar";
import { SquadScreen } from "../screens/myteam/SquadScreen";
import { FixturesScreen } from "../screens/myteam/FixturesScreen";
import { CaptainScreen } from "../screens/myteam/CaptainScreen";
import { ChipsScreen } from "../screens/myteam/ChipsScreen";
import { TransfersScreen } from "../screens/myteam/TransfersScreen";
import { CompareScreen } from "../screens/myteam/CompareScreen";
import { ResearchScreen } from "../screens/myteam/ResearchScreen";
import { StrategyScreen } from "../screens/myteam/StrategyScreen";

cssInterop(SafeAreaView, { className: "style" });

const SUBTAB_SCREENS = {
  Squad: SquadScreen,
  Fixtures: FixturesScreen,
  Captain: CaptainScreen,
  Chips: ChipsScreen,
  Transfers: TransfersScreen,
  Compare: CompareScreen,
  Research: ResearchScreen,
  Strategy: StrategyScreen
};
export const MyTeamNavigator = () => {
  const [active, setActive] = useState("Squad");
  const ActiveScreen = SUBTAB_SCREENS[active];
  const handleSubTabChange = useCallback(key => {
    setActive(key);
  }, []);
  return <SafeAreaView className="flex-1 bg-secondary" edges={["top"]}>
      <MyTeamTopBar />
      <MyTeamTabStrip active={active} onChange={handleSubTabChange} />
      <View className="flex-1">
        <Animated.View key={active} entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={{ flex: 1 }}>
          <ActiveScreen />
        </Animated.View>
      </View>
    </SafeAreaView>;
};

// Re-export the ordered sub-tab list so other components (e.g. deep-link
// config) can reference it without reaching into MyTeamTabStrip.
export { MY_TEAM_SUBTABS };

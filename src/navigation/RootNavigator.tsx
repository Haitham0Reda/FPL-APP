/**
 * Root navigator — bottom-tab bar + a single native stack over it
 * for modals (onboarding, paywall, player sheet, etc.).
 *
 * PRD §3 specifies 5 bottom tabs: Home · My Team · Live · Workbook · Profile.
 * "My Team" is a stack containing the horizontal sub-tab strip — the strip
 * itself is rendered inside MyTeamNavigator.
 */
import React from "react";
import { Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { colors, textStyle } from "../theme";
import { HomeScreen } from "../screens/home/HomeScreen";
import { LiveScreen } from "../screens/live/LiveScreen";
import { WorkbookScreen } from "../screens/workbook/WorkbookScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";
import { OnboardingScreen } from "../screens/onboarding/OnboardingScreen";
import { AddTeamScreen } from "../screens/onboarding/AddTeamScreen";
import { PaywallScreen } from "../screens/profile/PaywallScreen";
import { PlayerDetailScreen } from "../screens/myteam/PlayerDetailScreen";
import { MyTeamNavigator } from "./MyTeamNavigator";

import type { RootStackParamList, RootTabParamList } from "../types/navigation";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<RootTabParamList>();

/**
 * Bottom tab icon — kept as a tiny inline glyph via text so we don't
 * pull in an icon-font dependency for the scaffold. Drop in an
 * `Icon` component post-scaffold (e.g. lucide-react-native).
 */
const TabIcon: React.FC<{ glyph: string; focused: boolean }> = ({ glyph }) => (
  <Text>{glyph}</Text>
);

const BottomTabs: React.FC = () => (
  <Tabs.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: colors.bg.surface,
        borderTopColor: colors.border.subtle,
      },
      tabBarActiveTintColor: colors.accent.primary,
      tabBarInactiveTintColor: colors.text.secondary,
      tabBarLabelStyle: { ...textStyle.dataLabel, fontSize: 10 },
    }}
  >
    <Tabs.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon glyph="H" focused={focused} />,
      }}
    />
    <Tabs.Screen
      name="MyTeam"
      component={MyTeamNavigator}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon glyph="T" focused={focused} />,
      }}
    />
    <Tabs.Screen
      name="Live"
      component={LiveScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon glyph="L" focused={focused} />,
      }}
    />
    <Tabs.Screen
      name="Workbook"
      component={WorkbookScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon glyph="W" focused={focused} />,
      }}
    />
    <Tabs.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon glyph="P" focused={focused} />,
      }}
    />
  </Tabs.Navigator>
);

export const RootNavigator: React.FC = () => (
  <NavigationContainer>
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Tabs" component={BottomTabs} />
      <RootStack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ presentation: "modal" }}
      />
      <RootStack.Screen
        name="AddTeam"
        component={AddTeamScreen}
        options={{ presentation: "modal" }}
      />
      <RootStack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{ presentation: "modal" }}
      />
      <RootStack.Screen
        name="PlayerDetail"
        component={PlayerDetailScreen}
        options={{ presentation: "modal" }}
      />
    </RootStack.Navigator>
  </NavigationContainer>
);

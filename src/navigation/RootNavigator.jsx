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
import { TeamIdLoginScreen } from "../screens/onboarding/TeamIdLoginScreen";
import { PaywallScreen } from "../screens/profile/PaywallScreen";
import { PlayerDetailScreen } from "../screens/myteam/PlayerDetailScreen";
import { MyTeamNavigator } from "./MyTeamNavigator";

const RootStack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const TabIcon = ({ glyph, focused }) => (
  <Text style={{ color: focused ? colors.accent.primary : colors.text.secondary, fontSize: 18, fontWeight: '700' }}>
    {glyph}
  </Text>
);

const BottomTabs = () => (
  <Tabs.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: colors.bg.surface,
        borderTopColor: colors.border.subtle,
      },
      tabBarActiveTintColor: colors.accent.primary,
      tabBarInactiveTintColor: colors.text.secondary,
      tabBarLabelStyle: {
        ...textStyle.dataLabel,
        fontSize: 10,
      },
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

export const RootNavigator = () => (
  <NavigationContainer>
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Tabs" component={BottomTabs} />
      <RootStack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ presentation: "modal" }}
      />
      <RootStack.Screen
        name="TeamIdLogin"
        component={TeamIdLoginScreen}
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

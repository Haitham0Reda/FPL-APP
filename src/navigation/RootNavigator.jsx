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
import { AddTeamScreen } from "../screens/onboarding/AddTeamScreen";
import { PaywallScreen } from "../screens/profile/PaywallScreen";
import { PlayerDetailScreen } from "../screens/myteam/PlayerDetailScreen";
import { MyTeamNavigator } from "./MyTeamNavigator";
import { useAuthStore } from "../state/useAuth";
import { useTeamStore } from "../state/useTeamStore";
import { Home, Shirt, Radio, BookOpen, User } from "lucide-react-native";

const RootStack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const TabIcon = ({ name, focused }) => {
  const Icon = {
    Home: Home,
    MyTeam: Shirt,
    Live: Radio,
    Workbook: BookOpen,
    Profile: User,
  }[name];

  return <Icon size={22} color={focused ? colors.accent.primary : colors.text.secondary} strokeWidth={focused ? 2.5 : 2} />;
};

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
        tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} />,
      }}
    />
    <Tabs.Screen
      name="MyTeam"
      component={MyTeamNavigator}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon name="MyTeam" focused={focused} />,
      }}
    />
    <Tabs.Screen
      name="Live"
      component={LiveScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon name="Live" focused={focused} />,
      }}
    />
    <Tabs.Screen
      name="Workbook"
      component={WorkbookScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon name="Workbook" focused={focused} />,
      }}
    />
    <Tabs.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} />,
      }}
    />
  </Tabs.Navigator>
);

export const RootNavigator = () => {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn);
  // Also consider logged in if they have any team (draft or live)
  const hasTeams = useTeamStore(s => s.teams.length > 0);
  const showOnboarding = !isLoggedIn && !hasTeams;

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {showOnboarding ? (
          <>
            <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
            <RootStack.Screen name="AddTeam" component={AddTeamScreen} />
            <RootStack.Screen
              name="TeamIdLogin"
              component={TeamIdLoginScreen}
              options={{ presentation: "modal" }}
            />
          </>
        ) : (
          <>
            <RootStack.Screen name="Tabs" component={BottomTabs} />
            <RootStack.Screen
              name="TeamIdLogin"
              component={TeamIdLoginScreen}
              options={{ presentation: "modal" }}
            />
            <RootStack.Screen
              name="AddTeam"
              component={AddTeamScreen}
              options={{ presentation: "modal" }}
            />
          </>
        )}
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
};

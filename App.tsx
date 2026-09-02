/**
 * App entry — wraps the root navigator with all providers.
 *
 *   QueryClientProvider — TanStack Query cache (PRD §6.1)
 *   GestureHandlerRootView — required by react-native-gesture-handler
 *   SafeAreaProvider — safe-area context for screens
 *   StatusBar — dark theme consistent with PRD §2
 *
 * i18n is initialised by importing `i18n/index.ts` for side effects.
 */
import "react-native-gesture-handler";
import "./src/i18n";

import React from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "./src/app/queryClient";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { colors } from "./src/theme";

const App: React.FC = () => (
  <GestureHandlerRootView
    style={{ flex: 1, backgroundColor: colors.bg.primary }}
  >
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <RootNavigator />
      </QueryClientProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export default App;

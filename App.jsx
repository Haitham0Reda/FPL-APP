/**
 * App entry — wraps the root navigator with all providers.
 *
 * Handles first-launch bootstrap: if local FPL data is missing or stale,
 * fetches /bootstrap-static/ and /fixtures/ before showing the app.
 */

import "react-native-gesture-handler";
import "./global.css";
import "./src/i18n";
import React, { useState, useEffect, Component } from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { View, Text, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { queryClient } from "./src/app/queryClient";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { colors, textStyle } from "./src/theme";
import { usePlayerStore } from "./src/state/usePlayerStore";
import { bootstrapApp } from "./src/utils/bootstrap";

const BG_START = "rgba(16,185,129,0.06)";
const BG_END = colors.bg.primary;

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, componentStack: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error);
    console.error('[ErrorBoundary] Component Stack:', errorInfo.componentStack);
    this.setState({ componentStack: errorInfo.componentStack || '' });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ color: colors.status.danger, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
            Render Error
          </Text>
          <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 8 }}>
            {this.state.error?.message || 'Unknown error'}
          </Text>
          <Text style={{ color: colors.text.secondary, fontSize: 11 }}>
            {this.state.componentStack}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  const [bootstrapped, setBootstrapped] = useState(false);
  const [bootstrapError, setBootstrapError] = useState(null);
  const playerStatus = usePlayerStore(s => s.status);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const store = usePlayerStore.getState();
      if (store.status === 'ready') {
        setBootstrapped(true);
        return;
      }

      try {
        const ok = await bootstrapApp();
        if (!cancelled) {
          setBootstrapped(ok);
          if (!ok) {
            setBootstrapError(store.error || 'Failed to load FPL data');
          }
        }
      } catch (err) {
        if (!cancelled) {
          setBootstrapError(err.message || 'Failed to load FPL data');
          setBootstrapped(true);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!bootstrapped) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <StatusBar style="light" />
            <LinearGradient colors={[BG_START, BG_END]} style={{ flex: 1 }}>
              <View style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 32,
              }}>
                <Text style={[textStyle.headline, { color: colors.text.primary, marginBottom: 12 }]}>
                  Elite FPL
                </Text>
                <ActivityIndicator size="large" color={colors.accent.primary} />
                <Text style={[textStyle.caption, { color: colors.text.secondary, marginTop: 16 }]}>
                  Loading players, teams & fixtures...
                </Text>
              </View>
            </LinearGradient>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  if (bootstrapError) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <StatusBar style="light" />
            <LinearGradient colors={[BG_START, BG_END]} style={{ flex: 1 }}>
              <View style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 32,
              }}>
                <Text style={[textStyle.headline, { color: colors.text.primary, marginBottom: 12 }]}>
                  Can't reach FPL
                </Text>
                <Text style={[textStyle.body, { color: colors.text.secondary, textAlign: 'center', marginBottom: 24 }]}>
                  {bootstrapError}. Check your connection and try again.
                </Text>
              </View>
            </LinearGradient>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <LinearGradient colors={[BG_START, BG_END]} style={{ flex: 1 }}>
            <ErrorBoundary>
              <RootNavigator />
            </ErrorBoundary>
          </LinearGradient>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;

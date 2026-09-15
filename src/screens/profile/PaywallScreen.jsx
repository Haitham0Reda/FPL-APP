/**
 * src/screens/profile/PaywallScreen.jsx
 *
 * Demo unlock paywall screen for Pro tier.
 */

import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { Button } from '@/components/primitives/Button';
import { colors } from '@/theme/colors';
import { useSettingsStore } from '@/state/useSettingsStore';

export function PaywallScreen({ navigation }) {
  const isPro = useSettingsStore(s => s.isPro);
  const togglePro = useSettingsStore(s => s.togglePro);

  const handleUnlock = () => {
    togglePro();
    navigation.goBack();
  };

  return (
    <View className="flex-1">
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={['rgba(16,185,129,0.06)', 'transparent', colors.bg.primary]}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView contentContainerClassName="p-5 grow justify-center">
        <View className="items-center mb-8">
          <Text className="text-5xl mb-4">
            👑
          </Text>
          <Text className="text-text-primary text-[28px] font-bold mb-2 text-center">
            Unlock Elite FPL Pro
          </Text>
          <Text className="text-text-secondary text-base text-center leading-6">
            Unlimited teams, drafts, and advanced analytics.
          </Text>
        </View>

        <Card shadow elevation="overlay" padding="2xl" className="mb-6">
          <Text className="text-text-primary text-lg font-semibold mb-4">
            Free tier
          </Text>
          <Text className="text-text-secondary text-sm leading-[22px] mb-2">
            • 1 live team
          </Text>
          <Text className="text-text-secondary text-sm leading-[22px] mb-2">
            • 2 drafts
          </Text>
          <Text className="text-text-secondary text-sm leading-[22px]">
            • Basic recommendations
          </Text>
        </Card>

        <Card shadow elevation="overlay" padding="2xl" className="mb-6 bg-[#065F46] border-primary">
          <Text className="text-primary text-lg font-semibold mb-4">
            Pro tier (Demo)
          </Text>
          <Text className="text-text-primary text-sm leading-[22px] mb-2">
            • Unlimited teams & drafts
          </Text>
          <Text className="text-text-primary text-sm leading-[22px] mb-2">
            • Advanced xPts engine
          </Text>
          <Text className="text-text-primary text-sm leading-[22px] mb-2">
            • Transfer solver
          </Text>
          <Text className="text-text-primary text-sm leading-[22px]">
            • Priority support
          </Text>
        </Card>

        <Button title={isPro ? 'Pro Active (Demo)' : 'Unlock Pro (Demo)'} onPress={handleUnlock} />

        <Pressable onPress={() => navigation.goBack()} className="mt-4 items-center">
          <Text className="text-text-secondary text-sm">
            Maybe later
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

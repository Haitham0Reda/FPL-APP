/**
 * src/screens/profile/PaywallScreen.jsx
 *
 * Demo unlock paywall screen for Pro tier.
 */

import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
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
    <View style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <ScrollView contentContainerStyle={{ padding: 20, flexGrow: 1, justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text style={{
            fontSize: 48,
            marginBottom: 16,
          }}>
            👑
          </Text>
          <Text style={{
            color: colors.text.primary,
            fontSize: 28,
            fontWeight: '700',
            marginBottom: 8,
            textAlign: 'center',
          }}>
            Unlock Elite FPL Pro
          </Text>
          <Text style={{
            color: colors.text.secondary,
            fontSize: 16,
            textAlign: 'center',
            lineHeight: 24,
          }}>
            Unlimited teams, drafts, and advanced analytics.
          </Text>
        </View>

        <Card style={{ padding: 24, marginBottom: 24 }}>
          <Text style={{
            color: colors.text.primary,
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 16,
          }}>
            Free tier
          </Text>
          <Text style={{ color: colors.text.secondary, fontSize: 14, lineHeight: 22, marginBottom: 8 }}>
            • 1 live team
          </Text>
          <Text style={{ color: colors.text.secondary, fontSize: 14, lineHeight: 22, marginBottom: 8 }}>
            • 2 drafts
          </Text>
          <Text style={{ color: colors.text.secondary, fontSize: 14, lineHeight: 22 }}>
            • Basic recommendations
          </Text>
        </Card>

        <Card style={{ padding: 24, marginBottom: 24, backgroundColor: '#065F46', borderColor: '#10B981' }}>
          <Text style={{
            color: '#10B981',
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 16,
          }}>
            Pro tier (Demo)
          </Text>
          <Text style={{ color: '#F8FAFC', fontSize: 14, lineHeight: 22, marginBottom: 8 }}>
            • Unlimited teams & drafts
          </Text>
          <Text style={{ color: '#F8FAFC', fontSize: 14, lineHeight: 22, marginBottom: 8 }}>
            • Advanced xPts engine
          </Text>
          <Text style={{ color: '#F8FAFC', fontSize: 14, lineHeight: 22, marginBottom: 8 }}>
            • Transfer solver
          </Text>
          <Text style={{ color: '#F8FAFC', fontSize: 14, lineHeight: 22 }}>
            • Priority support
          </Text>
        </Card>

        <Button title={isPro ? 'Pro Active (Demo)' : 'Unlock Pro (Demo)'} onPress={handleUnlock} />

        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 16, alignItems: 'center' }}>
          <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
            Maybe later
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

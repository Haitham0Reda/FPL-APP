/**
 * src/screens/onboarding/TeamIdLoginScreen.jsx
 *
 * "Login" via FPL Team ID — no password collected. The user finds their
 * Team ID in the URL when viewing their team on the official FPL site:
 * fantasy.premierleague.com/entry/{TEAM_ID}/event/{gw}
 *
 * Polished: emerald focus ring, inline "#" icon, live-validating helper,
 * elevated shadow, and expo-blur backdrop.
 */

import React, { useState, useCallback } from 'react';
import { View, TextInput, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Hash } from 'lucide-react-native';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { Button } from '@/components/primitives/Button';
import { useAuthStore } from '@/state/useAuth';
import { useTeamStore } from '@/state/useTeamStore';
import { useNavigation } from '@react-navigation/native';
import { validateTeamId } from '@/hooks/useFplData';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme';

export function TeamIdLoginScreen({
  onSuccess
}) {
  const navigation = useNavigation();
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [valid, setValid] = useState(null);

  const setTeamId = useAuthStore(s => s.setTeamId);
  const addLiveTeam = useTeamStore(s => s.addLiveTeam);

  const handleValidate = useCallback(async () => {
    const teamId = parseInt(input.trim(), 10);
    if (!Number.isFinite(teamId) || teamId <= 0) {
      setValid(null);
      setError('Enter a valid Team ID (numbers only).');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const exists = await validateTeamId(teamId);
      if (exists) {
        setValid(true);
      } else {
        setValid(false);
        setError("Couldn't find that Team ID. Double-check it and try again.");
      }
    } catch (err) {
      setValid(false);
      setError(err.message || 'Network error — check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [input]);

  const handleConnect = async () => {
    await handleValidate();
    const teamId = parseInt(input.trim(), 10);
    if (valid) {
      await addLiveTeam(teamId);
      setTeamId(teamId);
      onSuccess?.();
      navigation.goBack();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={['rgba(16,185,129,0.06)', 'transparent', colors.bg.primary]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
        <Card shadow elevation="overlay" padding="2xl" style={{ width: '100%', maxWidth: 340 }}>
          <Text style={{
            color: colors.text.primary,
            fontSize: 24,
            fontWeight: '700',
            marginBottom: 8,
            textAlign: 'center',
          }}>
            Connect your FPL team
          </Text>
          <Text preset="body" style={{ color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.xl }}>
            Enter your Team ID. You'll find it in the URL when viewing your team on the official FPL site — no password needed.
          </Text>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.bg.surface,
            borderRadius: radius.lg,
            borderWidth: 1.5,
            borderColor: focused ? colors.accent.primary : valid === true ? colors.accent.primary : colors.border.subtle,
            paddingHorizontal: spacing.base,
            marginBottom: spacing.sm,
          }}>
            <Hash size={20} color={focused || valid === true ? colors.accent.primary : colors.text.secondary} strokeWidth={2} />
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="e.g. 1234567"
              placeholderTextColor={colors.text.secondary}
              keyboardType="number-pad"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                flex: 1,
                color: colors.text.primary,
                fontSize: 16,
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.sm,
              }}
            />
          </View>

          <View style={{ height: 20, marginBottom: spacing.md, justifyContent: 'center' }}>
            {error && <Text style={{ color: colors.status.danger, fontSize: 13 }}>{error}</Text>}
            {!error && valid === true && (
              <Text style={{ color: colors.accent.primary, fontSize: 13 }}>Looks good</Text>
            )}
            {!error && valid === null && !focused && input.length === 0 && (
              <Text style={{ color: colors.text.secondary, fontSize: 13 }}>Team IDs are 6–8 digits</Text>
            )}
          </View>

          <Button
            title={loading ? 'Checking...' : 'Connect'}
            onPress={handleConnect}
            disabled={loading || input.length === 0}
          />
        </Card>
      </View>
    </View>
  );
}

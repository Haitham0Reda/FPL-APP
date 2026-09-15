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

import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
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

  const handleConnect = async () => {
    const teamId = parseInt(input.trim(), 10);
    if (!Number.isFinite(teamId) || teamId <= 0) {
      setError('Enter a valid Team ID (numbers only).');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const exists = await validateTeamId(teamId);
      if (exists) {
        setValid(true);
        await addLiveTeam(teamId);
        setTeamId(teamId);
        onSuccess?.();
        navigation.goBack();
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
  };

  const inputHighlighted = focused || valid === true;

  return (
    <View className="flex-1">
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={['rgba(16,185,129,0.06)', 'transparent', colors.bg.primary]}
        style={StyleSheet.absoluteFillObject}
      />

      <View className="flex-1 justify-center items-center p-6">
        <Card shadow elevation="overlay" padding="2xl" className="w-full max-w-[340px]">
          <Text className="text-text-primary text-2xl font-bold mb-2 text-center">
            Connect your FPL team
          </Text>
          <Text preset="body" className="text-text-secondary text-center mb-6">
            Enter your Team ID. You'll find it in the URL when viewing your team on the official FPL site — no password needed.
          </Text>

          <View className={`flex-row items-center bg-surface rounded-xl border-[1.5px] px-4 mb-2 ${inputHighlighted ? 'border-primary' : 'border-border'}`}>
            <Hash size={20} color={inputHighlighted ? colors.accent.primary : colors.text.secondary} strokeWidth={2} />
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="e.g. 1234567"
              placeholderTextColor={colors.text.secondary}
              keyboardType="number-pad"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="flex-1 text-text-primary text-base py-3 px-2"
            />
          </View>

          <View className="h-5 mb-3 justify-center">
            {error && <Text className="text-status-danger text-[13px]">{error}</Text>}
            {!error && valid === true && (
              <Text className="text-primary text-[13px]">Looks good</Text>
            )}
            {!error && valid === null && !focused && input.length === 0 && (
              <Text className="text-text-secondary text-[13px]">Team IDs are 6–8 digits</Text>
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

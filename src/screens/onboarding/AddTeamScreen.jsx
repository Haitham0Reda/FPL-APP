/**
 * AddTeamScreen — first-team entry point after onboarding.
 *
 * PRD §5.1: Team ID entry with inline validation + 'I don't have a team yet' → manual draft builder.
 * The only two ways to add a team are: enter a real FPL Team ID, or start a blank draft.
 */

import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Hash } from 'lucide-react-native';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { Button } from '@/components/primitives/Button';
import { colors } from '@/theme/colors';
import { useTeamStore } from '@/state/useTeamStore';
import { useAuthStore } from '@/state/useAuth';
import { useNavigation } from '@react-navigation/native';
import { validateTeamId } from '@/hooks/useFplData';

export function AddTeamScreen() {
  const [input, setInput] = useState('');
  const [focused, setFocused] = useState(false);
  const [validating, setValidating] = useState(false);
  const [valid, setValid] = useState(null);
  const [error, setError] = useState(null);

  const addDraftTeam = useTeamStore(s => s.addDraftTeam);
  const addLiveTeam = useTeamStore(s => s.addLiveTeam);
  const setTeamId = useAuthStore(s => s.setTeamId);
  const navigation = useNavigation();

  const handleConnect = async () => {
    const teamId = parseInt(input.trim(), 10);
    if (!Number.isFinite(teamId) || teamId <= 0) {
      setValid(null);
      setError('Enter a valid Team ID (numbers only).');
      return;
    }
    setError(null);
    setValidating(true);
    try {
      const exists = await validateTeamId(teamId);
      if (exists) {
        setValid(true);
        await addLiveTeam(teamId);
        setTeamId(teamId);
        navigation.replace('Tabs');
      } else {
        setValid(false);
        setError("Couldn't find that Team ID. Double-check it and try again.");
      }
    } catch (err) {
      setValid(false);
      setError(err.message || 'Network error — check your connection and try again.');
    } finally {
      setValidating(false);
    }
  };

  const handleBlankDraft = () => {
    addDraftTeam('My Draft');
    navigation.replace('Tabs');
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
            Add your first team
          </Text>
          <Text preset="body" className="text-text-secondary text-center mb-6">
            Connect your FPL Team ID or start a blank draft to begin.
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
            title={validating ? 'Checking...' : 'Connect'}
            onPress={handleConnect}
            disabled={validating || input.length === 0}
            className="mb-3"
          />

          <View className="flex-row items-center my-3">
            <View className="flex-1 h-px bg-border" />
            <Text className="text-text-secondary text-xs px-2">or</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          <Button title="Start a blank draft" onPress={handleBlankDraft} variant="secondary" />
        </Card>
      </View>
    </View>
  );
}

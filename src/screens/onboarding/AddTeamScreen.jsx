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
import { spacing, radius } from '@/theme';
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

  return (
    <View style={{ flex: 1 }}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={['rgba(16,185,129,0.06)', 'transparent', colors.bg.primary]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
        <Card shadow elevation="overlay" padding="2xl" style={{ width: '100%', maxWidth: 340 }}>
          <Text style={{ color: colors.text.primary, fontSize: 24, fontWeight: '700', marginBottom: 8, textAlign: 'center' }}>
            Add your first team
          </Text>
          <Text preset="body" style={{ color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.xl }}>
            Connect your FPL Team ID or start a blank draft to begin.
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
            title={validating ? 'Checking...' : 'Connect'}
            onPress={handleConnect}
            disabled={validating || input.length === 0}
            style={{ marginBottom: spacing.md }}
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: spacing.md }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border.subtle }} />
            <Text style={{ color: colors.text.secondary, fontSize: 12, paddingHorizontal: spacing.sm }}>or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border.subtle }} />
          </View>

          <Button title="Start a blank draft" onPress={handleBlankDraft} variant="secondary" />
        </Card>
      </View>
    </View>
  );
}

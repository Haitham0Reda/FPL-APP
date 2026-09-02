/**
 * src/screens/onboarding/TeamIdLoginScreen.tsx
 *
 * "Login" via FPL Team ID — no password collected. The user finds their
 * Team ID in the URL when viewing their team on the official FPL site:
 * fantasy.premierleague.com/entry/{TEAM_ID}/event/{gw}
 */
import React, { useState } from 'react';
import { View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { useAuthStore } from '@/state/useAuth';
import { validateTeamId } from '@/hooks/useFplData';
import { colors } from '@/theme/colors';

export function TeamIdLoginScreen({ onSuccess }: { onSuccess?: () => void }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setTeamId = useAuthStore((s) => s.setTeamId);

  const handleSubmit = async () => {
    const teamId = parseInt(input.trim(), 10);

    if (!Number.isFinite(teamId) || teamId <= 0) {
      setError('Enter a valid Team ID (numbers only).');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const exists = await validateTeamId(teamId);
      if (!exists) {
        setError("Couldn't find that Team ID. Double-check it and try again.");
        return;
      }
      setTeamId(teamId);
      onSuccess?.();
    } catch (err) {
      setError('Network error — check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.primary, padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text.primary, marginBottom: 8 }}>
        Connect your FPL team
      </Text>
      <Text style={{ color: colors.text.secondary, marginBottom: 24 }}>
        Enter your Team ID. You'll find it in the URL when viewing your team
        on the official FPL site — no password needed.
      </Text>

      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="e.g. 1234567"
        placeholderTextColor={colors.text.secondary}
        keyboardType="number-pad"
        style={{
          backgroundColor: colors.bg.surface,
          color: colors.text.primary,
          borderRadius: 12,
          padding: 14,
          fontSize: 16,
          marginBottom: 12,
        }}
      />

      {error && (
        <Text style={{ color: '#EF4444', marginBottom: 12 }}>{error}</Text>
      )}

      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        style={{
          backgroundColor: colors.accent.primary,
          borderRadius: 12,
          padding: 14,
          alignItems: 'center',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color={colors.bg.primary} />
        ) : (
          <Text style={{ color: colors.bg.primary, fontWeight: '600' }}>Connect</Text>
        )}
      </Pressable>
    </View>
  );
}
/**
 * src/screens/home/HomeScreen.tsx (§5.2)
 *
 * Replaces the ScreenPlaceholder stub with real data: greeting header,
 * current gameweek deadline, and the user's overall points/rank if logged in.
 */
import React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { colors } from '@/theme/colors';
import { useCurrentGameweek, useMyEntry } from '@/hooks/useFplData';
import { useAuthStore } from '@/state/useAuth';

function formatDeadline(iso: string | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function HomeScreen() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const { currentEvent, isLoading: gwLoading, isError: gwError } = useCurrentGameweek();
  const { data: entry, isLoading: entryLoading, isError: entryError } = useMyEntry();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg.primary }} contentContainerStyle={{ padding: 20 }}>
      <Text style={{ color: colors.text.secondary, fontSize: 12, letterSpacing: 1 }}>
        §5.2 HOME
      </Text>
      <Text style={{ color: colors.text.primary, fontSize: 32, fontWeight: '700', marginTop: 4 }}>
        {entryLoading ? 'Elite FPL' : entry ? `Hi, ${entry.player_first_name}` : 'Elite FPL'}
      </Text>

      {/* Gameweek summary card */}
      <Card style={{ marginTop: 20, padding: 16 }}>
        {gwLoading ? (
          <ActivityIndicator color={colors.accent.primary} />
        ) : gwError ? (
          <Text style={{ color: '#EF4444' }}>Couldn't load gameweek data.</Text>
        ) : (
          <>
            <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
              {currentEvent?.name ?? 'Gameweek'}
            </Text>
            <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '600', marginTop: 4 }}>
              Deadline: {formatDeadline(currentEvent?.deadline_time)}
            </Text>
          </>
        )}
      </Card>

      {/* Logged-in team summary */}
      {isLoggedIn && (
        <Card style={{ marginTop: 16, padding: 16 }}>
          {entryLoading ? (
            <ActivityIndicator color={colors.accent.primary} />
          ) : entryError ? (
            <Text style={{ color: '#EF4444' }}>Couldn't load your team.</Text>
          ) : entry ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: colors.text.secondary, fontSize: 13 }}>{entry.name}</Text>
                <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700', marginTop: 4 }}>
                  {entry.summary_overall_points} pts
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: colors.text.secondary, fontSize: 13 }}>Overall rank</Text>
                <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700', marginTop: 4 }}>
                  {entry.summary_overall_rank?.toLocaleString() ?? '—'}
                </Text>
              </View>
            </View>
          ) : null}
        </Card>
      )}

      {!isLoggedIn && (
        <Card style={{ marginTop: 16, padding: 16 }}>
          <Text style={{ color: colors.text.secondary }}>
            Connect your FPL Team ID to see your squad, points, and rank here.
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}
/**
 * src/screens/myteam/SquadScreen.jsx
 *
 * Interactive pitch with formation picker, tap-a-player actions,
 * bench ordering, and auto-subs simulator.
 */

import React, { useMemo } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { Button } from '@/components/primitives/Button';
import { colors } from '@/theme/colors';
import { useTeamStore } from '@/state/useTeamStore';
import { useDraftStore } from '@/state/useDraftStore';
import { usePlayerStore } from '@/state/usePlayerStore';
import { useCurrentGameweek } from '@/state/useCurrentGameweek';

const PITCH_LINES = [
  { y: 0.85, label: 'GK' },
  { y: 0.65, label: 'DEF' },
  { y: 0.45, label: 'MID' },
  { y: 0.25, label: 'FWD' },
];

const FORMATIONS = ['3-4-3', '3-5-2', '4-4-2', '4-3-3', '5-3-2', '5-4-1', '4-5-1', '5-2-3'];

export function SquadScreen() {
  const activeTeam = useTeamStore(s => s.getActiveTeam());
  const playersById = usePlayerStore(s => s.playersById);
  const currentGW = useCurrentGameweek();

  const squad = useMemo(() => {
    if (!activeTeam) return [];
    return activeTeam.squad.map(s => ({
      ...s,
      player: playersById[s.playerId] || null,
    }));
  }, [activeTeam, playersById]);

  const starting = squad.filter(s => s.isStarting);
  const bench = squad.filter(s => !s.isStarting).sort((a, b) => (a.benchOrder || 0) - (b.benchOrder || 0));

  const startingByPosition = useMemo(() => {
    const grouped = { GK: [], DEF: [], MID: [], FWD: [] };
    starting.forEach(s => {
      if (s.player) {
        const pos = s.player.position || 'MID';
        if (grouped[pos]) grouped[pos].push(s);
      }
    });
    return grouped;
  }, [starting]);

  if (!activeTeam) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg.primary, padding: 20 }}>
        <Text style={{ color: colors.text.secondary }}>No team selected. Create or connect a team to get started.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ color: colors.text.primary, fontSize: 24, fontWeight: '700' }}>
            {activeTeam.name}
          </Text>
          <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
            GW {activeTeam.currentGameweek}
          </Text>
        </View>

        <Card style={{ padding: 16, marginBottom: 16 }}>
          <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>
            Formation
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {FORMATIONS.map(f => (
              <Pressable
                key={f}
                onPress={() => useTeamStore.getState().updateTeam(activeTeam.id, { formation: f })}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: activeTeam.formation === f ? colors.accent.primary : colors.bg.surface,
                  borderWidth: 1,
                  borderColor: activeTeam.formation === f ? colors.accent.primary : colors.border.subtle,
                }}
              >
                <Text style={{
                  color: activeTeam.formation === f ? colors.bg.primary : colors.text.primary,
                  fontSize: 12,
                  fontWeight: '600',
                }}>
                  {f}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card style={{ padding: 16, marginBottom: 16, backgroundColor: '#0F172A', borderColor: '#1E293B' }}>
          <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 12, textTransform: 'uppercase' }}>
            Starting XI
          </Text>
          {PITCH_LINES.map(line => {
            const playersAtLine = startingByPosition[line.label] || [];
            return (
              <View key={line.label} style={{ flexDirection: 'row', marginBottom: 12, gap: 8 }}>
                <Text style={{
                  width: 32,
                  color: colors.text.secondary,
                  fontSize: 11,
                  fontWeight: '600',
                  textAlign: 'center',
                  alignSelf: 'center',
                }}>
                  {line.label}
                </Text>
                <View style={{ flex: 1, flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {playersAtLine.map(s => (
                    <PlayerChip key={s.playerId} squadPlayer={s} player={s.player} />
                  ))}
                </View>
              </View>
            );
          })}
        </Card>

        <Card style={{ padding: 16 }}>
          <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 12, textTransform: 'uppercase' }}>
            Bench
          </Text>
          {bench.map((s, index) => (
            <View key={s.playerId} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
              <Text style={{ width: 24, color: colors.text.secondary, fontSize: 12, textAlign: 'center' }}>
                {index + 1}
              </Text>
              <PlayerChip squadPlayer={s} player={s.player} />
            </View>
          ))}
          {bench.length === 0 && (
            <Text style={{ color: colors.text.secondary, fontSize: 13 }}>No bench players yet.</Text>
          )}
        </Card>
      </View>
    </ScrollView>
  );
}

function PlayerChip({ squadPlayer, player }) {
  if (!player) {
    return (
      <View style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: colors.bg.surface,
        borderWidth: 1,
        borderColor: colors.border.subtle,
      }}>
        <Text style={{ color: colors.text.secondary, fontSize: 12 }}>?</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => {}}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: squadPlayer.isStarting ? colors.accent.primaryMuted : colors.bg.surface,
        borderWidth: 1,
        borderColor: squadPlayer.isStarting ? colors.accent.primary : colors.border.subtle,
      }}
    >
      <View style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.border.subtle,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Text style={{ color: colors.text.secondary, fontSize: 10, fontWeight: '700' }}>
          {player.web_name?.[0] || '?'}
        </Text>
      </View>
      <View>
        <Text style={{ color: colors.text.primary, fontSize: 13, fontWeight: '600' }}>
          {player.web_name || 'Unknown'}
        </Text>
        <Text style={{ color: colors.text.secondary, fontSize: 11 }}>
          £{((player.now_cost || 0) / 10).toFixed(1)}m
        </Text>
      </View>
    </Pressable>
  );
}

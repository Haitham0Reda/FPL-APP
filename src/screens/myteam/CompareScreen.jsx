/**
 * src/screens/myteam/CompareScreen.jsx
 *
 * Two teams/drafts (shared vs differential players) or two players
 * (stat grid — not a radar chart, per the PRD).
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { colors } from '@/theme/colors';
import { useTeamStore } from '@/state/useTeamStore';
import { usePlayerStore } from '@/state/usePlayerStore';

export function CompareScreen() {
  const teams = useTeamStore(s => s.teams);
  const activeTeam = useTeamStore(s => s.getActiveTeam());
  const playersById = usePlayerStore(s => s.playersById);
  const [teamAId, setTeamAId] = useState(null);
  const [teamBId, setTeamBId] = useState(null);

  const teamA = teams.find(t => t.id === teamAId);
  const teamB = teams.find(t => t.id === teamBId);

  const comparison = useMemo(() => {
    if (!teamA || !teamB) return null;

    const squadA = teamA.squad.map(s => s.playerId);
    const squadB = teamB.squad.map(s => s.playerId);

    const shared = squadA.filter(id => squadB.includes(id));
    const onlyA = squadA.filter(id => !squadB.includes(id));
    const onlyB = squadB.filter(id => !squadA.includes(id));

    return { shared, onlyA, onlyB };
  }, [teamA, teamB]);

  if (teams.length < 2) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg.primary, padding: 20 }}>
        <Text style={{ color: colors.text.secondary }}>
          Create at least 2 teams or drafts to compare them.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <View style={{ padding: 20 }}>
        <Text style={{ color: colors.text.primary, fontSize: 24, fontWeight: '700', marginBottom: 16 }}>
          Compare
        </Text>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>
              Team A
            </Text>
            {teams.map(t => (
              <Pressable
                key={t.id}
                onPress={() => setTeamAId(t.id)}
                style={{
                  padding: 12,
                  marginBottom: 8,
                  borderRadius: 8,
                  backgroundColor: teamAId === t.id ? colors.accent.primaryMuted : colors.bg.surface,
                  borderWidth: 1,
                  borderColor: teamAId === t.id ? colors.accent.primary : colors.border.subtle,
                }}
              >
                <Text style={{
                  color: teamAId === t.id ? colors.accent.primary : colors.text.primary,
                  fontSize: 14,
                  fontWeight: '600',
                }}>
                  {t.name}
                </Text>
                <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                  {t.isLive ? 'Live' : 'Draft'}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>
              Team B
            </Text>
            {teams.map(t => (
              <Pressable
                key={t.id}
                onPress={() => setTeamBId(t.id)}
                style={{
                  padding: 12,
                  marginBottom: 8,
                  borderRadius: 8,
                  backgroundColor: teamBId === t.id ? colors.accent.primaryMuted : colors.bg.surface,
                  borderWidth: 1,
                  borderColor: teamBId === t.id ? colors.accent.primary : colors.border.subtle,
                }}
              >
                <Text style={{
                  color: teamBId === t.id ? colors.accent.primary : colors.text.primary,
                  fontSize: 14,
                  fontWeight: '600',
                }}>
                  {t.name}
                </Text>
                <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                  {t.isLive ? 'Live' : 'Draft'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {comparison && (
          <>
            <Card style={{ padding: 16, marginBottom: 16 }}>
              <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>
                Shared Players ({comparison.shared.length})
              </Text>
              {comparison.shared.map(id => {
                const player = playersById[id];
                if (!player) return null;
                return (
                  <View key={id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 12 }}>
                    <Text style={{ color: colors.text.primary, fontSize: 14 }}>{player.web_name}</Text>
                    <Text style={{ color: colors.text.secondary, fontSize: 12 }}>£{((player.now_cost || 0) / 10).toFixed(1)}m</Text>
                  </View>
                );
              })}
            </Card>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Card style={{ flex: 1, padding: 16 }}>
                <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>
                  Only in {teamA.name}
                </Text>
                {comparison.onlyA.map(id => {
                  const player = playersById[id];
                  if (!player) return null;
                  return (
                    <View key={id} style={{ marginBottom: 8 }}>
                      <Text style={{ color: colors.text.primary, fontSize: 14 }}>{player.web_name}</Text>
                    </View>
                  );
                })}
              </Card>

              <Card style={{ flex: 1, padding: 16 }}>
                <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>
                  Only in {teamB.name}
                </Text>
                {comparison.onlyB.map(id => {
                  const player = playersById[id];
                  if (!player) return null;
                  return (
                    <View key={id} style={{ marginBottom: 8 }}>
                      <Text style={{ color: colors.text.primary, fontSize: 14 }}>{player.web_name}</Text>
                    </View>
                  );
                })}
              </Card>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

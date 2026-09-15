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
import { useTeamStore } from '@/state/useTeamStore';
import { usePlayerStore } from '@/state/usePlayerStore';

export function CompareScreen() {
  const teams = useTeamStore(s => s.teams);
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
      <View className="flex-1 bg-secondary p-5">
        <Text className="text-text-secondary">
          Create at least 2 teams or drafts to compare them.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-secondary">
      <View className="p-5">
        <Text className="text-text-primary text-2xl font-bold mb-4">
          Compare
        </Text>

        <View className="flex-row gap-3 mb-6">
          <View className="flex-1">
            <Text className="text-text-secondary text-xs mb-2 uppercase">
              Team A
            </Text>
            {teams.map(t => (
              <Pressable
                key={t.id}
                onPress={() => setTeamAId(t.id)}
                className={`p-3 mb-2 rounded-lg border ${teamAId === t.id ? 'bg-accent-muted border-primary' : 'bg-surface border-border'}`}
              >
                <Text className={`text-sm font-semibold ${teamAId === t.id ? 'text-primary' : 'text-text-primary'}`}>
                  {t.name}
                </Text>
                <Text className="text-text-secondary text-xs">
                  {t.isLive ? 'Live' : 'Draft'}
                </Text>
              </Pressable>
            ))}
          </View>

          <View className="flex-1">
            <Text className="text-text-secondary text-xs mb-2 uppercase">
              Team B
            </Text>
            {teams.map(t => (
              <Pressable
                key={t.id}
                onPress={() => setTeamBId(t.id)}
                className={`p-3 mb-2 rounded-lg border ${teamBId === t.id ? 'bg-accent-muted border-primary' : 'bg-surface border-border'}`}
              >
                <Text className={`text-sm font-semibold ${teamBId === t.id ? 'text-primary' : 'text-text-primary'}`}>
                  {t.name}
                </Text>
                <Text className="text-text-secondary text-xs">
                  {t.isLive ? 'Live' : 'Draft'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {comparison && (
          <>
            <Card className="mb-4">
              <Text className="text-text-secondary text-xs mb-2 uppercase">
                Shared Players ({comparison.shared.length})
              </Text>
              {comparison.shared.map(id => {
                const player = playersById[id];
                if (!player) return null;
                return (
                  <View key={id} className="flex-row items-center mb-2 gap-3">
                    <Text className="text-text-primary text-sm">{player.web_name}</Text>
                    <Text className="text-text-secondary text-xs">£{(Number(player.now_cost || 0) / 10).toFixed(1)}m</Text>
                  </View>
                );
              })}
            </Card>

            <View className="flex-row gap-3">
              <Card className="flex-1">
                <Text className="text-text-secondary text-xs mb-2 uppercase">
                  Only in {teamA.name}
                </Text>
                {comparison.onlyA.map(id => {
                  const player = playersById[id];
                  if (!player) return null;
                  return (
                    <View key={id} className="mb-2">
                      <Text className="text-text-primary text-sm">{player.web_name}</Text>
                    </View>
                  );
                })}
              </Card>

              <Card className="flex-1">
                <Text className="text-text-secondary text-xs mb-2 uppercase">
                  Only in {teamB.name}
                </Text>
                {comparison.onlyB.map(id => {
                  const player = playersById[id];
                  if (!player) return null;
                  return (
                    <View key={id} className="mb-2">
                      <Text className="text-text-primary text-sm">{player.web_name}</Text>
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

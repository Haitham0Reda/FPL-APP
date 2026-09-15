/**
 * src/screens/myteam/CaptainScreen.jsx
 *
 * Ranked captain candidates using the engine, with one-line "why,"
 * Balanced vs Differential toggle, set captain/vice, captain log.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { Button } from '@/components/primitives/Button';
import { useTeamStore } from '@/state/useTeamStore';
import { usePlayerStore } from '@/state/usePlayerStore';
import { useDraftStore } from '@/state/useDraftStore';
import { rankCaptains, DEFAULT_WEIGHTS } from '@/services/recommendations';

export function CaptainScreen() {
  const activeTeam = useTeamStore(s => s.getActiveTeam());
  const playersById = usePlayerStore(s => s.playersById);
  const draft = useDraftStore(s => s.getSelectedDraft());
  const [mode, setMode] = useState('balanced');

  const candidates = useMemo(() => {
    if (!activeTeam || !draft) return [];

    const squadPlayers = activeTeam.squad
      .filter(s => s.isStarting)
      .map(s => ({
        player: playersById[s.playerId],
        projection: {
          playerId: s.playerId,
          xPts: ((playersById[s.playerId]?.form || 0) / 8) * 6,
          factors: {
            fixtureDifficulty: 0.7,
            formWeight: (playersById[s.playerId]?.form || 0) / 8,
            underlyingStatsWeight: (playersById[s.playerId]?.xGI || 0) / 15,
            minutesRisk: playersById[s.playerId]?.minutesRisk === 'none' ? 1 : 0.5,
          },
        },
      }))
      .filter(c => c.player);

    return rankCaptains(squadPlayers, {
      differential: mode === 'differential',
      weights: DEFAULT_WEIGHTS,
    });
  }, [activeTeam, draft, playersById, mode]);

  const handleSetCaptain = (playerId) => {
    const draftId = draft?.id || activeTeam?.id;
    if (!draftId) return;
    useDraftStore.getState().setCaptain(draftId, playerId);
    useTeamStore.getState().updateTeam(activeTeam.id, { captainId: playerId });
  };

  const handleSetVice = (playerId) => {
    const draftId = draft?.id || activeTeam?.id;
    if (!draftId) return;
    useDraftStore.getState().setViceCaptain(draftId, playerId);
    useTeamStore.getState().updateTeam(activeTeam.id, { viceCaptainId: playerId });
  };

  if (!activeTeam) {
    return (
      <View className="flex-1 bg-secondary p-5">
        <Text className="text-text-secondary">No team selected.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-secondary">
      <View className="p-5">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-text-primary text-2xl font-bold">
            Captain
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setMode('balanced')}
              className={`px-3 py-1.5 rounded-lg border ${mode === 'balanced' ? 'bg-primary border-primary' : 'bg-surface border-border'}`}
            >
              <Text className={`text-xs font-semibold ${mode === 'balanced' ? 'text-secondary' : 'text-text-primary'}`}>
                Balanced
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode('differential')}
              className={`px-3 py-1.5 rounded-lg border ${mode === 'differential' ? 'bg-primary border-primary' : 'bg-surface border-border'}`}
            >
              <Text className={`text-xs font-semibold ${mode === 'differential' ? 'text-secondary' : 'text-text-primary'}`}>
                Differential
              </Text>
            </Pressable>
          </View>
        </View>

        {activeTeam.captainId && (
          <Card className="mb-4 bg-[#065F46] border-primary">
            <Text className="text-primary text-xs mb-1 uppercase">
              Current Captain
            </Text>
            <Text className="text-text-primary text-lg font-bold">
              {playersById[activeTeam.captainId]?.web_name || 'Unknown'}
            </Text>
          </Card>
        )}

        {candidates.map((candidate, index) => {
          const player = playersById[candidate.playerId];
          if (!player) return null;

          return (
            <Card key={candidate.playerId} className="mb-3">
              <View className="flex-row items-center gap-3 mb-3">
                <View className={`w-8 h-8 rounded-full items-center justify-center ${index === 0 ? 'bg-primary' : 'bg-surface'}`}>
                  <Text className={`text-sm font-bold ${index === 0 ? 'text-secondary' : 'text-text-primary'}`}>
                    {index + 1}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-text-primary text-base font-semibold">
                    {player.web_name}
                  </Text>
                  <Text className="text-text-secondary text-[13px]">
                    {player.position} • £{(Number(player.now_cost || 0) / 10).toFixed(1)}m • {player.selected_by_percent}% owned
                  </Text>
                </View>
                <Text className="text-primary text-lg font-bold">
                  {Number(candidate.xpPts || 0).toFixed(1)}
                </Text>
              </View>

              <View className="mb-3">
                {candidate.factors.map((factor, i) => (
                  <View key={i} className="flex-row items-center mb-1 gap-2">
                    <Text className="text-text-secondary text-xs w-20">
                      {factor.label}
                    </Text>
                    <View className="flex-1 h-1.5 bg-surface rounded-[3px] overflow-hidden">
                      <View
                        className="h-full bg-primary rounded-[3px]"
                        style={{ width: `${Math.min(100, factor.contribution * 100)}%` }}
                      />
                    </View>
                    <Text className="text-text-secondary text-[11px] w-16 text-right">
                      {factor.detail}
                    </Text>
                  </View>
                ))}
              </View>

              <View className="flex-row gap-2">
                <Button
                  title="Captain"
                  onPress={() => handleSetCaptain(candidate.playerId)}
                  disabled={activeTeam.captainId === candidate.playerId}
                  className="flex-1"
                />
                <Button
                  title="Vice"
                  onPress={() => handleSetVice(candidate.playerId)}
                  disabled={activeTeam.viceCaptainId === candidate.playerId}
                  variant="secondary"
                  className="flex-1"
                />
              </View>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

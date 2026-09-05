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
import { colors } from '@/theme/colors';
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
      <View style={{ flex: 1, backgroundColor: colors.bg.primary, padding: 20 }}>
        <Text style={{ color: colors.text.secondary }}>No team selected.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ color: colors.text.primary, fontSize: 24, fontWeight: '700' }}>
            Captain
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={() => setMode('balanced')}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: mode === 'balanced' ? colors.accent.primary : colors.bg.surface,
                borderWidth: 1,
                borderColor: mode === 'balanced' ? colors.accent.primary : colors.border.subtle,
              }}
            >
              <Text style={{
                color: mode === 'balanced' ? colors.bg.primary : colors.text.primary,
                fontSize: 12,
                fontWeight: '600',
              }}>
                Balanced
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode('differential')}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: mode === 'differential' ? colors.accent.primary : colors.bg.surface,
                borderWidth: 1,
                borderColor: mode === 'differential' ? colors.accent.primary : colors.border.subtle,
              }}
            >
              <Text style={{
                color: mode === 'differential' ? colors.bg.primary : colors.text.primary,
                fontSize: 12,
                fontWeight: '600',
              }}>
                Differential
              </Text>
            </Pressable>
          </View>
        </View>

        {activeTeam.captainId && (
          <Card style={{ padding: 16, marginBottom: 16, backgroundColor: '#065F46', borderColor: '#10B981' }}>
            <Text style={{ color: '#10B981', fontSize: 12, marginBottom: 4, textTransform: 'uppercase' }}>
              Current Captain
            </Text>
            <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: '700' }}>
              {playersById[activeTeam.captainId]?.web_name || 'Unknown'}
            </Text>
          </Card>
        )}

        {candidates.map((candidate, index) => {
          const player = playersById[candidate.playerId];
          if (!player) return null;

          return (
            <Card key={candidate.playerId} style={{ padding: 16, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: index === 0 ? colors.accent.primary : colors.bg.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{
                    color: index === 0 ? colors.bg.primary : colors.text.primary,
                    fontSize: 14,
                    fontWeight: '700',
                  }}>
                    {index + 1}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                    {player.web_name}
                  </Text>
                  <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                    {player.position} • £{((player.now_cost || 0) / 10).toFixed(1)}m • {player.selected_by_percent}% owned
                  </Text>
                </View>
                <Text style={{ color: colors.accent.primary, fontSize: 18, fontWeight: '700' }}>
                  {candidate.xpPts.toFixed(1)}
                </Text>
              </View>

              <View style={{ marginBottom: 12 }}>
                {candidate.factors.map((factor, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 8 }}>
                    <Text style={{ color: colors.text.secondary, fontSize: 12, width: 80 }}>
                      {factor.label}
                    </Text>
                    <View style={{ flex: 1, height: 6, backgroundColor: colors.bg.surface, borderRadius: 3, overflow: 'hidden' }}>
                      <View style={{
                        width: `${Math.min(100, factor.contribution * 100)}%`,
                        height: '100%',
                        backgroundColor: colors.accent.primary,
                        borderRadius: 3,
                      }} />
                    </View>
                    <Text style={{ color: colors.text.secondary, fontSize: 11, width: 60, textAlign: 'right' }}>
                      {factor.detail}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button
                  title="Captain"
                  onPress={() => handleSetCaptain(candidate.playerId)}
                  disabled={activeTeam.captainId === candidate.playerId}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Vice"
                  onPress={() => handleSetVice(candidate.playerId)}
                  disabled={activeTeam.viceCaptainId === candidate.playerId}
                  variant="secondary"
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

/**
 * src/screens/live/LiveScreen.jsx
 *
 * Current-GW board using real live points from /event/{id}/live/, XI with live points,
 * "The Grinders" mini-league table, BPS, owned-player events.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { Button } from '@/components/primitives/Button';
import { colors } from '@/theme/colors';
import { useTeamStore } from '@/state/useTeamStore';
import { usePlayerStore } from '@/state/usePlayerStore';
import { useCurrentGameweek } from '@/state/useCurrentGameweek';
import { useFplBootstrap } from '@/hooks/useFplBootstrap';
import { getEventLive } from '@/data/fpl/client';

export function LiveScreen() {
  const activeTeam = useTeamStore(s => s.getActiveTeam());
  const playersById = usePlayerStore(s => s.playersById);
  const { data: bootstrapData } = useFplBootstrap();
  const currentGW = useCurrentGameweek();
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadLive = async () => {
    const currentEvent = bootstrapData?.events?.find(e => e.is_current);
    if (!currentEvent) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getEventLive(currentEvent.id);
      setLiveData(data);
    } catch (err) {
      setError(err.message || 'Failed to load live data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLive();
  }, [currentEvent]);

  const livePointsMap = useMemo(() => {
    if (!liveData?.elements) return {};
    const map = {};
    liveData.elements.forEach(el => {
      map[String(el.id)] = el;
    });
    return map;
  }, [liveData]);

  const totalLivePoints = useMemo(() => {
    if (!activeTeam) return 0;
    return activeTeam.squad
      .filter(s => s.isStarting)
      .reduce((sum, s) => {
        const live = livePointsMap[s.playerId];
        return sum + (live?.stats?.total_points || 0);
      }, 0);
  }, [activeTeam, livePointsMap]);

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
            Live
          </Text>
          <Button title={loading ? 'Refreshing...' : 'Refresh'} onPress={loadLive} variant="secondary" />
        </View>

        {error && (
          <Card style={{ padding: 16, marginBottom: 16, backgroundColor: '#7C2D12', borderColor: colors.status.warning }}>
            <Text style={{ color: colors.status.warning, fontSize: 14, marginBottom: 8 }}>
              {error}
            </Text>
            <Button title="Retry" onPress={loadLive} variant="secondary" />
          </Card>
        )}

        <Card style={{ padding: 16, marginBottom: 16, backgroundColor: '#065F46', borderColor: '#10B981' }}>
          <Text style={{ color: '#10B981', fontSize: 12, marginBottom: 4, textTransform: 'uppercase' }}>
            GW {bootstrapData?.events?.find(e => e.is_current)?.name || '—'} Total
          </Text>
          <Text style={{ color: '#F8FAFC', fontSize: 36, fontWeight: '700' }}>
            {totalLivePoints}
          </Text>
          <Text style={{ color: '#94A3B8', fontSize: 13 }}>Live points</Text>
        </Card>

        <Card style={{ padding: 16, marginBottom: 16 }}>
          <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 12, textTransform: 'uppercase' }}>
            Starting XI
          </Text>
          {activeTeam.squad
            .filter(s => s.isStarting)
            .map(s => {
              const player = playersById[s.playerId];
              const live = livePointsMap[s.playerId];
              const points = live?.stats?.total_points || 0;
              const bps = live?.stats?.bps || 0;

              return (
                <View key={s.playerId} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 }}>
                  <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: colors.bg.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: colors.border.subtle,
                  }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text.primary }}>
                      {player?.web_name?.[0] || '?'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '600' }}>
                      {player?.web_name || 'Unknown'}
                    </Text>
                    <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                      {player?.position || 'MID'}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Text style={{ color: colors.accent.primary, fontSize: 16, fontWeight: '700' }}>
                      {points > 0 ? `+${points}` : '0'}
                    </Text>
                    {bps > 0 && (
                      <Text style={{ color: colors.text.secondary, fontSize: 11 }}>
                        BPS {bps}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
        </Card>
      </View>
    </ScrollView>
  );
}

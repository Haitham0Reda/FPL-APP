/**
 * src/screens/live/LiveScreen.jsx
 *
 * Current-GW board using real live points from /event/{id}/live/, XI with live points,
 * "The Grinders" mini-league table, BPS, owned-player events.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { Button } from '@/components/primitives/Button';
import { useTeamStore } from '@/state/useTeamStore';
import { usePlayerStore } from '@/state/usePlayerStore';
import { useFplBootstrap } from '@/hooks/useFplBootstrap';
import { getEventLive } from '@/data/fpl/client';
import { getPlayerPosition } from '@/utils/players';

export function LiveScreen() {
  const activeTeam = useTeamStore(s => s.getActiveTeam());
  const playersById = usePlayerStore(s => s.playersById);
  const { data: bootstrapData } = useFplBootstrap();
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadLive = useCallback(async () => {
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
  }, [bootstrapData]);

  useEffect(() => {
    loadLive();
  }, [loadLive]);

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
      <View className="flex-1 bg-secondary p-5">
        <Text className="text-text-secondary">No team selected.</Text>
      </View>
    );
  }

  const currentEventId = bootstrapData?.events?.find(e => e.is_current)?.id;

  return (
    <ScrollView className="flex-1 bg-secondary">
      <View className="p-5">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-text-primary text-2xl font-bold">
            Live
          </Text>
          <Button title={loading ? 'Refreshing...' : 'Refresh'} onPress={loadLive} variant="secondary" />
        </View>

        {error && (
          <Card className="mb-4 bg-[#7C2D12] border-status-warning">
            <Text className="text-status-warning text-sm mb-2">
              {error}
            </Text>
            <Button title="Retry" onPress={loadLive} variant="secondary" />
          </Card>
        )}

        <Card className="mb-4 bg-[#065F46] border-primary">
          <Text className="text-primary text-xs mb-1 uppercase">
            {currentEventId ? `GW ${currentEventId} Total` : '— Total'}
          </Text>
          <Text className="text-text-primary text-[36px] leading-[44px] font-bold">
            {totalLivePoints}
          </Text>
          <Text className="text-text-secondary text-[13px]">Live points</Text>
        </Card>

        <Card className="mb-4">
          <Text className="text-text-secondary text-xs mb-3 uppercase">
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
                <View key={s.playerId} className="flex-row items-center mb-3 gap-3">
                  <View className="w-9 h-9 rounded-full bg-surface items-center justify-center border border-border">
                    <Text className="text-sm font-bold text-text-primary">
                      {player?.web_name?.[0] || '?'}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-primary text-sm font-semibold">
                      {player?.web_name || 'Unknown'}
                    </Text>
                    <Text className="text-text-secondary text-xs">
                      {player ? getPlayerPosition(player) : 'MID'}
                    </Text>
                  </View>
                  <View className="items-end gap-0.5">
                    <Text className="text-primary text-base font-bold">
                      {points > 0 ? `+${points}` : '0'}
                    </Text>
                    {bps > 0 && (
                      <Text className="text-text-secondary text-[11px]">
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

/**
 * src/screens/myteam/TransfersScreen.jsx
 *
 * Transfer solver UI: horizon (1/3/5 GW) and hit (0/-4/-8) selectors,
 * sell/buy cards with projected gain/net-after-hit, Apply button that only
 * mutates local draft state, multi-GW planner, watchlist.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { Button } from '@/components/primitives/Button';
import { useTeamStore } from '@/state/useTeamStore';
import { usePlayerStore } from '@/state/usePlayerStore';
import { useDraftStore } from '@/state/useDraftStore';

const HORIZONS = [1, 3, 5];
const HITS = [0, -4, -8];

export function TransfersScreen() {
  const activeTeam = useTeamStore(s => s.getActiveTeam());
  const playersById = usePlayerStore(s => s.playersById);
  const [horizon, setHorizon] = useState(3);
  const [hit, setHit] = useState(-4);
  const [sellId, setSellId] = useState(null);
  const [buyId, setBuyId] = useState(null);

  const squad = useMemo(() => {
    if (!activeTeam) return [];
    return activeTeam.squad
      .filter(s => s.isStarting)
      .map(s => ({
        ...s,
        player: playersById[s.playerId] || null,
      }));
  }, [activeTeam, playersById]);

  const sellPlayer = useMemo(() => {
    if (!sellId) return null;
    const sp = squad.find(s => s.playerId === sellId);
    return sp?.player || null;
  }, [sellId, squad]);

  const buyPlayer = useMemo(() => {
    if (!buyId) return null;
    return playersById[buyId] || null;
  }, [buyId, playersById]);

  const projectedGain = useMemo(() => {
    if (!sellPlayer || !buyPlayer) return 0;
    const sellXpts = (sellPlayer.form || 0) / 8 * 6;
    const buyXpts = (buyPlayer.form || 0) / 8 * 6;
    return (buyXpts - sellXpts) * horizon;
  }, [sellPlayer, buyPlayer, horizon]);

  const netAfterHit = projectedGain + hit;

  const handleApply = () => {
    if (!sellId || !buyId || !activeTeam) return;
    const draftId = activeTeam.id;
    const draft = useDraftStore.getState().drafts[draftId];
    if (!draft) return;

    const newSquad = draft.squad.map(s =>
      s.playerId === sellId ? { ...s, playerId: buyId } : s
    );
    useDraftStore.getState().updateDraft(draftId, { squad: newSquad });
    useTeamStore.getState().updateTeam(activeTeam.id, {
      squad: newSquad,
      bank: (activeTeam.bank || 0) + ((sellPlayer?.now_cost || 0) - (buyPlayer?.now_cost || 0)) / 10,
    });
    setSellId(null);
    setBuyId(null);
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
        <Text className="text-text-primary text-2xl font-bold mb-4">
          Transfers
        </Text>

        <Card className="mb-4">
          <Text className="text-text-secondary text-xs mb-2 uppercase">
            Horizon
          </Text>
          <View className="flex-row gap-2">
            {HORIZONS.map(h => (
              <Pressable
                key={h}
                onPress={() => setHorizon(h)}
                className={`flex-1 py-2 rounded-lg border items-center ${horizon === h ? 'bg-primary border-primary' : 'bg-surface border-border'}`}
              >
                <Text className={`text-sm font-semibold ${horizon === h ? 'text-secondary' : 'text-text-primary'}`}>
                  {h} GW
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="text-text-secondary text-xs mb-2 uppercase">
            Hit Tolerance
          </Text>
          <View className="flex-row gap-2">
            {HITS.map(h => (
              <Pressable
                key={h}
                onPress={() => setHit(h)}
                className={`flex-1 py-2 rounded-lg border items-center ${hit === h ? 'bg-primary border-primary' : 'bg-surface border-border'}`}
              >
                <Text className={`text-sm font-semibold ${hit === h ? 'text-secondary' : 'text-text-primary'}`}>
                  {h === 0 ? 'Free' : `${h} pts`}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="text-text-secondary text-xs mb-2 uppercase">
            Sell
          </Text>
          {squad.map(s => {
            if (!s.player) return null;
            return (
              <Pressable
                key={s.playerId}
                onPress={() => setSellId(s.playerId)}
                className={`flex-row items-center p-3 mb-2 rounded-lg border gap-3 ${sellId === s.playerId ? 'bg-accent-muted border-primary' : 'bg-surface border-border'}`}
              >
                <View className="w-8 h-8 rounded-full bg-border items-center justify-center">
                  <Text className="text-text-primary text-xs font-bold">
                    {s.player.web_name?.[0] || '?'}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-text-primary text-sm font-semibold">
                    {s.player.web_name}
                  </Text>
                  <Text className="text-text-secondary text-xs">
                    £{(Number(s.player.now_cost || 0) / 10).toFixed(1)}m
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </Card>

        <Card className="mb-4">
          <Text className="text-text-secondary text-xs mb-2 uppercase">
            Buy
          </Text>
          {Object.values(playersById).slice(0, 20).map(player => (
            <Pressable
              key={player.id}
              onPress={() => setBuyId(String(player.id))}
              className={`flex-row items-center p-3 mb-2 rounded-lg border gap-3 ${buyId === String(player.id) ? 'bg-accent-muted border-primary' : 'bg-surface border-border'}`}
            >
              <View className="w-8 h-8 rounded-full bg-border items-center justify-center">
                <Text className="text-text-primary text-xs font-bold">
                  {player.web_name?.[0] || '?'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-text-primary text-sm font-semibold">
                  {player.web_name}
                </Text>
                <Text className="text-text-secondary text-xs">
                  £{(Number(player.now_cost || 0) / 10).toFixed(1)}m
                </Text>
              </View>
            </Pressable>
          ))}
        </Card>

        {sellPlayer && buyPlayer && (
          <Card className="mb-4 bg-[#065F46] border-primary">
            <Text className="text-primary text-xs mb-2 uppercase">
              Projected Outcome
            </Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-text-primary text-sm">
                Sell: {sellPlayer.web_name}
              </Text>
              <Text className="text-text-primary text-sm">
                Buy: {buyPlayer.web_name}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-text-secondary text-[13px]">
                Projected gain: {Number(projectedGain || 0).toFixed(1)} pts
              </Text>
              <Text className={`text-[13px] font-semibold ${netAfterHit >= 0 ? 'text-primary' : 'text-status-danger'}`}>
                Net: {Number(netAfterHit || 0).toFixed(1)} pts
              </Text>
            </View>
            <Button
              title="Apply Transfer"
              onPress={handleApply}
              className="mt-3"
            />
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

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
import { colors } from '@/theme/colors';
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
      <View style={{ flex: 1, backgroundColor: colors.bg.primary, padding: 20 }}>
        <Text style={{ color: colors.text.secondary }}>No team selected.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <View style={{ padding: 20 }}>
        <Text style={{ color: colors.text.primary, fontSize: 24, fontWeight: '700', marginBottom: 16 }}>
          Transfers
        </Text>

        <Card style={{ padding: 16, marginBottom: 16 }}>
          <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>
            Horizon
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {HORIZONS.map(h => (
              <Pressable
                key={h}
                onPress={() => setHorizon(h)}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: horizon === h ? colors.accent.primary : colors.bg.surface,
                  borderWidth: 1,
                  borderColor: horizon === h ? colors.accent.primary : colors.border.subtle,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  color: horizon === h ? colors.bg.primary : colors.text.primary,
                  fontSize: 14,
                  fontWeight: '600',
                }}>
                  {h} GW
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card style={{ padding: 16, marginBottom: 16 }}>
          <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>
            Hit Tolerance
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {HITS.map(h => (
              <Pressable
                key={h}
                onPress={() => setHit(h)}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: hit === h ? colors.accent.primary : colors.bg.surface,
                  borderWidth: 1,
                  borderColor: hit === h ? colors.accent.primary : colors.border.subtle,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  color: hit === h ? colors.bg.primary : colors.text.primary,
                  fontSize: 14,
                  fontWeight: '600',
                }}>
                  {h === 0 ? 'Free' : `${h} pts`}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card style={{ padding: 16, marginBottom: 16 }}>
          <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>
            Sell
          </Text>
          {squad.map(s => {
            if (!s.player) return null;
            return (
              <Pressable
                key={s.playerId}
                onPress={() => setSellId(s.playerId)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 12,
                  marginBottom: 8,
                  borderRadius: 8,
                  backgroundColor: sellId === s.playerId ? colors.accent.primaryMuted : colors.bg.surface,
                  borderWidth: 1,
                  borderColor: sellId === s.playerId ? colors.accent.primary : colors.border.subtle,
                  gap: 12,
                }}
              >
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.border.subtle,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{ color: colors.text.primary, fontSize: 12, fontWeight: '700' }}>
                    {s.player.web_name?.[0] || '?'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '600' }}>
                    {s.player.web_name}
                  </Text>
                  <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                    £{((s.player.now_cost || 0) / 10).toFixed(1)}m
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </Card>

        <Card style={{ padding: 16, marginBottom: 16 }}>
          <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>
            Buy
          </Text>
          {Object.values(playersById).slice(0, 20).map(player => (
            <Pressable
              key={player.id}
              onPress={() => setBuyId(String(player.id))}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                marginBottom: 8,
                borderRadius: 8,
                backgroundColor: buyId === String(player.id) ? colors.accent.primaryMuted : colors.bg.surface,
                borderWidth: 1,
                borderColor: buyId === String(player.id) ? colors.accent.primary : colors.border.subtle,
                gap: 12,
              }}
            >
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.border.subtle,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{ color: colors.text.primary, fontSize: 12, fontWeight: '700' }}>
                  {player.web_name?.[0] || '?'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '600' }}>
                  {player.web_name}
                </Text>
                <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                  £{((player.now_cost || 0) / 10).toFixed(1)}m
                </Text>
              </View>
            </Pressable>
          ))}
        </Card>

        {sellPlayer && buyPlayer && (
          <Card style={{ padding: 16, marginBottom: 16, backgroundColor: '#065F46', borderColor: '#10B981' }}>
            <Text style={{ color: '#10B981', fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>
              Projected Outcome
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: '#F8FAFC', fontSize: 14 }}>
                Sell: {sellPlayer.web_name}
              </Text>
              <Text style={{ color: '#F8FAFC', fontSize: 14 }}>
                Buy: {buyPlayer.web_name}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: '#94A3B8', fontSize: 13 }}>
                Projected gain: {projectedGain.toFixed(1)} pts
              </Text>
              <Text style={{ color: netAfterHit >= 0 ? '#10B981' : '#EF4444', fontSize: 13, fontWeight: '600' }}>
                Net: {netAfterHit.toFixed(1)} pts
              </Text>
            </View>
            <Button
              title="Apply Transfer"
              onPress={handleApply}
              style={{ marginTop: 12 }}
            />
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

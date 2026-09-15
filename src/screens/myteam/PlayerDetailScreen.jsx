/**
 * src/screens/myteam/PlayerDetailScreen.jsx
 *
 * Player detail: price, ownership, form, xGI, next-5 fixtures strip,
 * per-GW xPts mini-chart.
 */

import React, { useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { usePlayerStore } from '@/state/usePlayerStore';
import { getPlayerPosition } from '@/utils/players';

const FDR_BG_CLASS = { 1: 'bg-fdr-1', 2: 'bg-fdr-2', 3: 'bg-fdr-3', 4: 'bg-fdr-4', 5: 'bg-fdr-5' };

export function PlayerDetailScreen({ route, navigation }) {
  const playerId = route?.params?.playerId;
  const playersById = usePlayerStore(s => s.playersById);
  const teamsById = usePlayerStore(s => s.teamsById);
  const fixturesByTeam = usePlayerStore(s => s.fixturesByTeam);

  const player = playersById[playerId];

  if (!player) {
    return (
      <View className="flex-1 bg-secondary p-5">
        <Text className="text-text-secondary">Player not found.</Text>
      </View>
    );
  }

  const nextFixtures = useMemo(() => {
    const teamFixtures = fixturesByTeam[String(player.team)] || [];
    return teamFixtures
      .filter(f => !f.finished)
      .sort((a, b) => (a.event || 0) - (b.event || 0))
      .slice(0, 5);
  }, [player.team, fixturesByTeam]);

  const xPtsByGW = useMemo(() => {
    return nextFixtures.map(f => ({
      gw: f.event,
      xPts: (Number(player.form || 0) / 8) * 6,
    }));
  }, [nextFixtures, player.form]);

  return (
    <ScrollView className="flex-1 bg-secondary">
      <View className="p-5">
        <View className="flex-row items-center gap-4 mb-6">
          <View className="w-14 h-14 rounded-full bg-surface items-center justify-center border border-border">
            <Text className="text-xl font-bold text-text-primary">
              {player.web_name?.[0] || '?'}
            </Text>
          </View>
          <View>
            <Text className="text-text-primary text-2xl font-bold">
              {player.web_name || 'Unknown'}
            </Text>
            <Text className="text-text-secondary text-sm">
              {getPlayerPosition(player)} • £{((player.now_cost || 0) / 10).toFixed(1)}m
            </Text>
          </View>
        </View>

        <View className="flex-row flex-wrap gap-3 mb-6">
          <StatPill label="Form" value={Number(player.form || 0).toFixed(1)} />
          <StatPill label="xG" value={Number(player.xG || 0).toFixed(2)} />
          <StatPill label="xA" value={Number(player.xA || 0).toFixed(2)} />
          <StatPill label="xGI" value={Number(player.xGI || 0).toFixed(2)} />
          <StatPill label="Ownership" value={`${player.selected_by_percent || 0}%`} />
          <StatPill label="Status" value={player.status === 'a' ? 'Available' : player.status?.toUpperCase() || '—'} />
        </View>

        <Card className="mb-6">
          <Text className="text-text-secondary text-xs mb-3 uppercase">
            Next 5 Fixtures
          </Text>
          {nextFixtures.map(f => {
            const isHome = f.team_h === player.team;
            const fdr = isHome ? f.team_h_difficulty : f.team_a_difficulty;
            const opponent = isHome
              ? (teamsById[String(f.team_a)]?.short_name || '?')
              : (teamsById[String(f.team_h)]?.short_name || '?');

            return (
              <View key={f.id} className="flex-row items-center mb-2 gap-3">
                <Text className="text-text-secondary text-xs w-6">
                  GW{f.event}
                </Text>
                <View className={`w-2 h-2 rounded-full ${FDR_BG_CLASS[fdr] || FDR_BG_CLASS[3]}`} />
                <Text className="text-text-primary text-sm flex-1">
                  {isHome ? 'vs' : '@'} {opponent}
                </Text>
                <Text className="text-text-secondary text-xs">
                  FDR {fdr}
                </Text>
              </View>
            );
          })}
          {nextFixtures.length === 0 && (
            <Text className="text-text-secondary text-[13px]">No upcoming fixtures.</Text>
          )}
        </Card>

        <Card>
          <Text className="text-text-secondary text-xs mb-3 uppercase">
            xPts Projection
          </Text>
          <View className="flex-row items-end h-[120px] gap-2">
            {xPtsByGW.map(item => (
              <View key={item.gw} className="flex-1 items-center">
                <Text className="text-text-primary text-[11px] mb-1">
                  {item.xPts.toFixed(1)}
                </Text>
                <View
                  className="w-full bg-primary rounded"
                  style={{ height: Math.max(8, item.xPts * 16) }}
                />
                <Text className="text-text-secondary text-[10px] mt-1">
                  {item.gw}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

function StatPill({ label, value }) {
  return (
    <View className="px-3 py-2 rounded-lg bg-surface border border-border">
      <Text className="text-text-secondary text-[11px] mb-0.5 uppercase">
        {label}
      </Text>
      <Text className="text-text-primary text-base font-bold">
        {value}
      </Text>
    </View>
  );
}

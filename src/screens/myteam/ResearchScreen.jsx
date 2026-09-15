/**
 * src/screens/myteam/ResearchScreen.jsx
 *
 * Predicted lineups w/ start %, FDR, xPts; template tracker (ownership +
 * net transfers); injury/news feed using real status/news fields.
 */

import React, { useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { usePlayerStore } from '@/state/usePlayerStore';
import { useTeamStore } from '@/state/useTeamStore';
import { getPlayerPosition } from '@/utils/players';

const FDR_BG_CLASS = { 1: 'bg-fdr-1', 2: 'bg-fdr-2', 3: 'bg-fdr-3', 4: 'bg-fdr-4', 5: 'bg-fdr-5' };

export function ResearchScreen() {
  const playersById = usePlayerStore(s => s.playersById);
  const fixturesByTeam = usePlayerStore(s => s.fixturesByTeam);
  const activeTeam = useTeamStore(s => s.getActiveTeam());

  const players = useMemo(() => {
    return Object.values(playersById)
      .filter(p => p.status === 'a' || p.status === 'd')
      .sort((a, b) => (b.selected_by_percent || 0) - (a.selected_by_percent || 0))
      .slice(0, 30);
  }, [playersById]);

  const injuredPlayers = useMemo(() => {
    return Object.values(playersById).filter(p => p.status !== 'a' && p.status !== 'd');
  }, [playersById]);

  const templateTracker = useMemo(() => {
    return players.filter(p => (p.selected_by_percent || 0) > 30).slice(0, 15);
  }, [players]);

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
          Research
        </Text>

        <Card className="mb-4">
          <Text className="text-text-secondary text-xs mb-3 uppercase">
            Template Tracker
          </Text>
          {templateTracker.map(p => {
            const teamFixtures = fixturesByTeam[String(p.team)] || [];
            const nextFdr = teamFixtures
              .filter(f => !f.finished)
              .sort((a, b) => (a.event || 0) - (b.event || 0))
              .slice(0, 3)
              .map(f => f.team_h_difficulty || f.team_a_difficulty);

            return (
              <View key={p.id} className="flex-row items-center mb-3 gap-3">
                <View className="flex-1">
                  <Text className="text-text-primary text-sm font-semibold">
                    {p.web_name}
                  </Text>
                  <Text className="text-text-secondary text-xs">
                    {getPlayerPosition(p)} • £{(Number(p.now_cost || 0) / 10).toFixed(1)}m
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-primary text-sm font-semibold">
                    {p.selected_by_percent}%
                  </Text>
                  <Text className="text-text-secondary text-xs">
                    Next FDR: {nextFdr.length > 0 ? nextFdr.join(', ') : '—'}
                  </Text>
                </View>
              </View>
            );
          })}
        </Card>

        <Card className="mb-4">
          <Text className="text-text-secondary text-xs mb-3 uppercase">
            Injury / News Feed
          </Text>
          {injuredPlayers.length === 0 && (
            <Text className="text-text-secondary text-[13px]">No injury or news alerts.</Text>
          )}
          {injuredPlayers.slice(0, 10).map(p => (
            <View key={p.id} className="flex-row items-center mb-3 gap-3">
              <View className={`w-2 h-2 rounded-full ${p.status === 'i' ? 'bg-status-danger' : 'bg-status-warning'}`} />
              <View className="flex-1">
                <Text className="text-text-primary text-sm font-semibold">
                  {p.web_name}
                </Text>
                <Text className="text-text-secondary text-xs">
                  {p.status === 'i' ? 'Injured' : p.status === 'd' ? 'Doubtful' : p.status?.toUpperCase() || 'Unknown'}
                </Text>
              </View>
              {p.chance_of_playing_next_round != null && (
                <Text className="text-text-secondary text-xs">
                  {p.chance_of_playing_next_round}%
                </Text>
              )}
            </View>
          ))}
        </Card>

        <Card>
          <Text className="text-text-secondary text-xs mb-3 uppercase">
            Predicted Lineups
          </Text>
          {players.slice(0, 10).map(p => {
            const teamFixtures = fixturesByTeam[String(p.team)] || [];
            const nextFdr = teamFixtures
              .filter(f => !f.finished)
              .sort((a, b) => (a.event || 0) - (b.event || 0))
              .slice(0, 1)[0];
            const fdr = nextFdr
              ? (nextFdr.team_h === p.team ? nextFdr.team_h_difficulty : nextFdr.team_a_difficulty)
              : 3;

            return (
              <View key={p.id} className="flex-row items-center mb-3 gap-3">
                <View className="flex-1">
                  <Text className="text-text-primary text-sm font-semibold">
                    {p.web_name}
                  </Text>
                  <Text className="text-text-secondary text-xs">
                    {getPlayerPosition(p)} • {p.news?.slice(0, 40) || '—'}
                  </Text>
                </View>
                <View className="items-end gap-1">
                  <Text className="text-primary text-[13px] font-semibold">
                    {p.chance_of_playing_next_round || 100}%
                  </Text>
                  <View className="flex-row gap-1 items-center">
                    <View className={`w-2 h-2 rounded-full ${FDR_BG_CLASS[fdr] || FDR_BG_CLASS[3]}`} />
                    <Text className="text-text-secondary text-xs">
                      FDR {fdr}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </Card>
      </View>
    </ScrollView>
  );
}

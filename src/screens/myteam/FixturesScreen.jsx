/**
 * src/screens/myteam/FixturesScreen.jsx
 *
 * Per-player FDR strip for next 8 GWs, club swing detector,
 * blank/double banners.
 */

import React, { useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { useTeamStore } from '@/state/useTeamStore';
import { usePlayerStore } from '@/state/usePlayerStore';
import { getPlayerPosition } from '@/utils/players';

const FDR_BG_CLASS = { 1: 'bg-fdr-1', 2: 'bg-fdr-2', 3: 'bg-fdr-3', 4: 'bg-fdr-4', 5: 'bg-fdr-5' };

export function FixturesScreen() {
  const activeTeam = useTeamStore(s => s.getActiveTeam());
  const playersById = usePlayerStore(s => s.playersById);
  const teamsById = usePlayerStore(s => s.teamsById);
  const fixturesByTeam = usePlayerStore(s => s.fixturesByTeam);
  const fixturesByGameweek = usePlayerStore(s => s.fixturesByGameweek);

  const squadPlayers = useMemo(() => {
    if (!activeTeam) return [];
    return activeTeam.squad
      .filter(s => s.isStarting)
      .map(s => ({
        ...s,
        player: playersById[s.playerId] || null,
      }));
  }, [activeTeam, playersById]);

  const swingDetected = useMemo(() => {
    const swings = [];
    Object.entries(fixturesByGameweek).forEach(([gw, fixtures]) => {
      const easy = fixtures.filter(f => f.team_h_difficulty <= 2 || f.team_a_difficulty <= 2);
      const hard = fixtures.filter(f => f.team_h_difficulty >= 4 || f.team_a_difficulty >= 4);
      const blanks = fixtures.filter(f => f.is_blank);
      const doubles = fixtures.filter(f => f.is_double);

      if (easy.length > 0 || hard.length > 0 || blanks.length > 0 || doubles.length > 0) {
        swings.push({ gw, easy, hard, blanks, doubles });
      }
    });
    return swings;
  }, [fixturesByGameweek]);

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
          Fixtures
        </Text>

        {swingDetected.length > 0 && (
          <Card className="mb-4 bg-[#065F46] border-primary">
            <Text className="text-primary text-xs font-semibold mb-2 uppercase">
              Swing Alerts
            </Text>
            {swingDetected.slice(0, 5).map(swing => (
              <View key={swing.gw} className="mb-2">
                <Text className="text-text-primary text-sm font-semibold">
                  GW{swing.gw}
                </Text>
                <Text className="text-text-secondary text-xs">
                  {[
                    swing.blanks.length > 0 && `${swing.blanks.length} blank`,
                    swing.doubles.length > 0 && `${swing.doubles.length} double`,
                    swing.easy.length > 0 && `${swing.easy.length} easy`,
                    swing.hard.length > 0 && `${swing.hard.length} hard`,
                  ].filter(Boolean).join(', ')}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {squadPlayers.map(s => {
          if (!s.player) return null;
          const teamFixtures = fixturesByTeam[String(s.player.team)] || [];
          const upcoming = teamFixtures
            .filter(f => !f.finished)
            .sort((a, b) => (a.event || 0) - (b.event || 0))
            .slice(0, 8);

          return (
            <Card key={s.playerId} className="mb-3">
              <View className="flex-row items-center mb-3 gap-3">
                <View className="w-9 h-9 rounded-full bg-surface items-center justify-center border border-border">
                  <Text className="text-sm font-bold text-text-primary">
                    {s.player.web_name?.[0] || '?'}
                  </Text>
                </View>
                <View>
                  <Text className="text-text-primary text-base font-semibold">
                    {s.player.web_name || 'Unknown'}
                  </Text>
                  <Text className="text-text-secondary text-xs">
                    {getPlayerPosition(s.player)}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-1.5">
                {upcoming.map(f => {
                  const isHome = f.team_h === s.player.team;
                  const fdr = isHome ? f.team_h_difficulty : f.team_a_difficulty;
                  const opponent = isHome
                    ? (teamsById[String(f.team_a)]?.short_name || '?')
                    : (teamsById[String(f.team_h)]?.short_name || '?');
                  const borderClass = f.is_blank ? 'border-status-warning' : f.is_double ? 'border-primary' : 'border-border';

                  return (
                    <View key={f.id} className={`flex-1 items-center py-2 rounded-lg bg-surface border ${borderClass}`}>
                      <Text className="text-text-secondary text-[10px] mb-1">
                        GW{f.event}
                      </Text>
                      <View className={`w-1.5 h-1.5 rounded-full mb-1 ${FDR_BG_CLASS[fdr] || FDR_BG_CLASS[3]}`} />
                      <Text className="text-text-primary text-[11px] font-semibold text-center">
                        {isHome ? 'vs' : '@'}
                      </Text>
                      <Text className="text-text-secondary text-[10px] text-center">
                        {opponent}
                      </Text>
                      {(f.is_blank || f.is_double) && (
                        <Text className={`text-[9px] font-bold mt-0.5 ${f.is_blank ? 'text-status-warning' : 'text-primary'}`}>
                          {f.is_blank ? 'BLANK' : '2x'}
                        </Text>
                      )}
                    </View>
                  );
                })}
                {upcoming.length === 0 && (
                  <Text className="text-text-secondary text-[13px]">No upcoming fixtures.</Text>
                )}
              </View>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

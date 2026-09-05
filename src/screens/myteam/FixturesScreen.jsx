/**
 * src/screens/myteam/FixturesScreen.jsx
 *
 * Per-player FDR strip for next 8 GWs, club swing detector,
 * blank/double banners.
 */

import React, { useMemo } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { colors } from '@/theme/colors';
import { useTeamStore } from '@/state/useTeamStore';
import { usePlayerStore } from '@/state/usePlayerStore';

export function FixturesScreen() {
  const activeTeam = useTeamStore(s => s.getActiveTeam());
  const playersById = usePlayerStore(s => s.playersById);
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
      <View style={{ flex: 1, backgroundColor: colors.bg.primary, padding: 20 }}>
        <Text style={{ color: colors.text.secondary }}>No team selected.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <View style={{ padding: 20 }}>
        <Text style={{ color: colors.text.primary, fontSize: 24, fontWeight: '700', marginBottom: 16 }}>
          Fixtures
        </Text>

        {swingDetected.length > 0 && (
          <Card style={{ padding: 16, marginBottom: 16, backgroundColor: '#065F46', borderColor: '#10B981' }}>
            <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' }}>
              Swing Alerts
            </Text>
            {swingDetected.slice(0, 5).map(swing => (
              <View key={swing.gw} style={{ marginBottom: 8 }}>
                <Text style={{ color: '#F8FAFC', fontSize: 14, fontWeight: '600' }}>
                  GW{swing.gw}
                </Text>
                <Text style={{ color: '#94A3B8', fontSize: 12 }}>
                  {swing.blanks.length > 0 && `${swing.blanks.length} blank`}
                  {swing.doubles.length > 0 && `${swing.doubles.length} double`}
                  {swing.easy.length > 0 && `, ${swing.easy.length} easy`}
                  {swing.hard.length > 0 && `, ${swing.hard.length} hard`}
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
            <Card key={s.playerId} style={{ padding: 16, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 }}>
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
                    {s.player.web_name?.[0] || '?'}
                  </Text>
                </View>
                <View>
                  <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                    {s.player.web_name || 'Unknown'}
                  </Text>
                  <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                    {s.player.position || 'MID'}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 6 }}>
                {upcoming.map(f => {
                  const isHome = f.team_h === s.player.team;
                  const fdr = isHome ? f.team_h_difficulty : f.team_a_difficulty;
                  const opponent = isHome
                    ? (playersById[f.team_a]?.name || '?')
                    : (playersById[f.team_h]?.name || '?');

                  return (
                    <View key={f.id} style={{
                      flex: 1,
                      alignItems: 'center',
                      paddingVertical: 8,
                      borderRadius: 8,
                      backgroundColor: colors.bg.surface,
                      borderWidth: 1,
                      borderColor: f.is_blank ? colors.status.warning : f.is_double ? colors.accent.primary : colors.border.subtle,
                    }}>
                      <Text style={{ color: colors.text.secondary, fontSize: 10, marginBottom: 4 }}>
                        GW{f.event}
                      </Text>
                      <View style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: colors.fdr[`fdr${fdr}`] || colors.fdr.fdr3,
                        marginBottom: 4,
                      }} />
                      <Text style={{ color: colors.text.primary, fontSize: 11, fontWeight: '600', textAlign: 'center' }}>
                        {isHome ? 'vs' : '@'}
                      </Text>
                      <Text style={{ color: colors.text.secondary, fontSize: 10, textAlign: 'center' }}>
                        {opponent}
                      </Text>
                      {(f.is_blank || f.is_double) && (
                        <Text style={{
                          color: f.is_blank ? colors.status.warning : colors.accent.primary,
                          fontSize: 9,
                          fontWeight: '700',
                          marginTop: 2,
                        }}>
                          {f.is_blank ? 'BLANK' : '2x'}
                        </Text>
                      )}
                    </View>
                  );
                })}
                {upcoming.length === 0 && (
                  <Text style={{ color: colors.text.secondary, fontSize: 13 }}>No upcoming fixtures.</Text>
                )}
              </View>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

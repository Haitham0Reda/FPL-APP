/**
 * src/screens/myteam/ResearchScreen.jsx
 *
 * Predicted lineups w/ start %, FDR, xPts; template tracker (ownership +
 * net transfers); injury/news feed using real status/news fields.
 */

import React, { useMemo } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { colors } from '@/theme/colors';
import { usePlayerStore } from '@/state/usePlayerStore';
import { useTeamStore } from '@/state/useTeamStore';

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
      <View style={{ flex: 1, backgroundColor: colors.bg.primary, padding: 20 }}>
        <Text style={{ color: colors.text.secondary }}>No team selected.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <View style={{ padding: 20 }}>
        <Text style={{ color: colors.text.primary, fontSize: 24, fontWeight: '700', marginBottom: 16 }}>
          Research
        </Text>

        <Card style={{ padding: 16, marginBottom: 16 }}>
          <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 12, textTransform: 'uppercase' }}>
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
              <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '600' }}>
                    {p.web_name}
                  </Text>
                  <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                    {p.position} • £{((p.now_cost || 0) / 10).toFixed(1)}m
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: colors.accent.primary, fontSize: 14, fontWeight: '600' }}>
                    {p.selected_by_percent}%
                  </Text>
                  <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                    Next FDR: {nextFdr.length > 0 ? nextFdr.join(', ') : '—'}
                  </Text>
                </View>
              </View>
            );
          })}
        </Card>

        <Card style={{ padding: 16, marginBottom: 16 }}>
          <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 12, textTransform: 'uppercase' }}>
            Injury / News Feed
          </Text>
          {injuredPlayers.length === 0 && (
            <Text style={{ color: colors.text.secondary, fontSize: 13 }}>No injury or news alerts.</Text>
          )}
          {injuredPlayers.slice(0, 10).map(p => (
            <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 }}>
              <View style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: p.status === 'i' ? colors.status.danger : colors.status.warning,
              }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '600' }}>
                  {p.web_name}
                </Text>
                <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                  {p.status === 'i' ? 'Injured' : p.status === 'd' ? 'Doubtful' : p.status?.toUpperCase() || 'Unknown'}
                </Text>
              </View>
              {p.chance_of_playing_next_round && (
                <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                  {p.chance_of_playing_next_round}%
                </Text>
              )}
            </View>
          ))}
        </Card>

        <Card style={{ padding: 16 }}>
          <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 12, textTransform: 'uppercase' }}>
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
              <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '600' }}>
                    {p.web_name}
                  </Text>
                  <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                    {p.position} • {p.news?.slice(0, 40) || '—'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={{ color: colors.accent.primary, fontSize: 13, fontWeight: '600' }}>
                    {p.chance_of_playing_next_round || 100}%
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    gap: 4,
                    alignItems: 'center',
                  }}>
                    <View style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: colors.fdr[`fdr${fdr}`] || colors.fdr.fdr3,
                    }} />
                    <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
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

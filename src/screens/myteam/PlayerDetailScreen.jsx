/**
 * src/screens/myteam/PlayerDetailScreen.jsx
 *
 * Player detail: price, ownership, form, xGI, next-5 fixtures strip,
 * per-GW xPts mini-chart.
 */

import React, { useMemo } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { colors } from '@/theme/colors';
import { usePlayerStore } from '@/state/usePlayerStore';

export function PlayerDetailScreen({ route, navigation }) {
  const playerId = route?.params?.playerId;
  const playersById = usePlayerStore(s => s.playersById);
  const fixturesByTeam = usePlayerStore(s => s.fixturesByTeam);

  const player = playersById[playerId];

  if (!player) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg.primary, padding: 20 }}>
        <Text style={{ color: colors.text.secondary }}>Player not found.</Text>
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
      xPts: ((player.form || 0) / 8) * 6,
    }));
  }, [nextFixtures, player.form]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <View style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.bg.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border.subtle,
          }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text.primary }}>
              {player.web_name?.[0] || '?'}
            </Text>
          </View>
          <View>
            <Text style={{ color: colors.text.primary, fontSize: 24, fontWeight: '700' }}>
              {player.web_name || 'Unknown'}
            </Text>
            <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
              {player.position || 'MID'} • £{((player.now_cost || 0) / 10).toFixed(1)}m
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <StatPill label="Form" value={(player.form || 0).toFixed(1)} />
          <StatPill label="xG" value={(player.xG || 0).toFixed(2)} />
          <StatPill label="xA" value={(player.xA || 0).toFixed(2)} />
          <StatPill label="xGI" value={(player.xGI || 0).toFixed(2)} />
          <StatPill label="Ownership" value={`${player.selected_by_percent || 0}%`} />
          <StatPill label="Status" value={player.status === 'a' ? 'Available' : player.status?.toUpperCase() || '—'} />
        </View>

        <Card style={{ padding: 16, marginBottom: 24 }}>
          <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 12, textTransform: 'uppercase' }}>
            Next 5 Fixtures
          </Text>
          {nextFixtures.map(f => {
            const isHome = f.team_h === player.team;
            const fdr = isHome ? f.team_h_difficulty : f.team_a_difficulty;
            const opponent = isHome
              ? (playersById[f.team_a]?.name || '?')
              : (playersById[f.team_h]?.name || '?');

            return (
              <View key={f.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 12 }}>
                <Text style={{ color: colors.text.secondary, fontSize: 12, width: 24 }}>
                  GW{f.event}
                </Text>
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.fdr[`fdr${fdr}`] || colors.fdr.fdr3,
                }} />
                <Text style={{ color: colors.text.primary, fontSize: 14, flex: 1 }}>
                  {isHome ? 'vs' : '@'} {opponent}
                </Text>
                <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                  FDR {fdr}
                </Text>
              </View>
            );
          })}
          {nextFixtures.length === 0 && (
            <Text style={{ color: colors.text.secondary, fontSize: 13 }}>No upcoming fixtures.</Text>
          )}
        </Card>

        <Card style={{ padding: 16 }}>
          <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 12, textTransform: 'uppercase' }}>
            xPts Projection
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 8 }}>
            {xPtsByGW.map(item => (
              <View key={item.gw} style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: colors.text.primary, fontSize: 11, marginBottom: 4 }}>
                  {item.xPts.toFixed(1)}
                </Text>
                <View style={{
                  width: '100%',
                  height: Math.max(8, item.xPts * 16),
                  backgroundColor: colors.accent.primary,
                  borderRadius: 4,
                }} />
                <Text style={{ color: colors.text.secondary, fontSize: 10, marginTop: 4 }}>
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
    <View style={{
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.bg.surface,
      borderWidth: 1,
      borderColor: colors.border.subtle,
    }}>
      <Text style={{ color: colors.text.secondary, fontSize: 11, marginBottom: 2, textTransform: 'uppercase' }}>
        {label}
      </Text>
      <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '700' }}>
        {value}
      </Text>
    </View>
  );
}

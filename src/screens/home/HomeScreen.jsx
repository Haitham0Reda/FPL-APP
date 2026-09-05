/**
 * src/screens/home/HomeScreen.jsx
 *
 * Rebuild to match the PRD dashboard: team switcher, deadline countdown,
 * GW points/rank + delta, "needs attention" alerts, next-fixtures strip,
 * quick-action shortcuts.
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

function formatDeadline(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function HomeScreen() {
  const teams = useTeamStore(s => s.teams);
  const activeTeam = useTeamStore(s => s.getActiveTeam());
  const setActiveTeam = useTeamStore(s => s.setActiveTeam);
  const addDraftTeam = useTeamStore(s => s.addDraftTeam);
  const playersById = usePlayerStore(s => s.playersById);
  const fixturesByTeam = usePlayerStore(s => s.fixturesByTeam);
  const { data: bootstrapData } = useFplBootstrap();
  const currentGW = useCurrentGameweek();
  const [showTeamSwitcher, setShowTeamSwitcher] = useState(false);

  const nextFixtures = useMemo(() => {
    if (!activeTeam) return [];
    const teamIds = new Set();
    activeTeam.squad.forEach(s => {
      const player = playersById[s.playerId];
      if (player) teamIds.add(String(player.team));
    });

    const all = [];
    teamIds.forEach(teamId => {
      const teamFixtures = fixturesByTeam[teamId] || [];
      teamFixtures
        .filter(f => !f.finished)
        .sort((a, b) => (a.event || 0) - (b.event || 0))
        .slice(0, 3)
        .forEach(f => {
          if (!all.find(af => af.event === f.event && af.id === f.id)) {
            all.push(f);
          }
        });
    });
    return all.sort((a, b) => (a.event || 0) - (b.event || 0)).slice(0, 6);
  }, [activeTeam, playersById, fixturesByTeam]);

  const needsAttention = useMemo(() => {
    const alerts = [];
    if (!activeTeam) return alerts;

    activeTeam.squad.forEach(s => {
      const player = playersById[s.playerId];
      if (!player) return;
      if (player.status === 'i' || player.status === 's') {
        alerts.push({ type: 'injury', player, message: `${player.web_name} is ${player.status === 'i' ? 'injured' : 'suspended'}` });
      }
    });

    return alerts.slice(0, 3);
  }, [activeTeam, playersById]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Pressable onPress={() => setShowTeamSwitcher(!showTeamSwitcher)} style={{ flex: 1 }}>
            <Text style={{ color: colors.text.primary, fontSize: 24, fontWeight: '700' }}>
              {activeTeam ? activeTeam.name : 'Elite FPL'}
            </Text>
            <Text style={{ color: colors.text.secondary, fontSize: 12, marginTop: 2 }}>
              {activeTeam ? (activeTeam.isLive ? 'Live Team' : 'Draft') : 'No team selected'}
            </Text>
          </Pressable>
          {bootstrapData && (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: colors.text.secondary, fontSize: 12 }}>Deadline</Text>
              <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '600' }}>
                {formatDeadline(bootstrapData.events?.find(e => e.is_current)?.deadline_time)}
              </Text>
            </View>
          )}
        </View>

        {showTeamSwitcher && (
          <Card style={{ padding: 16, marginBottom: 16 }}>
            <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 12, textTransform: 'uppercase' }}>
              Switch Team
            </Text>
            {teams.map(team => (
              <Pressable
                key={team.id}
                onPress={() => {
                  setActiveTeam(team.id);
                  setShowTeamSwitcher(false);
                }}
                style={{
                  padding: 12,
                  marginBottom: 8,
                  borderRadius: 8,
                  backgroundColor: activeTeam?.id === team.id ? colors.accent.primaryMuted : colors.bg.surface,
                  borderWidth: 1,
                  borderColor: activeTeam?.id === team.id ? colors.accent.primary : colors.border.subtle,
                }}
              >
                <Text style={{
                  color: activeTeam?.id === team.id ? colors.accent.primary : colors.text.primary,
                  fontSize: 14,
                  fontWeight: '600',
                }}>
                  {team.name}
                </Text>
                <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                  {team.isLive ? 'Live' : 'Draft'} • GW{team.currentGameweek}
                </Text>
              </Pressable>
            ))}
            <Button
              title="+ New Draft"
              onPress={() => {
                addDraftTeam();
                setShowTeamSwitcher(false);
              }}
              variant="secondary"
              style={{ marginTop: 8 }}
            />
          </Card>
        )}

        {activeTeam && (
          <Card style={{ padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <View>
                <Text style={{ color: colors.text.secondary, fontSize: 12, textTransform: 'uppercase' }}>
                  Points
                </Text>
                <Text style={{ color: colors.text.primary, fontSize: 28, fontWeight: '700' }}>
                  {activeTeam.totalPoints || 0}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: colors.text.secondary, fontSize: 12, textTransform: 'uppercase' }}>
                  Rank
                </Text>
                <Text style={{ color: colors.text.primary, fontSize: 28, fontWeight: '700' }}>
                  {activeTeam.overallRank?.toLocaleString() || '—'}
                </Text>
              </View>
            </View>
            {activeTeam.bank > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                  Bank: £{activeTeam.bank.toFixed(1)}m
                </Text>
                <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                  Value: £{activeTeam.value.toFixed(1)}m
                </Text>
              </View>
            )}
          </Card>
        )}

        {needsAttention.length > 0 && (
          <Card style={{ padding: 16, marginBottom: 16, backgroundColor: '#7C2D12', borderColor: colors.status.warning }}>
            <Text style={{ color: colors.status.warning, fontSize: 12, marginBottom: 8, textTransform: 'uppercase', fontWeight: '600' }}>
              Needs Attention
            </Text>
            {needsAttention.map((alert, i) => (
              <Text key={i} style={{ color: '#F8FAFC', fontSize: 13, marginBottom: 4 }}>
                • {alert.message}
              </Text>
            ))}
          </Card>
        )}

        {nextFixtures.length > 0 && (
          <Card style={{ padding: 16, marginBottom: 16 }}>
            <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 12, textTransform: 'uppercase' }}>
              Upcoming Fixtures
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {nextFixtures.map(f => (
                <View key={f.id} style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 10,
                  borderRadius: 8,
                  backgroundColor: colors.bg.surface,
                  borderWidth: 1,
                  borderColor: f.is_blank ? colors.status.warning : f.is_double ? colors.accent.primary : colors.border.subtle,
                }}>
                  <Text style={{ color: colors.text.secondary, fontSize: 11, marginBottom: 4 }}>
                    GW{f.event}
                  </Text>
                  <Text style={{ color: colors.text.primary, fontSize: 12, fontWeight: '600', textAlign: 'center' }}>
                    {f.team_h ? `H:${playersById[f.team_h]?.short_name || '?'}` : ''}
                  </Text>
                  <Text style={{ color: colors.text.primary, fontSize: 12, fontWeight: '600', textAlign: 'center' }}>
                    {f.team_a ? `A:${playersById[f.team_a]?.short_name || '?'}` : ''}
                  </Text>
                  {(f.is_blank || f.is_double) && (
                    <Text style={{
                      color: f.is_blank ? colors.status.warning : colors.accent.primary,
                      fontSize: 10,
                      fontWeight: '700',
                      marginTop: 4,
                    }}>
                      {f.is_blank ? 'BLANK' : '2x'}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </Card>
        )}

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          <QuickAction label="Captain" onPress={() => {}} />
          <QuickAction label="Transfers" onPress={() => {}} />
          <QuickAction label="Chips" onPress={() => {}} />
          <QuickAction label="Research" onPress={() => {}} />
        </View>
      </View>
    </ScrollView>
  );
}

function QuickAction({ label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        minWidth: '40%',
        padding: 16,
        borderRadius: 12,
        backgroundColor: colors.bg.surface,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>
  );
}

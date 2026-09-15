import React, { useState, useMemo } from 'react';
import { View, ScrollView, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { Button } from '@/components/primitives/Button';
import { colors } from '@/theme/colors';
import { useTeamStore } from '@/state/useTeamStore';
import { usePlayerStore } from '@/state/usePlayerStore';
import { useFplBootstrap } from '@/hooks/useFplBootstrap';
import { useNavigation } from '@react-navigation/native';
import { useFixtures } from '@/hooks/useFplData';
import { getEntryHistory } from '@/data/fpl/client';
import { useCurrentGameweek } from '@/state/useCurrentGameweek';
import { spacing, radius } from '@/theme';
import { Bell, ChevronRight, TrendingUp } from 'lucide-react-native';
import { MyTeamTopBar } from '@/navigation/MyTeamTopBar';

const { width } = Dimensions.get('window');

function formatCountdown(deadlineIso) {
  if (!deadlineIso) return null;
  const diffMs = new Date(deadlineIso).getTime() - Date.now();
  if (diffMs <= 0) return null;
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return `${days}d ${hours}h ${minutes}m`;
}

export function HomeScreen() {
  const activeTeam = useTeamStore(s => s.getActiveTeam());
  const { data: bootstrapData, isLoading: isBootstrapLoading } = useFplBootstrap();
  const navigation = useNavigation();
  const { gameweek } = useCurrentGameweek();

  // The gameweek currently browsed via the top-bar stepper — drives the
  // "GW{n} POINTS" card, the fixtures list, and the "FPL live" pill.
  const currentEvent = useMemo(() =>
    bootstrapData?.events?.find(e => e.id === gameweek) ||
    bootstrapData?.events?.find(e => e.is_current) ||
    bootstrapData?.events?.find(e => e.is_next) ||
    { id: gameweek || 1, name: `Gameweek ${gameweek || 1}` },
  [bootstrapData, gameweek]);

  // The next real deadline — independent of what GW is being browsed above.
  // Once an event's deadline has passed, is_next moves on to the following
  // one, so this always points at the next actionable deadline.
  const deadlineEvent = useMemo(() =>
    bootstrapData?.events?.find(e => e.is_next) ||
    bootstrapData?.events?.find(e => !e.finished && new Date(e.deadline_time) > new Date()),
  [bootstrapData]);

  const deadlineCountdown = useMemo(() => formatCountdown(deadlineEvent?.deadline_time), [deadlineEvent]);

  const { data: fixtures, isLoading: isFixturesLoading } = useFixtures(currentEvent?.id);

  const fplTeamId = activeTeam?.fplTeamId;
  const { data: historyData } = useQuery({
    queryKey: ['fpl', 'entryHistory', fplTeamId],
    queryFn: ({ signal }) => getEntryHistory(fplTeamId, signal),
    enabled: !!fplTeamId,
    staleTime: 1000 * 60 * 5,
  });

  const gwStats = useMemo(() => {
    const rows = historyData?.current;
    if (!rows || !currentEvent?.id) return null;
    const currentRow = rows.find(r => r.event === currentEvent.id);
    if (!currentRow) return null;
    const prevRow = rows.find(r => r.event === currentEvent.id - 1);
    const rankChange = prevRow ? prevRow.overall_rank - currentRow.overall_rank : null;
    return { points: currentRow.points, rankChange };
  }, [historyData, currentEvent]);

  const liveFixtures = useMemo(() => {
    if (!fixtures || !bootstrapData?.teams) return [];
    const teams = bootstrapData.teams;
    const getTeamShort = (id) => teams.find(t => t.id === id)?.short_name || '?';

    // Sort by started but not finished first, then by time
    return fixtures
      .filter(f => !f.finished)
      .slice(0, 6)
      .map(f => ({
        id: f.id,
        home: getTeamShort(f.team_h),
        away: getTeamShort(f.team_a),
        hScore: f.team_h_score ?? 0,
        aScore: f.team_a_score ?? 0,
      }));
  }, [fixtures, bootstrapData]);

  if (isBootstrapLoading) {
    return (
      <View className="flex-1 bg-secondary" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.accent.primary} size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-secondary">
      <MyTeamTopBar />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* FPL Live Status */}
        <View className="mb-5">
          <View className="flex-row items-center self-start px-2.5 py-1 bg-emerald-500/10 rounded-full gap-1.5">
            <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <Text className="text-emerald-500 text-xs font-bold">FPL live · GW{currentEvent?.id}</Text>
          </View>
        </View>

        {/* Greeting */}
        <View className="flex-row justify-between items-start mb-6">
          <View>
            <Text className="text-text-secondary text-sm font-medium">Good evening</Text>
            <View className="flex-row items-center">
              <Text className="text-text-primary text-3xl font-bold">{activeTeam?.name || 'Elite FPL'}</Text>
              <Text className="text-emerald-500 text-2xl ml-2 mt-1">⋄</Text>
            </View>
          </View>
          <View className="flex-row items-center px-2.5 py-1 bg-red-500/10 rounded-lg mt-2.5 gap-1.5">
            <View className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            <Text className="text-red-500 text-[10px] font-bold uppercase">GW{currentEvent?.id} live</Text>
          </View>
        </View>

        {/* Top Info Cards */}
        <View className="flex-row gap-4 mb-6">
          <Card className="flex-1 p-5 bg-surface rounded-2xl gap-1 justify-center min-h-[110px]">
            <Text className="text-text-secondary text-[10px] font-semibold tracking-wider">DEADLINE</Text>
            <Text className="text-text-primary text-2xl font-bold">{deadlineCountdown || 'Season complete'}</Text>
            {deadlineEvent && (
              <Text className="text-text-secondary text-xs font-medium">Gameweek {deadlineEvent.id}</Text>
            )}
          </Card>
          <Card className="flex-1 p-5 bg-surface rounded-2xl gap-1 justify-center min-h-[110px]">
            <Text className="text-text-secondary text-[10px] font-semibold tracking-wider">GW{currentEvent?.id} POINTS</Text>
            <Text className="text-text-primary text-[20px] font-bold">{gwStats?.points ?? '–'}</Text>
            {gwStats?.rankChange != null && (
              <View className="flex-row items-center gap-1 mt-0.5">
                <TrendingUp
                  size={12}
                  color={gwStats.rankChange >= 0 ? colors.accent.primary : colors.status.danger}
                  style={gwStats.rankChange < 0 ? { transform: [{ rotate: '180deg' }] } : undefined}
                />
                <Text className={gwStats.rankChange >= 0 ? "text-emerald-500 text-xs font-semibold" : "text-red-500 text-xs font-semibold"}>
                  {gwStats.rankChange >= 0 ? '+' : ''}{gwStats.rankChange.toLocaleString()} rank
                </Text>
              </View>
            )}
          </Card>
        </View>

        {/* Needs Attention */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-text-primary text-[17px] font-bold">Needs attention</Text>
          <Bell size={18} color={colors.text.secondary} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          <Card className="w-[240px] p-5 bg-surface rounded-2xl gap-1 mr-3">
            <Text className="text-text-secondary text-[9px] font-bold tracking-wider">PRICE</Text>
            <Text className="text-text-primary text-sm font-bold">Szoboszlai likely to fall</Text>
            <Text className="text-text-secondary text-xs leading-4">76% confidence before tonight's update</Text>
          </Card>
          <Card className="w-[240px] p-5 bg-surface rounded-2xl gap-1 mr-3">
            <Text className="text-text-secondary text-[9px] font-bold tracking-wider">CAPTAIN</Text>
            <Text className="text-text-primary text-sm font-bold">B.Fernandes</Text>
            <Text className="text-text-secondary text-xs leading-4">xGI 2.84 supporting the ceiling</Text>
          </Card>
        </ScrollView>

        {/* Remaining GW */}
        <Card className="bg-surface p-5 rounded-2xl mb-6">
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-text-primary text-base font-bold">Remaining GW{currentEvent?.id}</Text>
            <Text className="text-emerald-500 text-sm font-semibold">Live board</Text>
          </View>

          <View className="gap-5">
            {isFixturesLoading ? (
              <ActivityIndicator color={colors.accent.primary} />
            ) : liveFixtures.length > 0 ? (
              liveFixtures.map((f) => (
                <View key={f.id} className="flex-row items-center justify-between">
                  <View className="flex-1 flex-row items-center gap-3">
                    <View className="w-[26px] h-[26px] rounded-md bg-white/10" />
                    <Text className="text-text-primary text-sm font-bold">{f.home}</Text>
                  </View>
                  <Text className="text-text-secondary text-sm font-semibold w-20 text-center">{f.hScore} – {f.aScore}</Text>
                  <View className="flex-1 flex-row items-center gap-3 justify-end">
                    <Text className="text-text-primary text-sm font-bold">{f.away}</Text>
                    <View className="w-[26px] h-[26px] rounded-md bg-white/10" />
                  </View>
                </View>
              ))
            ) : (
              <Text className="text-text-secondary text-center">No live fixtures right now.</Text>
            )}
          </View>
        </Card>

        {/* Quick Actions Grid */}
        <View className="flex-row flex-wrap gap-4">
          <ActionCard
            title="Captain"
            sub="Ranked with receipts"
            onPress={() => navigation.navigate('MyTeam', { screen: 'Captain' })}
          />
          <ActionCard
            title="Transfers"
            sub="Solver + planner"
            onPress={() => navigation.navigate('MyTeam', { screen: 'Transfers' })}
          />
          <ActionCard
            title="Chips"
            sub="Windows vs fixtures"
            onPress={() => navigation.navigate('MyTeam', { screen: 'Chips' })}
          />
          <ActionCard
            title="Research"
            sub="Lineups · FDR · xPts"
            onPress={() => navigation.navigate('MyTeam', { screen: 'Research' })}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function ActionCard({ title, sub, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-surface p-5 rounded-2xl border border-border flex-row items-center justify-between"
      style={{ width: (width - 48) / 2 }}
    >
      <View className="flex-1">
        <Text className="text-text-primary text-base font-bold mb-0.5">{title}</Text>
        <Text className="text-text-secondary text-[11px] font-medium">{sub}</Text>
      </View>
      <ChevronRight size={18} color={colors.text.secondary} opacity={0.5} />
    </Pressable>
  );
}


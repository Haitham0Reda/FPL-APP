import React, { useMemo, useState } from 'react';
import { View, ScrollView, Pressable, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { colors } from '@/theme/colors';
import { useTeamStore } from '@/state/useTeamStore';
import { usePlayerStore } from '@/state/usePlayerStore';
import { useCurrentGameweek } from '@/state/useCurrentGameweek';
import { getEventLive } from '@/data/fpl/client';
import { getPlayerPosition } from '@/utils/players';
import { ChevronDown, Share2, GitFork } from 'lucide-react-native';

function getShirtUrl(player, team) {
  const code = team?.code;
  if (!code) return null;
  const gk = player.element_type === 1 ? '_1' : '';
  return `https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${code}${gk}-66.png`;
}

export function SquadScreen() {
  const activeTeam = useTeamStore(s => s.getActiveTeam());
  const playersById = usePlayerStore(s => s.playersById);
  const teamsById = usePlayerStore(s => s.teamsById);
  const { gameweek } = useCurrentGameweek();

  const { data: liveData } = useQuery({
    queryKey: ['fpl', 'eventLive', gameweek],
    queryFn: ({ signal }) => getEventLive(gameweek, signal),
    enabled: !!gameweek,
    staleTime: 1000 * 60 * 2,
  });

  const pointsByPlayerId = useMemo(() => {
    const map = {};
    (liveData?.elements || []).forEach(e => {
      map[String(e.id)] = e.stats?.total_points ?? 0;
    });
    return map;
  }, [liveData]);

  const squad = useMemo(() => {
    if (!activeTeam) return [];
    return activeTeam.squad.map(s => {
      const rawPlayer = playersById[s.playerId];
      const player = rawPlayer ? {
        ...rawPlayer,
        position: getPlayerPosition(rawPlayer),
      } : null;
      return {
        ...s,
        player,
        team: player ? teamsById[String(player.team)] : null,
        points: pointsByPlayerId[s.playerId] ?? 0,
        isCaptain: s.playerId === activeTeam.captainId,
        isViceCaptain: s.playerId === activeTeam.viceCaptainId,
      };
    });
  }, [activeTeam, playersById, teamsById, pointsByPlayerId]);

  const starting = squad.filter(s => s.isStarting);
  const bench = squad.filter(s => !s.isStarting).sort((a, b) => (a.benchOrder || 0) - (b.benchOrder || 0));

  const startingByPosition = useMemo(() => {
    const grouped = { GK: [], DEF: [], MID: [], FWD: [] };
    starting.forEach(s => {
      if (s.player) {
        const pos = s.player.position || 'MID';
        if (grouped[pos]) grouped[pos].push(s);
      }
    });
    return grouped;
  }, [starting]);

  // Live teams: derive the real formation from the actual starting XI
  // (outfield DEF-MID-FWD split) rather than trusting a stored label.
  // Draft teams have no real picks to derive from, so keep their
  // user-chosen formation.
  const formation = activeTeam?.isLive
    ? `${startingByPosition.DEF.length}-${startingByPosition.MID.length}-${startingByPosition.FWD.length}`
    : activeTeam?.formation;

  if (!activeTeam) return null;

  return (
    <View className="flex-1 bg-secondary">
      <ScrollView className="flex-1" contentContainerClassName="pb-[120px]">
        {/* Pitch Header */}
        <View className="px-3 pt-2 gap-3 z-10">
          <View className="flex-row items-center">
            <View className="flex-row items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-full">
              <View className="w-1.5 h-1.5 rounded-full bg-primary" />
              <Text className="text-primary text-xs font-bold">FPL live · GW{gameweek}</Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <Text className="text-text-secondary text-[13px] font-semibold">Formation</Text>
              <Pressable className="flex-row items-center gap-1.5 bg-surface px-2.5 py-1.5 rounded-lg border border-border">
                <Text className="text-text-primary text-sm font-bold">{formation}</Text>
                <ChevronDown size={14} color={colors.text.secondary} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* The Pitch */}
        <View className="p-3 mt-2">
          <View className="bg-[#064E3B] rounded-[20px] border-[1.5px] border-primary/30 py-4 flex-col justify-evenly relative">
            {/* Field Lines Overlays */}
            <View className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-white/10" />
            <View className="absolute top-1/2 left-1/2 w-[100px] h-[100px] rounded-full border-[1.5px] border-white/10 -ml-[50px] -mt-[50px]" />
            <View className="absolute top-0 left-[20%] w-[60%] h-[60px] border-[1.5px] border-t-0 border-white/10 rounded-b-[10px]" />
            <View className="absolute bottom-0 left-[20%] w-[60%] h-[60px] border-[1.5px] border-b-0 border-white/10 rounded-t-[10px]" />

            <PitchRow players={startingByPosition.GK} />
            <PitchRow players={startingByPosition.DEF} />
            <PitchRow players={startingByPosition.MID} />
            <PitchRow players={startingByPosition.FWD} />
          </View>
        </View>

        {/* Bench Section */}
        <View className="px-3 pt-5">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text-secondary text-[13px] font-bold shrink-0">BENCH</Text>
            <Text className="flex-1 ml-2 text-right text-text-secondary text-[11px] font-medium opacity-60" numberOfLines={1}>Tap to inspect · order is auto-sub priority</Text>
          </View>

          <View className="flex-row justify-between gap-2">
            {bench.map((s, idx) => (
              <BenchPlayer
                key={s.playerId}
                idx={idx + 1}
                player={s.player}
                team={s.team}
                points={s.points}
                squadPlayer={s}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="absolute bottom-0 left-0 right-0 flex-row p-3 gap-3 bg-secondary border-t border-border z-20">
        <Pressable className="flex-1 flex-row items-center justify-center gap-2 bg-surface py-3.5 rounded-lg border border-border">
          <Share2 size={18} color={colors.text.primary} />
          <Text className="text-text-primary text-[15px] font-bold">Share</Text>
        </Pressable>
        <Pressable className="flex-1 flex-row items-center justify-center gap-2 bg-surface py-3.5 rounded-lg border border-border">
          <GitFork size={18} color={colors.text.primary} />
          <Text className="text-text-primary text-[15px] font-bold">Fork draft</Text>
        </Pressable>
      </View>
    </View>
  );
}

function PitchRow({ players }) {
  return (
    <View className="flex-row justify-center items-center w-full px-1 my-2.5">
      {players.map(s => (
        <PitchPlayer key={s.playerId} player={s.player} team={s.team} points={s.points} squadPlayer={s} />
      ))}
    </View>
  );
}

function Shirt({ player, team, size = 44 }) {
  const [failed, setFailed] = useState(false);
  const url = getShirtUrl(player, team);

  if (!url || failed) {
    return (
      <View
        className="items-center justify-center bg-border border-2 border-white/10"
        style={{ width: size, height: size, borderRadius: size / 2 }}
      >
        <Text className="text-text-primary text-lg font-bold">{player.web_name?.[0]}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: url }}
      style={{ width: size, height: size * 1.05 }}
      resizeMode="contain"
      onError={() => setFailed(true)}
    />
  );
}

function CaptainMark({ isViceCaptain, small }) {
  const sizeClass = small ? "w-4 h-4 rounded-full" : "w-5 h-5 rounded-full";
  const posClass = small ? "-top-[3px] -left-[3px]" : "-top-1 -left-1";
  const fontSize = small ? 9 : 11;
  const accentClass = isViceCaptain ? "border-text-secondary" : "border-primary";
  const letterClass = isViceCaptain ? "text-text-secondary" : "text-primary";
  return (
    <View className={`absolute ${posClass} ${sizeClass} items-center justify-center border-[1.5px] bg-secondary z-[5] ${accentClass}`}>
      <Text
        className={`font-black ${letterClass}`}
        style={{ fontSize, lineHeight: fontSize, includeFontPadding: false, textAlignVertical: 'center' }}
      >
        {isViceCaptain ? 'V' : 'C'}
      </Text>
    </View>
  );
}

function PitchPlayer({ player, team, points, squadPlayer }) {
  if (!player) return <View className="w-20 items-center mx-1" />;

  return (
    <View className="w-20 items-center mx-1">
      <View className="relative mb-1" style={{ width: 48 }}>
        <Shirt player={player} team={team} size={48} />
        {squadPlayer.isCaptain && <CaptainMark />}
        {squadPlayer.isViceCaptain && <CaptainMark isViceCaptain />}
      </View>
      <View className="bg-surface-raised px-2 py-0.5 rounded min-w-[76px]">
        <Text className="text-text-primary text-[11px] font-bold text-center" numberOfLines={1}>{player.web_name}</Text>
      </View>
      <View className="bg-secondary px-2 py-px rounded-b min-w-[76px]">
        <Text className="text-text-primary text-xs font-extrabold text-center">{points}</Text>
      </View>
    </View>
  );
}

function BenchPlayer({ idx, player, team, points, squadPlayer }) {
  if (!player) return null;

  return (
    <Card className="flex-1 p-2 items-center bg-surface rounded-xl border border-border">
      <Text className="text-text-secondary text-[10px] font-bold mb-1.5">{player.position}</Text>
      <View className="relative mb-1.5" style={{ width: 36 }}>
        <Shirt player={player} team={team} size={36} />
        {squadPlayer.isCaptain && <CaptainMark small />}
        {squadPlayer.isViceCaptain && <CaptainMark isViceCaptain small />}
      </View>
      <Text className="text-text-primary text-xs font-bold text-center mb-0.5" numberOfLines={1}>{player.web_name}</Text>
      <Text className="text-text-secondary text-[11px] font-semibold">{points} pts</Text>
      <Pressable className="mt-2 py-1 w-full items-center border-t border-border">
        <Text className="text-primary text-[11px] font-bold">Move up</Text>
      </Pressable>
    </Card>
  );
}

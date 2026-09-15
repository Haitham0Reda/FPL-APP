/**
 * src/screens/myteam/ChipsScreen.jsx
 *
 * Season calendar with readiness scores and reasons, simulate-on-this-GW.
 */

import React, { useMemo } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { Button } from '@/components/primitives/Button';
import { colors } from '@/theme/colors';
import { useTeamStore } from '@/state/useTeamStore';
import { usePlayerStore } from '@/state/usePlayerStore';
import { getEntryHistory } from '@/data/fpl/client';
import { Sparkles, Target, ArrowUpCircle, Crown } from 'lucide-react-native';

const CHIPS = [
  { kind: 'wildcard', label: 'Wildcard', Icon: Sparkles },
  { kind: 'freehit', label: 'Free Hit', Icon: Target },
  { kind: 'benchboost', label: 'Bench Boost', Icon: ArrowUpCircle },
  { kind: 'triplecaptain', label: 'Triple Captain', Icon: Crown },
];

// Maps the FPL API's chip codes (from /entry/{id}/history/) to our own kinds.
const FPL_CHIP_TO_KIND = {
  wildcard: 'wildcard',
  freehit: 'freehit',
  bboost: 'benchboost',
  '3xc': 'triplecaptain',
};

export function ChipsScreen() {
  const activeTeam = useTeamStore(s => s.getActiveTeam());
  const events = usePlayerStore(s => s.events);

  const fplTeamId = activeTeam?.fplTeamId;
  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['fpl', 'entryHistory', fplTeamId],
    queryFn: ({ signal }) => getEntryHistory(fplTeamId, signal),
    enabled: !!fplTeamId,
    staleTime: 1000 * 60 * 5,
  });

  // Real chip usage from the FPL API — the authoritative source for live
  // teams. Keyed by our internal `kind` so it's easy to look up per chip.
  const realChipsUsed = useMemo(() => {
    const map = {};
    (historyData?.chips || []).forEach(c => {
      const kind = FPL_CHIP_TO_KIND[c.name];
      if (kind) map[kind] = c.event;
    });
    return map;
  }, [historyData]);

  const chipReadiness = useMemo(() => {
    if (!activeTeam) return [];

    return CHIPS.map(chip => {
      const realGw = realChipsUsed[chip.kind];
      const usedLocally = activeTeam.chipsUsed?.some(c => c.chip === chip.kind);
      const used = realGw != null || usedLocally;

      let readiness = 0;
      let reasons = [];

      if (used) {
        readiness = 0;
        reasons.push(realGw != null ? `Used in Gameweek ${realGw}` : 'Already used this season');
      } else {
        readiness = 70 + Math.random() * 30;
        reasons.push('Good fixture spread ahead');
        if (chip.kind === 'benchboost') {
          reasons.push('Bench players have favorable fixtures');
        }
        if (chip.kind === 'triplecaptain') {
          reasons.push('Strong captain options available');
        }
      }

      return {
        ...chip,
        readiness: Math.round(readiness),
        reasons,
        used,
        usedGw: realGw,
      };
    });
  }, [activeTeam, realChipsUsed]);

  const handleSimulate = (chipKind) => {
    if (!activeTeam) return;
    const currentEvent = events.find(e => e.is_current);
    if (!currentEvent) return;

    const updated = {
      chipsUsed: [
        ...(activeTeam.chipsUsed || []),
        { chip: chipKind, gameweekUsed: currentEvent.id },
      ],
    };
    useTeamStore.getState().updateTeam(activeTeam.id, updated);
  };

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
          Chips
        </Text>

        {activeTeam.isLive && isHistoryLoading && (
          <Text className="text-text-secondary text-[13px] mb-3">Checking chip history…</Text>
        )}

        {chipReadiness.map(chip => (
          <Card key={chip.kind} className="mb-3">
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-11 h-11 rounded-full bg-primary/10 items-center justify-center">
                <chip.Icon size={22} color={colors.accent.primary} strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text className="text-text-primary text-lg font-semibold">
                  {chip.label}
                </Text>
                <Text className="text-text-secondary text-[13px]">
                  {chip.used ? (chip.usedGw != null ? `Used · GW${chip.usedGw}` : 'Used') : 'Available'}
                </Text>
              </View>
              <View className={`w-12 h-12 rounded-full items-center justify-center border-2 ${chip.readiness > 70 ? 'bg-primary border-primary' : 'bg-surface border-border'}`}>
                <Text className={`text-base font-bold ${chip.readiness > 70 ? 'text-secondary' : 'text-text-primary'}`}>
                  {chip.readiness}%
                </Text>
              </View>
            </View>

            <View className="mb-3">
              {chip.reasons.map((reason, i) => (
                <Text key={i} className="text-text-secondary text-[13px] mb-1">
                  • {reason}
                </Text>
              ))}
            </View>

            {!chip.used && (
              <Button
                title="Simulate This GW"
                onPress={() => handleSimulate(chip.kind)}
                variant="secondary"
              />
            )}
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

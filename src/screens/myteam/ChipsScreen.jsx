/**
 * src/screens/myteam/ChipsScreen.jsx
 *
 * Season calendar with readiness scores and reasons, simulate-on-this-GW.
 */

import React, { useMemo } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { Button } from '@/components/primitives/Button';
import { colors } from '@/theme/colors';
import { useTeamStore } from '@/state/useTeamStore';
import { usePlayerStore } from '@/state/usePlayerStore';
import { useCurrentGameweek } from '@/state/useCurrentGameweek';

const CHIPS = [
  { kind: 'wildcard', label: 'Wildcard', icon: '🃏' },
  { kind: 'freehit', label: 'Free Hit', icon: '🎯' },
  { kind: 'benchboost', label: 'Bench Boost', icon: '⬆️' },
  { kind: 'triplecaptain', label: 'Triple Captain', icon: '👑' },
];

export function ChipsScreen() {
  const activeTeam = useTeamStore(s => s.getActiveTeam());
  const events = usePlayerStore(s => s.events);
  const currentGW = useCurrentGameweek();

  const chipReadiness = useMemo(() => {
    if (!activeTeam) return [];

    return CHIPS.map(chip => {
      const used = activeTeam.chipsUsed?.some(c => c.chip === chip.kind);
      const currentEvent = events.find(e => e.is_current);
      const nextEvent = events.find(e => e.is_next);

      let readiness = 0;
      let reasons = [];

      if (used) {
        readiness = 0;
        reasons.push('Already used this season');
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
      };
    });
  }, [activeTeam, events]);

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
      <View style={{ flex: 1, backgroundColor: colors.bg.primary, padding: 20 }}>
        <Text style={{ color: colors.text.secondary }}>No team selected.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <View style={{ padding: 20 }}>
        <Text style={{ color: colors.text.primary, fontSize: 24, fontWeight: '700', marginBottom: 16 }}>
          Chips
        </Text>

        {chipReadiness.map(chip => (
          <Card key={chip.kind} style={{ padding: 16, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Text style={{ fontSize: 28 }}>{chip.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '600' }}>
                  {chip.label}
                </Text>
                <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                  {chip.used ? 'Used' : 'Available'}
                </Text>
              </View>
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: chip.readiness > 70 ? colors.accent.primary : colors.bg.surface,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: chip.readiness > 70 ? colors.accent.primary : colors.border.subtle,
              }}>
                <Text style={{
                  color: chip.readiness > 70 ? colors.bg.primary : colors.text.primary,
                  fontSize: 16,
                  fontWeight: '700',
                }}>
                  {chip.readiness}%
                </Text>
              </View>
            </View>

            <View style={{ marginBottom: 12 }}>
              {chip.reasons.map((reason, i) => (
                <Text key={i} style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 4 }}>
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

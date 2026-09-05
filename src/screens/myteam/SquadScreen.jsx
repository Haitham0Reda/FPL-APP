import React, { useMemo, useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, Switch, ImageBackground } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { Button } from '@/components/primitives/Button';
import { colors } from '@/theme/colors';
import { useTeamStore } from '@/state/useTeamStore';
import { usePlayerStore } from '@/state/usePlayerStore';
import { useCurrentGameweek } from '@/state/useCurrentGameweek';
import { spacing, radius } from '@/theme';
import { ChevronDown, Share2, GitFork } from 'lucide-react-native';

const FORMATIONS = ['3-4-3', '3-5-2', '4-4-2', '4-3-3', '5-3-2', '5-4-1', '4-5-1', '5-2-3'];

export function SquadScreen() {
  const activeTeam = useTeamStore(s => s.getActiveTeam());
  const updateTeam = useTeamStore(s => s.updateTeam);
  const playersById = usePlayerStore(s => s.playersById);
  const { gameweek } = useCurrentGameweek();
  const [autoSubs, setAutoSubs] = useState(false);

  const squad = useMemo(() => {
    if (!activeTeam) return [];
    return activeTeam.squad.map(s => ({
      ...s,
      player: playersById[s.playerId] || null,
    }));
  }, [activeTeam, playersById]);

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

  if (!activeTeam) return null;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Pitch Header */}
        <View style={styles.pitchHeader}>
          <View style={styles.statusRow}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>FPL live · GW{gameweek}</Text>
            </View>
          </View>

          <View style={styles.pitchControls}>
            <View style={styles.formationPicker}>
              <Text style={styles.controlLabel}>Formation</Text>
              <Pressable style={styles.pickerButton}>
                <Text style={styles.pickerText}>{activeTeam.formation}</Text>
                <ChevronDown size={14} color={colors.text.secondary} />
              </Pressable>
            </View>
            <View style={styles.autoSubsRow}>
              <Text style={styles.controlLabel}>Auto-subs</Text>
              <Switch
                value={autoSubs}
                onValueChange={setAutoSubs}
                trackColor={{ false: colors.bg.surfaceRaised, true: colors.accent.primary }}
                thumbColor={colors.text.primary}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>
          </View>
        </View>

        {/* The Pitch */}
        <View style={styles.pitch}>
          <View style={styles.pitchBoundary}>
            {/* Field Lines Overlays */}
            <View style={styles.fieldCenterLine} />
            <View style={styles.fieldCenterCircle} />
            <View style={styles.fieldPenaltyAreaTop} />
            <View style={styles.fieldPenaltyAreaBottom} />

            <PitchRow label="FWD" players={startingByPosition.FWD} />
            <PitchRow label="MID" players={startingByPosition.MID} />
            <PitchRow label="DEF" players={startingByPosition.DEF} />
            <PitchRow label="GK" players={startingByPosition.GK} />
          </View>
        </View>

        {/* Bench Section */}
        <View style={styles.benchSection}>
          <View style={styles.benchHeader}>
            <Text style={styles.benchTitle}>BENCH</Text>
            <Text style={styles.benchSubtitle}>Tap to inspect · order is auto-sub priority</Text>
          </View>

          <View style={styles.benchGrid}>
            {bench.map((s, idx) => (
              <BenchPlayer
                key={s.playerId}
                idx={idx + 1}
                player={s.player}
                squadPlayer={s}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Pressable style={styles.actionBtn}>
          <Share2 size={18} color={colors.text.primary} />
          <Text style={styles.actionBtnText}>Share</Text>
        </Pressable>
        <Pressable style={styles.actionBtn}>
          <GitFork size={18} color={colors.text.primary} />
          <Text style={styles.actionBtnText}>Fork draft</Text>
        </Pressable>
      </View>
    </View>
  );
}

function PitchRow({ players }) {
  return (
    <View style={styles.pitchRow}>
      {players.map(s => (
        <PitchPlayer key={s.playerId} player={s.player} squadPlayer={s} />
      ))}
    </View>
  );
}

function PitchPlayer({ player, squadPlayer }) {
  if (!player) return <View style={styles.playerNode} />;

  // Mock xPts for visual
  const xPts = (Number(player.form || 0) / 4).toFixed(1);
  const dotColor = xPts > 4 ? colors.status.success : xPts > 2 ? colors.status.warning : colors.status.danger;

  return (
    <View style={styles.playerNode}>
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: '#334155' }]}>
          <Text style={styles.avatarInitial}>{player.web_name?.[0]}</Text>
        </View>
        {squadPlayer.isCaptain && <View style={styles.captainBadge}><Text style={styles.badgeText}>C</Text></View>}
        {squadPlayer.isViceCaptain && <View style={[styles.captainBadge, { backgroundColor: colors.text.secondary }]}><Text style={styles.badgeText}>V</Text></View>}
      </View>
      <Text style={styles.playerName} numberOfLines={1}>{player.web_name}</Text>
      <View style={styles.xPtsRow}>
        <View style={[styles.xPtsDot, { backgroundColor: dotColor }]} />
        <Text style={styles.xPtsText}>{xPts}</Text>
      </View>
    </View>
  );
}

function BenchPlayer({ idx, player, squadPlayer }) {
  if (!player) return null;

  const xPts = (Number(player.form || 0) / 4).toFixed(1);

  return (
    <Card style={styles.benchCard}>
      <View style={styles.benchTopRow}>
        <Text style={styles.benchIdx}>{idx}</Text>
        <Text style={styles.benchPos}>{player.position}</Text>
      </View>
      <View style={styles.benchAvatar}>
        <Text style={styles.avatarInitial}>{player.web_name?.[0]}</Text>
      </View>
      <Text style={styles.benchName} numberOfLines={1}>{player.web_name}</Text>
      <Text style={styles.benchXPts}>{xPts} xPts</Text>
      <Pressable style={styles.moveUpBtn}>
        <Text style={styles.moveUpText}>Move up</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  pitchHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.md,
    zIndex: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent.primary,
  },
  liveText: {
    color: colors.accent.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  pitchControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formationPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  controlLabel: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bg.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  pickerText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  autoSubsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pitch: {
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  pitchBoundary: {
    backgroundColor: '#064E3B', // Darker pitch green
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    paddingVertical: 10,
    minHeight: 520,
    flexDirection: 'column',
    justifyContent: 'space-around',
    overflow: 'hidden',
    position: 'relative',
  },
  fieldCenterLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  fieldCenterCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: -50,
    marginTop: -50,
  },
  fieldPenaltyAreaTop: {
    position: 'absolute',
    top: -30,
    left: '20%',
    width: '60%',
    height: 80,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  fieldPenaltyAreaBottom: {
    position: 'absolute',
    bottom: -30,
    left: '20%',
    width: '60%',
    height: 80,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  pitchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 4,
    marginVertical: 10,
  },
  playerNode: {
    width: 80, // Fixed width to prevent overlapping
    alignItems: 'center',
    marginHorizontal: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarInitial: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  captainBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#064E3B',
    zIndex: 5,
  },
  badgeText: {
    color: colors.text.onAccent,
    fontSize: 11,
    fontWeight: '900',
  },
  teamBadge: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  playerName: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  xPtsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  xPtsDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  xPtsText: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  benchSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  benchHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  benchTitle: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  benchSubtitle: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.6,
  },
  benchGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  benchCard: {
    flex: 1,
    padding: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  benchTopRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  benchIdx: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: '700',
    opacity: 0.5,
  },
  benchPos: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: '700',
  },
  benchAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  benchName: {
    color: colors.text.primary,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  benchXPts: {
    color: colors.text.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
  moveUpBtn: {
    marginTop: 8,
    paddingVertical: 4,
    width: '100%',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  moveUpText: {
    color: colors.accent.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.bg.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    zIndex: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.bg.surface,
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  actionBtnText: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});

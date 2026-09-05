/**
 * src/components/fpl/PlayerCard.jsx
 *
 * Player card with avatar, name, price, form, xGI, ownership, status badge.
 */

import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { colors } from '@/theme/colors';

export function PlayerCard({ player, onPress, compact }) {
  if (!player) return null;

  const positionColors = {
    GK: '#3B82F6',
    DEF: '#10B981',
    MID: '#F59E0B',
    FWD: '#EF4444',
  };

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 12,
        backgroundColor: colors.bg.surface,
        borderWidth: 1,
        borderColor: colors.border.subtle,
      }}
    >
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: positionColors[player.position] || colors.border.subtle,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Text style={{ color: colors.bg.primary, fontSize: 16, fontWeight: '700' }}>
          {player.web_name?.[0] || '?'}
        </Text>
      </View>

      {!compact && (
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '600' }}>
            {player.web_name || 'Unknown'}
          </Text>
          <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
            {player.position || 'MID'} • £{((player.now_cost || 0) / 10).toFixed(1)}m
          </Text>
        </View>
      )}

      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '600' }}>
          {((player.now_cost || 0) / 10).toFixed(1)}
        </Text>
        <Text style={{ color: colors.text.secondary, fontSize: 11 }}>
          {(player.form || 0).toFixed(1)} form
        </Text>
      </View>

      {player.status !== 'a' && (
        <View style={{
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 4,
          backgroundColor: colors.status.warning,
        }}>
          <Text style={{ color: colors.bg.primary, fontSize: 10, fontWeight: '700' }}>
            {player.status?.toUpperCase()}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

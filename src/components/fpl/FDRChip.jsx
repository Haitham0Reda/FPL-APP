/**
 * src/components/fpl/FDRChip.jsx
 *
 * FDR rating chip with color coding.
 */

import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { colors } from '@/theme/colors';

const FDR_COLORS = {
  1: colors.fdr.fdr1,
  2: colors.fdr.fdr2,
  3: colors.fdr.fdr3,
  4: colors.fdr.fdr4,
  5: colors.fdr.fdr5,
};

export function FDRChip({ value, compact }) {
  const color = FDR_COLORS[value] || colors.fdr.fdr3;

  if (compact) {
    return (
      <View style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Text style={{ color: colors.bg.primary, fontSize: 10, fontWeight: '700' }}>
          {value}
        </Text>
      </View>
    );
  }

  return (
    <View style={{
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: color,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Text style={{ color: colors.bg.primary, fontSize: 12, fontWeight: '700' }}>
        FDR {value}
      </Text>
    </View>
  );
}

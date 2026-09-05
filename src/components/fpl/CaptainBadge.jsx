/**
 * src/components/fpl/CaptainBadge.jsx
 *
 * Captain badge with pulsing emerald animation via Reanimated.
 */

import React from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { Text } from '@/components/primitives/Text';
import { colors } from '@/theme/colors';

export function CaptainBadge({ kind = 'captain', size = 32 }) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.15, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isCaptain = kind === 'captain';
  const label = isCaptain ? 'C' : 'V';
  const bgColor = isCaptain ? colors.accent.primary : '#3B82F6';

  return (
    <Animated.View style={[animatedStyle]}>
      <View style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bgColor,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.bg.primary,
      }}>
        <Text style={{
          color: colors.bg.primary,
          fontSize: size * 0.5,
          fontWeight: '700',
        }}>
          {label}
        </Text>
      </View>
    </Animated.View>
  );
}

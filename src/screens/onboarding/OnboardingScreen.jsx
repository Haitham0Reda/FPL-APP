/**
 * OnboardingScreen — 3-slide welcome carousel with Reanimated transitions,
 * lucide icon anchors, progress dots, and a language picker on the final step.
 *
 * PRD §5.1: Splash → Welcome carousel (3 slides) → Add Your First Team → Language Select → Home.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  SlideInRight,
  SlideOutLeft,
  SlideInLeft,
  SlideOutRight,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import i18n from 'i18next';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { Button } from '@/components/primitives/Button';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme';
import { useTranslation } from 'react-i18next';
import { changeLanguage, SUPPORTED_LANGUAGES } from '@/i18n';
import { ShieldCheck, Layers, Languages, Check } from 'lucide-react-native';

const DOT_BASE = 8;
const DOT_ACTIVE = 24;
const DOT_GAP = 8;

const slides = [
  {
    key: 'recommendations',
    Icon: ShieldCheck,
    titleKey: 'slide1Title',
    bodyKey: 'slide1Body',
  },
  {
    key: 'multiteam',
    Icon: Layers,
    titleKey: 'slide2Title',
    bodyKey: 'slide2Body',
  },
  {
    key: 'language',
    Icon: Languages,
    titleKey: 'slide3Title',
    bodyKey: 'slide3Body',
  },
];

export function OnboardingScreen({ navigation }) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [lang, setLang] = useState(() => i18n.language || 'en');

  const dotWidths = useRef(slides.map(() => useSharedValue(DOT_BASE))).current;

  useEffect(() => {
    dotWidths.forEach((w, i) => {
      w.value = withTiming(i <= index ? DOT_ACTIVE : DOT_BASE, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    });
  }, [index]);

  const handleNext = useCallback(() => {
    if (index < slides.length - 1) {
      setDirection(1);
      setIndex(i => i + 1);
    } else {
      changeLanguage(lang);
      navigation.replace('AddTeam');
    }
  }, [index, lang, navigation]);

  const handleBack = useCallback(() => {
    if (index > 0) {
      setDirection(-1);
      setIndex(i => i - 1);
    }
  }, [index]);

  const entering = direction > 0 ? SlideInRight.duration(350) : SlideInLeft.duration(350);
  const exiting = direction > 0 ? SlideOutLeft.duration(280) : SlideOutRight.duration(280);

  const slide = slides[index];
  const isLast = index === slides.length - 1;

  return (
    <View style={{ flex: 1 }}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={['rgba(16,185,129,0.06)', 'transparent', colors.bg.primary]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
        <Card shadow elevation="overlay" padding="2xl" style={{ width: '100%', maxWidth: 340, alignItems: 'center' }}>
          <Animated.View
            key={index}
            entering={entering}
            exiting={exiting}
            style={{ width: '100%', alignItems: 'center' }}
          >
            <View style={{
              width: 64,
              height: 64,
              borderRadius: radius.full,
              backgroundColor: 'rgba(16,185,129,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.lg,
            }}>
              <slide.Icon size={32} color={colors.accent.primary} strokeWidth={2} />
            </View>

            <Text style={{ textAlign: 'center', marginBottom: spacing.sm, color: colors.text.primary, fontSize: 30, lineHeight: 33, fontWeight: '600' }}>
              {splitTitle(t(slide.titleKey))}
            </Text>

            <Text preset="body" style={{ textAlign: 'center', color: colors.text.secondary, lineHeight: 22 }}>
              {t(slide.bodyKey)}
            </Text>

            {isLast && (
              <View style={{ marginTop: spacing.xl, width: '100%' }}>
                <Text preset="dataLabel" style={{ color: colors.text.secondary, marginBottom: spacing.sm, textAlign: 'center' }}>
                  {t('languageLabel')}
                </Text>
                <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
                  {SUPPORTED_LANGUAGES.map(l => {
                    const selected = lang === l;
                    return (
                      <Pressable
                        key={l}
                        onPress={() => setLang(l)}
                        style={{
                          flex: 1,
                          paddingVertical: spacing.md,
                          borderRadius: radius.md,
                          backgroundColor: selected ? colors.accent.primary : colors.bg.surface,
                          borderWidth: 1.5,
                          borderColor: selected ? colors.accent.primary : colors.border.subtle,
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'row',
                          gap: 6,
                        }}
                      >
                        {selected && <Check size={16} color={colors.text.onAccent} strokeWidth={2.5} />}
                        <Text style={{ color: selected ? colors.text.onAccent : colors.text.primary, fontSize: 14, fontWeight: '600' }}>
                          {l === 'en' ? 'English' : 'العربية'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </Animated.View>
        </Card>

        <View style={{ width: '100%', maxWidth: 340, marginTop: spacing.xl, gap: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: DOT_GAP, height: DOT_ACTIVE }}>
            {slides.map((_, i) => {
              const animatedStyle = useAnimatedStyle(() => ({
                width: withTiming(dotWidths[i].value, { duration: 300, easing: Easing.out(Easing.ease) }),
                borderRadius: radius.full,
                backgroundColor: i <= index ? colors.accent.primary : colors.border.subtle,
              }));
              return <Animated.View key={i} style={[animatedStyle, { height: DOT_BASE }]} />;
            })}
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {index > 0 && (
              <Button title="Back" onPress={handleBack} variant="secondary" style={{ flex: 1 }} />
            )}
            <Button title={isLast ? t('getStarted') : t('continue')} onPress={handleNext} style={{ flex: index > 0 ? 2 : 1 }} />
          </View>
        </View>
      </View>
    </View>
  );
}

function splitTitle(title) {
  const parts = title.split(', ');
  if (parts.length === 2) {
    return (
      <>
        {parts[0]},{' '}
        <Text style={{ color: colors.accent.primary, fontSize: 30, lineHeight: 33, fontWeight: '600' }}>{parts[1]}</Text>
      </>
    );
  }
  return title;
}

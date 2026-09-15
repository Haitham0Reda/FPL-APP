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
import { radius } from '@/theme';
import { useTranslation } from 'react-i18next';
import { changeLanguage, SUPPORTED_LANGUAGES } from '@/i18n';
import { ShieldCheck, Layers, Languages, Check } from 'lucide-react-native';

const DOT_BASE = 8;
const DOT_ACTIVE = 24;

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
    <View className="flex-1">
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={['rgba(16,185,129,0.06)', 'transparent', colors.bg.primary]}
        style={StyleSheet.absoluteFillObject}
      />

      <View className="flex-1 justify-center items-center p-6">
        <Card shadow elevation="overlay" padding="2xl" className="w-full max-w-[340px] items-center">
          <Animated.View
            key={index}
            entering={entering}
            exiting={exiting}
            className="w-full items-center"
          >
            <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-5">
              <slide.Icon size={32} color={colors.accent.primary} strokeWidth={2} />
            </View>

            <Text className="text-center mb-2 text-text-primary text-[30px] leading-[33px] font-semibold">
              {splitTitle(t(slide.titleKey))}
            </Text>

            <Text preset="body" className="text-center text-text-secondary leading-[22px]">
              {t(slide.bodyKey)}
            </Text>

            {isLast && (
              <View className="mt-6 w-full">
                <Text preset="dataLabel" className="text-text-secondary mb-2 text-center">
                  {t('languageLabel')}
                </Text>
                <View className="flex-row gap-2 mb-5">
                  {SUPPORTED_LANGUAGES.map(l => {
                    const selected = lang === l;
                    return (
                      <Pressable
                        key={l}
                        onPress={() => setLang(l)}
                        className={`flex-1 py-3 rounded-lg border-[1.5px] items-center justify-center flex-row gap-1.5 ${selected ? 'bg-primary border-primary' : 'bg-surface border-border'}`}
                      >
                        {selected && <Check size={16} color={colors.text.onAccent} strokeWidth={2.5} />}
                        <Text className={`text-sm font-semibold ${selected ? 'text-text-on-accent' : 'text-text-primary'}`}>
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

        <View className="w-full max-w-[340px] mt-6 gap-3">
          <View className="flex-row justify-center items-center gap-2" style={{ height: DOT_ACTIVE }}>
            {slides.map((_, i) => {
              const animatedStyle = useAnimatedStyle(() => ({
                width: withTiming(dotWidths[i].value, { duration: 300, easing: Easing.out(Easing.ease) }),
                borderRadius: radius.full,
                backgroundColor: i <= index ? colors.accent.primary : colors.border.subtle,
              }));
              return <Animated.View key={i} style={[animatedStyle, { height: DOT_BASE }]} />;
            })}
          </View>

          <View className="flex-row gap-2">
            {index > 0 && (
              <Button title="Back" onPress={handleBack} variant="secondary" className="flex-1" />
            )}
            <Button title={isLast ? t('getStarted') : t('continue')} onPress={handleNext} className={index > 0 ? 'flex-[2]' : 'flex-1'} />
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
        <Text className="text-primary text-[30px] leading-[33px] font-semibold">{parts[1]}</Text>
      </>
    );
  }
  return title;
}

/**
 * Shared placeholder shell for stub screens.
 * Lets every screen render the same scaffolding (top label, body, PRD ref)
 * so we can see the navigation working before each feature ships.
 */
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../components/primitives/Text";

export const ScreenPlaceholder = ({
  prdRef,
  blurb
}) => <SafeAreaView className="flex-1 bg-secondary" edges={["bottom"]}>
    <View className="flex-1 px-5 pt-6">
      <View className="mb-8">
        <View className="bg-surface-raised border border-border rounded-xl px-3 py-2 self-start">
          <Text className="text-[11px] font-bold uppercase tracking-[1px] text-primary">{prdRef}</Text>
        </View>
      </View>

      <View className="flex-1 items-center justify-center gap-4 pb-14">
        <View className="mb-3">
          <View className="w-20 h-20 rounded-full bg-accent-muted border-2 border-primary items-center justify-center">
            <Text className="text-4xl">⚽</Text>
          </View>
        </View>

        <Text className="text-3xl font-bold text-text-primary -tracking-[1px] mt-2">Elite FPL</Text>
        <Text className="text-[15px] leading-[22px] text-text-secondary text-center max-w-[340px] px-4">{blurb}</Text>

        <View className="flex-row items-center gap-2 mt-5 px-4 py-2 bg-surface-raised rounded-full border border-border">
          <View className="w-2 h-2 rounded-full bg-primary" />
          <Text className="text-[13px] font-semibold text-text-secondary -tracking-[0.1px]">Phase 0 - In Development</Text>
        </View>
      </View>
    </View>
  </SafeAreaView>;

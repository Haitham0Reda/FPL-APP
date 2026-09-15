/**
 * src/screens/profile/ProfileScreen.jsx
 *
 * Team list with manage actions, Pro-demo toggle, EN/العربية switcher,
 * notifications/biometric/data-source/about entries.
 */

import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/primitives/Text';
import { Card } from '@/components/primitives/Card';
import { Button } from '@/components/primitives/Button';
import { colors } from '@/theme/colors';
import { useTeamStore } from '@/state/useTeamStore';
import { useSettingsStore } from '@/state/useSettingsStore';
import { useAuthStore } from '@/state/useAuth';
import { Check } from 'lucide-react-native';

export function ProfileScreen({ navigation }) {
  const teams = useTeamStore(s => s.teams);
  const activeTeam = useTeamStore(s => s.getActiveTeam());
  const setActiveTeam = useTeamStore(s => s.setActiveTeam);
  const deleteTeam = useTeamStore(s => s.deleteTeam);
  const addDraftTeam = useTeamStore(s => s.addDraftTeam);
  const language = useSettingsStore(s => s.language);
  const setLanguage = useSettingsStore(s => s.setLanguage);
  const isPro = useSettingsStore(s => s.isPro);
  const togglePro = useSettingsStore(s => s.togglePro);
  const logout = useAuthStore(s => s.logout);

  const handleAddLive = () => {
    navigation.navigate('TeamIdLogin');
  };

  return (
    <View className="flex-1">
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={['rgba(16,185,129,0.06)', 'transparent', colors.bg.primary]}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView className="flex-1">
        <View className="p-5">
        <Text className="text-text-primary text-2xl font-bold mb-4">
          Profile
        </Text>

        <Card className="mb-4">
          <Text className="text-text-secondary text-xs mb-3 uppercase">
            My Teams
          </Text>
          {teams.length === 0 && (
            <Text className="text-text-secondary text-[13px] mb-3">
              No teams yet. Connect your FPL Team ID or create a draft.
            </Text>
          )}
          {teams.map(team => (
            <View key={team.id} className={`flex-row items-center mb-3 p-3 rounded-lg border ${activeTeam?.id === team.id ? 'bg-accent-muted border-primary' : 'bg-surface border-border'}`}>
              <Pressable
                onPress={() => setActiveTeam(team.id)}
                className="flex-1"
              >
                <Text className={`text-sm font-semibold ${activeTeam?.id === team.id ? 'text-primary' : 'text-text-primary'}`}>
                  {String(team.name)}
                </Text>
                <Text className="text-text-secondary text-xs">
                  {team.isLive ? 'Live' : 'Draft'} • GW{team.currentGameweek}
                </Text>
              </Pressable>
              <Pressable onPress={() => deleteTeam(team.id)} className="ml-2">
                <Text className="text-status-danger text-xs">Delete</Text>
              </Pressable>
            </View>
          ))}
          <View className="flex-row gap-2">
            <Button title="+ Draft" onPress={() => addDraftTeam()} variant="secondary" className="flex-1" />
            <Button title="+ Live Team" onPress={handleAddLive} variant="secondary" className="flex-1" />
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="text-text-secondary text-xs mb-3 uppercase">
            Pro Demo Unlock
          </Text>
          <Pressable
            onPress={togglePro}
            className={`flex-row items-center justify-between p-3 rounded-lg bg-surface border ${isPro ? 'border-primary' : 'border-border'}`}
          >
            <Text className="text-text-primary text-sm font-semibold">
              {isPro ? 'Pro Active (Demo)' : 'Unlock Pro (Demo)'}
            </Text>
            <View className={`w-12 h-6 rounded-full p-0.5 ${isPro ? 'bg-primary' : 'bg-border'}`}>
              <View className={`w-5 h-5 rounded-full ${isPro ? 'bg-secondary self-end' : 'bg-text-secondary self-start'}`} />
            </View>
          </Pressable>
        </Card>

        <Card className="mb-4">
          <Text className="text-text-secondary text-xs mb-3 uppercase">
            Language
          </Text>
          <View className="flex-row gap-2">
            {['en', 'ar'].map(lang => {
              const isSelected = language === lang;
              return (
                <Pressable
                  key={lang}
                  onPress={() => setLanguage(lang)}
                  className={`flex-1 py-2.5 rounded-lg border items-center justify-center flex-row gap-1.5 ${isSelected ? 'bg-primary border-primary border-[1.5px]' : 'bg-surface border-border border-2'}`}
                >
                  {isSelected && <Check size={16} color={colors.text.onAccent} strokeWidth={2.5} />}
                  <Text className={`text-sm font-semibold ${isSelected ? 'text-text-on-accent' : 'text-text-primary'}`}>
                    {lang === 'en' ? 'English' : 'العربية'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="text-text-secondary text-xs mb-3 uppercase">
            Settings
          </Text>
          {['Notifications', 'Biometric', 'Data Source', 'About'].map(item => (
            <Pressable
              key={item}
              className="flex-row justify-between items-center py-3 border-b border-border"
            >
              <Text className="text-text-primary text-sm">{item}</Text>
              <Text className="text-text-secondary text-xs">{item === 'Notifications' ? 'On' : '—'}</Text>
            </Pressable>
          ))}
        </Card>

        <Button title="Log Out" onPress={logout} variant="danger" />
      </View>
    </ScrollView>
    </View>
  );
}

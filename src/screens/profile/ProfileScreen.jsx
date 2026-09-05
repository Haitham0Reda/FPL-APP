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
  const addLiveTeam = useTeamStore(s => s.addLiveTeam);
  const language = useSettingsStore(s => s.language);
  const setLanguage = useSettingsStore(s => s.setLanguage);
  const isPro = useSettingsStore(s => s.isPro);
  const togglePro = useSettingsStore(s => s.togglePro);
  const logout = useAuthStore(s => s.logout);

  const handleAddLive = () => {
    navigation.navigate('TeamIdLogin');
  };

  return (
    <View style={{ flex: 1 }}>
      <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={['rgba(16,185,129,0.06)', 'transparent', colors.bg.primary]}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 20 }}>
        <Text style={{ color: colors.text.primary, fontSize: 24, fontWeight: '700', marginBottom: 16 }}>
          Profile
        </Text>

        <Card style={{ padding: 16, marginBottom: 16 }}>
          <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 12, textTransform: 'uppercase' }}>
            My Teams
          </Text>
          {teams.length === 0 && (
            <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 12 }}>
              No teams yet. Connect your FPL Team ID or create a draft.
            </Text>
          )}
          {teams.map(team => (
            <View key={team.id} style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
              padding: 12,
              borderRadius: 8,
              backgroundColor: activeTeam?.id === team.id ? colors.accent.primaryMuted : colors.bg.surface,
              borderWidth: 1,
              borderColor: activeTeam?.id === team.id ? colors.accent.primary : colors.border.subtle,
            }}>
              <Pressable
                onPress={() => setActiveTeam(team.id)}
                style={{ flex: 1 }}
              >
                <Text style={{
                  color: activeTeam?.id === team.id ? colors.accent.primary : colors.text.primary,
                  fontSize: 14,
                  fontWeight: '600',
                }}>
                  {team.name}
                </Text>
                <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                  {team.isLive ? 'Live' : 'Draft'} • GW{team.currentGameweek}
                </Text>
              </Pressable>
              <Pressable onPress={() => deleteTeam(team.id)} style={{ marginLeft: 8 }}>
                <Text style={{ color: colors.status.danger, fontSize: 12 }}>Delete</Text>
              </Pressable>
            </View>
          ))}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button title="+ Draft" onPress={addDraftTeam} variant="secondary" style={{ flex: 1 }} />
            <Button title="+ Live Team" onPress={handleAddLive} variant="secondary" style={{ flex: 1 }} />
          </View>
        </Card>

        <Card style={{ padding: 16, marginBottom: 16 }}>
          <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 12, textTransform: 'uppercase' }}>
            Pro Demo Unlock
          </Text>
          <Pressable
            onPress={togglePro}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 12,
              borderRadius: 8,
              backgroundColor: colors.bg.surface,
              borderWidth: 1,
              borderColor: isPro ? colors.accent.primary : colors.border.subtle,
            }}
          >
            <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '600' }}>
              {isPro ? 'Pro Active (Demo)' : 'Unlock Pro (Demo)'}
            </Text>
            <View style={{
              width: 48,
              height: 24,
              borderRadius: 12,
              backgroundColor: isPro ? colors.accent.primary : colors.border.subtle,
              padding: 2,
            }}>
              <View style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: isPro ? colors.bg.primary : colors.text.secondary,
                alignSelf: isPro ? 'flex-end' : 'flex-start',
              }} />
            </View>
          </Pressable>
        </Card>

        <Card style={{ padding: 16, marginBottom: 16 }}>
          <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 12, textTransform: 'uppercase' }}>
            Language
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {['en', 'ar'].map(lang => {
              const isSelected = language === lang;
              return (
                <Pressable
                  key={lang}
                  onPress={() => setLanguage(lang)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: isSelected ? colors.accent.primary : colors.bg.surface,
                    borderWidth: isSelected ? 1.5 : 2,
                    borderColor: isSelected ? colors.accent.primary : colors.border.subtle,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: 6,
                  }}
                >
                  {isSelected && <Check size={16} color={colors.text.onAccent} strokeWidth={2.5} />}
                  <Text style={{
                    color: isSelected ? colors.text.onAccent : colors.text.primary,
                    fontSize: 14,
                    fontWeight: '600',
                  }}>
                    {lang === 'en' ? 'English' : 'العربية'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card style={{ padding: 16, marginBottom: 16 }}>
          <Text style={{ color: colors.text.secondary, fontSize: 12, marginBottom: 12, textTransform: 'uppercase' }}>
            Settings
          </Text>
          {['Notifications', 'Biometric', 'Data Source', 'About'].map(item => (
            <Pressable
              key={item}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomColor: colors.border.subtle,
                borderBottomWidth: 1,
              }}
            >
              <Text style={{ color: colors.text.primary, fontSize: 14 }}>{item}</Text>
              <Text style={{ color: colors.text.secondary, fontSize: 12 }}>{item === 'Notifications' ? 'On' : '—'}</Text>
            </Pressable>
          ))}
        </Card>

        <Button title="Log Out" onPress={logout} variant="danger" />
      </View>
    </ScrollView>
    </View>
  );
}

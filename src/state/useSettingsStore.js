/**
 * Settings store.
 *
 * Persists user preferences: language, Pro status, notification prefs.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const store = (set, get) => ({
  language: 'en',
  isPro: false,
  notifications: {
    enabled: true,
    deadlineReminder: true,
    priceChange: true,
    news: true,
  },

  setLanguage: (lang) => set({ language: lang }),
  togglePro: () => set({ isPro: !get().isPro }),
  setPro: (isPro) => set({ isPro }),
  updateNotifications: (updates) => set({
    notifications: { ...get().notifications, ...updates },
  }),
});

export const useSettingsStore = persist(store, {
  name: 'elite-fpl-settings',
  storage: createJSONStorage(() => AsyncStorage),
});

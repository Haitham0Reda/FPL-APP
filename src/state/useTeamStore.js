/**
 * Team management store.
 *
 * Holds all teams (live + drafts) and the active team selection.
 * Live teams are created from a real FPL Team ID via the API.
 * Draft teams start with an empty squad and £100.0m budget.
 *
 * Tier caps:
 *  - Free: 1 live team, 2 drafts
 *  - Pro: unlimited
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getEntry, getEntryPicks } from '@/data/fpl/client';
import { usePlayerStore } from './usePlayerStore';
import { useSettingsStore } from './useSettingsStore';

const DRAFT_BUDGET = 100.0;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function transformPick(pick, playersById) {
  const player = playersById[String(pick.element)];
  return {
    playerId: String(pick.element),
    isStarting: pick.position <= 11,
    benchOrder: pick.position > 11 ? pick.position - 11 : undefined,
    purchasePrice: player ? player.now_cost / 10 : 0,
  };
}

const store = (set, get) => ({
  teams: [],
  activeTeamId: null,

  getActiveTeam: () => {
    const state = get();
    return state.teams.find(t => t.id === state.activeTeamId) || null;
  },

  getLiveTeams: () => get().teams.filter(t => t.isLive),
  getDrafts: () => get().teams.filter(t => !t.isLive),

  canAddLiveTeam: () => {
    const settings = useSettingsStore.getState();
    if (settings.isPro) return true;
    return get().teams.filter(t => t.isLive).length === 0;
  },

  canAddDraft: () => {
    const settings = useSettingsStore.getState();
    if (settings.isPro) return true;
    return get().teams.filter(t => !t.isLive).length < 2;
  },

  addLiveTeam: async (fplTeamId) => {
    if (!get().canAddLiveTeam()) {
      throw new Error('Free tier allows only 1 live team. Upgrade to Pro for more.');
    }

    const playerStore = usePlayerStore.getState();
    if (!playerStore.bootstrapData) {
      throw new Error('Bootstrap data not loaded. Please wait or check your connection.');
    }

    const currentEvent = playerStore.events.find(e => e.is_current);
    const eventId = currentEvent?.id || 1;

    const [entry, picksResponse] = await Promise.all([
      getEntry(fplTeamId),
      getEntryPicks(fplTeamId, eventId),
    ]);

    const playersById = playerStore.playersById;
    const squad = (picksResponse.picks || []).map(p => transformPick(p, playersById));
    const captain = picksResponse.picks?.find(p => p.is_captain);
    const viceCaptain = picksResponse.picks?.find(p => p.is_vice_captain);

    const team = {
      id: generateId(),
      fplTeamId,
      name: entry.name || `Team ${fplTeamId}`,
      isLive: true,
      overallRank: entry.summary_overall_rank,
      totalPoints: entry.summary_overall_points,
      value: (picksResponse.entry_history?.value || 100) / 10,
      bank: (picksResponse.entry_history?.bank || 0) / 10,
      currentGameweek: entry.current_event || 1,
      squad,
      captainId: captain ? String(captain.element) : null,
      viceCaptainId: viceCaptain ? String(viceCaptain.element) : null,
      formation: '4-4-2',
      chipsUsed: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set(state => ({
      teams: [...state.teams, team],
      activeTeamId: team.id,
    }));

    return team;
  },

  addDraftTeam: (name = 'New Draft') => {
    if (!get().canAddDraft()) {
      throw new Error('Free tier allows only 2 drafts. Upgrade to Pro for more.');
    }

    const team = {
      id: generateId(),
      fplTeamId: null,
      name,
      isLive: false,
      overallRank: null,
      totalPoints: 0,
      value: 0,
      bank: DRAFT_BUDGET,
      currentGameweek: 1,
      squad: [],
      captainId: null,
      viceCaptainId: null,
      formation: '4-4-2',
      chipsUsed: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set(state => ({
      teams: [...state.teams, team],
      activeTeamId: team.id,
    }));

    return team;
  },

  renameTeam: (teamId, name) => {
    get().updateTeam(teamId, { name });
  },

  deleteTeam: (teamId) => {
    set(state => {
      const newTeams = state.teams.filter(t => t.id !== teamId);
      return {
        teams: newTeams,
        activeTeamId: state.activeTeamId === teamId
          ? (newTeams[0]?.id || null)
          : state.activeTeamId,
      };
    });
  },

  duplicateTeam: (teamId) => {
    const team = get().teams.find(t => t.id === teamId);
    if (!team) return null;

    if (!get().canAddDraft()) {
      throw new Error('Free tier allows only 2 drafts. Upgrade to Pro for more.');
    }

    const newTeam = {
      ...team,
      id: generateId(),
      name: `${team.name} (Copy)`,
      isLive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set(state => ({
      teams: [...state.teams, newTeam],
      activeTeamId: newTeam.id,
    }));

    return newTeam;
  },

  forkDraft: (teamId) => {
    const team = get().teams.find(t => t.id === teamId);
    if (!team) return null;

    if (!get().canAddDraft()) {
      throw new Error('Free tier allows only 2 drafts. Upgrade to Pro for more.');
    }

    const newTeam = {
      ...team,
      id: generateId(),
      name: `${team.name} (Fork)`,
      isLive: false,
      forkedFromLive: team.isLive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set(state => ({
      teams: [...state.teams, newTeam],
      activeTeamId: newTeam.id,
    }));

    return newTeam;
  },

  promoteDraftToLive: (draftId) => {
    const settings = useSettingsStore.getState();
    if (!settings.isPro && get().getLiveTeams().length >= 1) {
      throw new Error('Free tier allows only 1 live team. Upgrade to Pro to promote drafts.');
    }

    const draft = get().teams.find(t => t.id === draftId);
    if (!draft || draft.isLive) return null;

    const liveTeam = {
      ...draft,
      isLive: true,
      updatedAt: new Date().toISOString(),
    };

    set(state => ({
      teams: state.teams.map(t => t.id === draftId ? liveTeam : t),
      activeTeamId: liveTeam.id,
    }));

    return liveTeam;
  },

  setActiveTeam: (teamId) => {
    set({ activeTeamId: teamId });
  },

  updateTeam: (teamId, updates) => {
    set(state => ({
      teams: state.teams.map(t =>
        t.id === teamId
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t
      ),
    }));
  },

  addPlayerToSquad: (teamId, playerId) => {
    const playerStore = usePlayerStore.getState();
    const team = get().teams.find(t => t.id === teamId);
    if (!team) return;

    const player = playerStore.playersById[playerId];
    if (!player) return;

    const currentSquadSize = team.squad.length;
    if (currentSquadSize >= 15) return;

    const squad = [...team.squad, {
      playerId,
      isStarting: currentSquadSize < 11,
      benchOrder: currentSquadSize >= 11 ? currentSquadSize - 10 : undefined,
      purchasePrice: player.now_cost / 10,
    }];

    get().updateTeam(teamId, { squad });
  },

  removePlayerFromSquad: (teamId, playerId) => {
    const team = get().teams.find(t => t.id === teamId);
    if (!team) return;

    const squad = team.squad.filter(s => s.playerId !== playerId);
    const starting = squad.filter(s => s.isStarting);
    const bench = squad.filter(s => !s.isStarting);

    if (starting.length < 11) {
      const moved = bench.shift();
      if (moved) {
        moved.isStarting = true;
        moved.benchOrder = undefined;
        starting.push(moved);
      }
    }

    const reordered = [
      ...starting.sort((a, b) => (a.benchOrder || 0) - (b.benchOrder || 0)),
      ...bench.map((b, i) => ({ ...b, benchOrder: i + 1 })),
    ];

    get().updateTeam(teamId, { squad: reordered });
  },
});

export const useTeamStore = persist(store, {
  name: 'elite-fpl-teams',
  storage: createJSONStorage(() => AsyncStorage),
});

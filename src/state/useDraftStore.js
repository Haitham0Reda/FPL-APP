/**
 * Draft store.
 *
 * Holds draft-specific state per team: squad, formation, captain, vice,
 * bench order, auto-sub ordering, and formation legality checks.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VALID_FORMATIONS = {
  '3-4-3': { gk: 1, def: 3, mid: 4, fwd: 3 },
  '3-5-2': { gk: 1, def: 3, mid: 5, fwd: 2 },
  '4-4-2': { gk: 1, def: 4, mid: 4, fwd: 2 },
  '4-3-3': { gk: 1, def: 4, mid: 3, fwd: 3 },
  '5-3-2': { gk: 1, def: 5, mid: 3, fwd: 2 },
  '5-4-1': { gk: 1, def: 5, mid: 4, fwd: 1 },
  '4-5-1': { gk: 1, def: 4, mid: 5, fwd: 1 },
  '5-2-3': { gk: 1, def: 5, mid: 2, fwd: 3 },
};

function mapElementTypeToPosition(elementType) {
  switch (elementType) {
    case 1: return 'GK';
    case 2: return 'DEF';
    case 3: return 'MID';
    case 4: return 'FWD';
    default: return 'MID';
  }
}

const store = (set, get) => ({
  drafts: {},
  selectedDraftId: null,

  getSelectedDraft: () => {
    const state = get();
    if (!state.selectedDraftId) return null;
    return state.drafts[state.selectedDraftId] || null;
  },

  createDraft: (teamId, name = 'New Draft') => {
    const draftId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const draft = {
      id: draftId,
      teamId,
      name,
      squad: [],
      formation: '4-4-2',
      captainId: null,
      viceCaptainId: null,
      benchOrder: [],
      autoSubEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set(state => ({
      drafts: { ...state.drafts, [draftId]: draft },
      selectedDraftId: draftId,
    }));

    return draft;
  },

  selectDraft: (draftId) => {
    set({ selectedDraftId: draftId });
  },

  deleteDraft: (draftId) => {
    set(state => {
      const newDrafts = { ...state.drafts };
      delete newDrafts[draftId];
      return {
        drafts: newDrafts,
        selectedDraftId: state.selectedDraftId === draftId
          ? Object.keys(newDrafts)[0] || null
          : state.selectedDraftId,
      };
    });
  },

  renameDraft: (draftId, name) => {
    get().updateDraft(draftId, { name });
  },

  updateDraft: (draftId, updates) => {
    set(state => ({
      drafts: {
        ...state.drafts,
        [draftId]: {
          ...state.drafts[draftId],
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      },
    }));
  },

  setFormation: (draftId, formation) => {
    if (!VALID_FORMATIONS[formation]) return;
    get().updateDraft(draftId, { formation });
  },

  setCaptain: (draftId, playerId) => {
    const draft = get().drafts[draftId];
    if (!draft) return;
    const updated = {
      ...draft,
      captainId: playerId,
      updatedAt: new Date().toISOString(),
    };
    set(state => ({
      drafts: { ...state.drafts, [draftId]: updated },
    }));
  },

  setViceCaptain: (draftId, playerId) => {
    const draft = get().drafts[draftId];
    if (!draft) return;
    const updated = {
      ...draft,
      viceCaptainId: playerId,
      updatedAt: new Date().toISOString(),
    };
    set(state => ({
      drafts: { ...state.drafts, [draftId]: updated },
    }));
  },

  addPlayerToDraft: (draftId, playerId, elementType) => {
    const draft = get().drafts[draftId];
    if (!draft) return;
    if (draft.squad.length >= 15) return;
    if (draft.squad.some(s => s.playerId === playerId)) return;

    const position = mapElementTypeToPosition(elementType);
    const isStarting = draft.squad.filter(s => s.isStarting).length < 11;

    const newPlayer = {
      playerId,
      position,
      isStarting,
      benchOrder: isStarting ? undefined : draft.squad.filter(s => !s.isStarting).length + 1,
    };

    const newSquad = [...draft.squad, newPlayer];
    const validFormation = get().findValidFormation(newSquad);

    get().updateDraft(draftId, {
      squad: newSquad,
      formation: validFormation || draft.formation,
    });
  },

  removePlayerFromDraft: (draftId, playerId) => {
    const draft = get().drafts[draftId];
    if (!draft) return;

    const newSquad = draft.squad.filter(s => s.playerId !== playerId);
    const starting = newSquad.filter(s => s.isStarting);
    const bench = newSquad.filter(s => !s.isStarting);

    if (starting.length < 11 && bench.length > 0) {
      const moved = bench.shift();
      if (moved) {
        moved.isStarting = true;
        moved.benchOrder = undefined;
        starting.push(moved);
      }
    }

    const reordered = [
      ...starting,
      ...bench.map((b, i) => ({ ...b, benchOrder: i + 1 })),
    ];

    const validFormation = get().findValidFormation(reordered);

    get().updateDraft(draftId, {
      squad: reordered,
      formation: validFormation || draft.formation,
    });
  },

  togglePlayerStarting: (draftId, playerId) => {
    const draft = get().drafts[draftId];
    if (!draft) return;

    const player = draft.squad.find(s => s.playerId === playerId);
    if (!player) return;

    if (player.isStarting) {
      const starting = draft.squad.filter(s => s.isStarting && s.playerId !== playerId);
      const bench = draft.squad.filter(s => !s.isStarting);
      const newBench = [...bench, { ...player, isStarting: false, benchOrder: bench.length + 1 }];

      const reordered = [
        ...starting,
        ...newBench.sort((a, b) => (a.benchOrder || 0) - (b.benchOrder || 0)),
      ];

      get().updateDraft(draftId, { squad: reordered });
    } else {
      const starting = draft.squad.filter(s => s.isStarting);
      if (starting.length >= 11) return;

      const newSquad = draft.squad.map(s =>
        s.playerId === playerId ? { ...s, isStarting: true, benchOrder: undefined } : s
      );

      const validFormation = get().findValidFormation(newSquad);
      get().updateDraft(draftId, {
        squad: newSquad,
        formation: validFormation || draft.formation,
      });
    }
  },

  updateBenchOrder: (draftId, playerId, newOrder) => {
    const draft = get().drafts[draftId];
    if (!draft) return;

    const bench = draft.squad
      .filter(s => !s.isStarting)
      .sort((a, b) => (a.benchOrder || 0) - (b.benchOrder || 0));

    const playerIndex = bench.findIndex(s => s.playerId === playerId);
    if (playerIndex === -1) return;

    const [moved] = bench.splice(playerIndex, 1);
    bench.splice(newOrder - 1, 0, moved);

    const reorderedBench = bench.map((b, i) => ({ ...b, benchOrder: i + 1 }));
    const starting = draft.squad.filter(s => s.isStarting);

    const newSquad = [...starting, ...reorderedBench];
    get().updateDraft(draftId, { squad: newSquad });
  },

  findValidFormation: (squad) => {
    const counts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
    squad.forEach(s => {
      if (counts[s.position] !== undefined) counts[s.position]++;
    });

    for (const [formation, req] of Object.entries(VALID_FORMATIONS)) {
      if (
        counts.GK === req.gk &&
        counts.DEF === req.def &&
        counts.MID === req.mid &&
        counts.FWD === req.fwd
      ) {
        return formation;
      }
    }
    return null;
  },

  isFormationValid: (squad, formation) => {
    if (!VALID_FORMATIONS[formation]) return false;
    const counts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
    squad.forEach(s => {
      if (counts[s.position] !== undefined) counts[s.position]++;
    });
    const req = VALID_FORMATIONS[formation];
    return (
      counts.GK === req.gk &&
      counts.DEF === req.def &&
      counts.MID === req.mid &&
      counts.FWD === req.fwd
    );
  },

  getAutoSubSuggestions: (draftId) => {
    const draft = get().drafts[draftId];
    if (!draft || !draft.autoSubEnabled) return [];

    const bench = draft.squad
      .filter(s => !s.isStarting)
      .sort((a, b) => (a.benchOrder || 0) - (b.benchOrder || 0));

    return bench.slice(0, 3).map((player, index) => ({
      ...player,
      autoSubPriority: index + 1,
    }));
  },
});

const useDraftStore = create(persist(store, {
  name: 'elite-fpl-drafts',
  storage: createJSONStorage(() => AsyncStorage),
  version: 2,
  migrate: (persistedState, version) => {
    if (version < 2) return {};
    return persistedState;
  },
}));

export { useDraftStore };

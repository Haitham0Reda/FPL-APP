/**
 * Captain engine — explainable captain scoring with Balanced vs Differential mode.
 *
 * Score = fixture (25%) + xPts (30%) + xGI (20%) + minutes (15%) + form (10%)
 * Differential mode down-weights/negates ownership.
 */

import { calculateXPts } from './xPts';

export const DEFAULT_WEIGHTS = {
  fixtureDifficulty: 0.25,
  formWeight: 0.1,
  xPtsWeight: 0.30,
  xGIWeight: 0.20,
  minutesWeight: 0.15,
  ownershipFactor: 0.10,
};

export function rankCaptains(candidates, options = {}) {
  const weights = { ...DEFAULT_WEIGHTS, ...(options.weights || {}) };
  const isDifferential = options.differential === true;

  return candidates
    .map(({ player, projection }) => {
      const xPtsResult = projection.xPtsResult || calculateXPts(player, projection.fixture, {
        startProbability: projection.startProbability,
        cleanSheetProbability: projection.cleanSheetProbability,
        goalProbability: projection.goalProbability,
        assistProbability: projection.assistProbability,
        bonusProbability: projection.bonusProbability,
        minutesProbability: projection.minutesProbability,
      });

      const factors = [];

      // Fixture factor
      const fixtureDiff = projection.fixture
        ? (3 - (projection.fixture.team_h_difficulty || 3)) * 0.5
        : 0;
      factors.push({
        label: 'Fixture',
        contribution: fixtureDiff * weights.fixtureDifficulty,
        detail: projection.fixture
          ? `FDR ${projection.isHome ? projection.fixture.team_h_difficulty : projection.fixture.team_a_difficulty}`
          : 'No fixture data',
      });

      // xPts factor
      factors.push({
        label: 'xPts',
        contribution: (xPtsResult.total / 10) * weights.xPtsWeight * 10,
        detail: xPtsResult.total.toFixed(1),
      });

      // xGI factor
      const xGI = player.xGI || 0;
      factors.push({
        label: 'xGI',
        contribution: (xGI / 15) * weights.xGIWeight * 10,
        detail: xGI.toFixed(2),
      });

      // Minutes factor
      const minutesRisk = player.minutesRisk === 'none' ? 1 : player.minutesRisk === 'doubtful' ? 0.4 : 0.1;
      factors.push({
        label: 'Minutes',
        contribution: minutesRisk * weights.minutesWeight * 10,
        detail: player.minutesRisk || 'likely',
      });

      // Form factor
      const form = (player.form || 0) / 10;
      factors.push({
        label: 'Form',
        contribution: form * weights.formWeight * 10,
        detail: form.toFixed(1),
      });

      // Ownership factor (negative for differential mode)
      const ownership = parseFloat(player.selected_by_percent) || 0;
      const ownershipContrib = isDifferential
        ? -(ownership / 100) * weights.ownershipFactor * 10
        : (ownership / 100) * weights.ownershipFactor * 10;
      factors.push({
        label: 'Ownership',
        contribution: ownershipContrib,
        detail: `${ownership.toFixed(1)}%`,
      });

      const score = factors.reduce((sum, f) => sum + f.contribution, 0);
      const topFactors = factors
        .slice()
        .sort((a, b) => b.contribution - a.contribution)
        .slice(0, 3);

      return {
        playerId: String(player.id),
        score,
        xpPts: xPtsResult.total,
        factors: topFactors,
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function getCaptainWhy(candidate) {
  if (!candidate || !candidate.factors) return '';
  return candidate.factors.map(f => `${f.label}: ${f.detail}`).join(' · ');
}

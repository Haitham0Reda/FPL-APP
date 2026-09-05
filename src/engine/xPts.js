/**
 * xPts engine — explains each projected point contribution.
 *
 * Returns an array of factor objects so the UI can render explainable
 * breakdowns (PRD §4.6). Each factor has a label, contribution, and detail.
 */

export function calculateXPts(player, fixture, options = {}) {
  const isHome = options.isHome !== false;
  const base = 1.0;

  const factors = [];

  // 1. Appearance points (1 point for playing, ~0.9 if likely to start)
  const startProb = options.startProbability ?? 0.9;
  const appearancePts = base * startProb;
  factors.push({
    label: 'Appearance',
    contribution: appearancePts,
    detail: `${(startProb * 100).toFixed(0)}% start`,
  });

  // 2. Clean sheet probability (GK/DEF only)
  let cleanSheetPts = 0;
  if (['GK', 'DEF'].includes(player.position)) {
    const csProb = options.cleanSheetProbability ?? 0.25;
    cleanSheetPts = csProb * (player.position === 'GK' ? 4 : 3);
    factors.push({
      label: 'Clean sheet',
      contribution: cleanSheetPts,
      detail: `${(csProb * 100).toFixed(0)}% chance`,
    });
  }

  // 3. Goal probability
  const goalProb = options.goalProbability ?? (player.xG || 0) / 6;
  const goalPts = goalProb * (player.position === 'FWD' ? 4 : player.position === 'MID' ? 5 : 6);
  factors.push({
    label: 'Goal',
    contribution: goalPts,
    detail: `xG ${(player.xG || 0).toFixed(2)}`,
  });

  // 4. Assist probability
  const assistProb = options.assistProbability ?? (player.xA || 0) / 6;
  const assistPts = assistProb * 3;
  factors.push({
    label: 'Assist',
    contribution: assistPts,
    detail: `xA ${(player.xA || 0).toFixed(2)}`,
  });

  // 5. Bonus probability
  const bonusPts = options.bonusProbability ?? 0.3;
  factors.push({
    label: 'Bonus',
    contribution: bonusPts,
    detail: 'BPS potential',
  });

  // 6. Penalty probability (MID/FWD only, simplified)
  let penaltyPts = 0;
  if (['MID', 'FWD'].includes(player.position)) {
    penaltyPts = options.penaltyProbability ?? 0.05;
    factors.push({
      label: 'Penalty',
      contribution: penaltyPts,
      detail: 'PK taker',
    });
  }

  // 7. Fixture adjustment
  let fixtureAdj = 0;
  if (fixture) {
    const fdr = isHome ? fixture.team_h_difficulty : fixture.team_a_difficulty;
    fixtureAdj = (3 - fdr) * 0.2;
    factors.push({
      label: 'Fixture',
      contribution: fixtureAdj,
      detail: `FDR ${fdr}`,
    });
  }

  // 8. Minutes probability
  const minutesProb = options.minutesProbability ?? (player.minutesRisk === 'none' ? 0.95 : 0.5);
  const minutesAdj = minutesProb * 0.2;
  factors.push({
    label: 'Minutes',
    contribution: minutesAdj,
    detail: player.minutesRisk || 'likely',
  });

  // 9. Position adjustment
  const posAdj = options.positionAdjustment ?? 0;
  if (posAdj !== 0) {
    factors.push({
      label: 'Position',
      contribution: posAdj,
      detail: player.position,
    });
  }

  const total = factors.reduce((sum, f) => sum + f.contribution, 0);

  return {
    total: Math.round(total * 10) / 10,
    factors,
  };
}

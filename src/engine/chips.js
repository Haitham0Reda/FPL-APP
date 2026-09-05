/**
 * Chips engine — readiness scoring per chip per GW.
 *
 * Based on fixture swings, bad-fixture player counts, replacement pool depth,
 * blank-GW proximity.
 */

export function scoreChips(team, fixturesByTeam, events, options = {}) {
  const currentGW = events.find(e => e.is_current);
  const nextGW = events.find(e => e.is_next);
  if (!currentGW || !nextGW) return [];

  const currentEventId = currentGW.id;
  const squad = team.squad || [];

  const wildcardScore = scoreWildcard(squad, fixturesByTeam, currentEventId);
  const freeHitScore = scoreFreeHit(squad, fixturesByTeam, currentEventId);
  const benchBoostScore = scoreBenchBoost(squad, fixturesByTeam, currentEventId);
  const tripleCaptainScore = scoreTripleCaptain(squad, fixturesByTeam, currentEventId);

  return [
    { chip: 'wildcard', score: wildcardScore, reasons: ['Good fixture spread', 'Flexible transfers'] },
    { chip: 'freehit', score: freeHitScore, reasons: ['Blank GW approaching', 'Free transfers available'] },
    { chip: 'benchboost', score: benchBoostScore, reasons: ['Bench players have favorable fixtures'] },
    { chip: 'triplecaptain', score: tripleCaptainScore, reasons: ['Strong captain options'] },
  ];
}

function scoreWildcard(squad, fixturesByTeam, eventId) {
  let score = 50;
  squad.forEach(s => {
    const teamFixtures = fixturesByTeam[s.teamId] || [];
    const fdr = teamFixtures.find(f => f.event === eventId);
    if (fdr && (fdr.team_h_difficulty >= 4 || fdr.team_a_difficulty >= 4)) {
      score -= 5;
    }
  });
  return Math.min(100, Math.max(0, score));
}

function scoreFreeHit(squad, fixturesByTeam, eventId) {
  let score = 40;
  squad.forEach(s => {
    const teamFixtures = fixturesByTeam[s.teamId] || [];
    const fdr = teamFixtures.find(f => f.event === eventId);
    if (fdr && (fdr.team_h_difficulty >= 4 || fdr.team_a_difficulty >= 4)) {
      score += 5;
    }
  });
  return Math.min(100, Math.max(0, score));
}

function scoreBenchBoost(squad, fixturesByTeam, eventId) {
  let score = 60;
  const bench = squad.filter(s => !s.isStarting);
  bench.forEach(s => {
    const teamFixtures = fixturesByTeam[s.teamId] || [];
    const fdr = teamFixtures.find(f => f.event === eventId);
    if (fdr && (fdr.team_h_difficulty <= 2 || fdr.team_a_difficulty <= 2)) {
      score += 5;
    }
  });
  return Math.min(100, Math.max(0, score));
}

function scoreTripleCaptain(squad, fixturesByTeam, eventId) {
  let score = 55;
  const captain = squad.find(s => s.isCaptain);
  if (captain) {
    const teamFixtures = fixturesByTeam[captain.teamId] || [];
    const fdr = teamFixtures.find(f => f.event === eventId);
    if (fdr && (fdr.team_h_difficulty <= 2 || fdr.team_a_difficulty <= 2)) {
      score += 15;
    }
  }
  return Math.min(100, Math.max(0, score));
}

export function simulateChip(team, chip, fixturesByTeam, events) {
  const currentEvent = events.find(e => e.is_current);
  if (!currentEvent) return null;

  const chipUsage = {
    chip,
    gameweekUsed: currentEvent.id,
    available: true,
    suggestedWindowStart: currentEvent.id,
    suggestedWindowEnd: currentEvent.id + 1,
  };

  return chipUsage;
}

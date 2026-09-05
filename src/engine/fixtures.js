/**
 * Fixtures engine — FDR aggregation, blank/double-GW detection,
 * swing detection across a horizon.
 */

export function getTeamFDR(teamId, fixturesByTeam, horizon = 5) {
  const teamFixtures = fixturesByTeam[String(teamId)] || [];
  const upcoming = teamFixtures
    .filter(f => !f.finished)
    .sort((a, b) => (a.event || 0) - (b.event || 0))
    .slice(0, horizon);

  const avgFdr = upcoming.length > 0
    ? upcoming.reduce((sum, f) => {
        const fdr = f.team_h === Number(teamId) ? f.team_h_difficulty : f.team_a_difficulty;
        return sum + (fdr || 3);
      }, 0) / upcoming.length
    : 3;

  return {
    avgFdr: Math.round(avgFdr * 10) / 10,
    fixtures: upcoming,
    blankCount: upcoming.filter(f => f.is_blank).length,
    doubleCount: upcoming.filter(f => f.is_double).length,
  };
}

export function detectSwings(fixturesByGameweek, threshold = 2) {
  const swings = [];

  Object.entries(fixturesByGameweek).forEach(([gw, fixtures]) => {
    const easy = fixtures.filter(f => f.team_h_difficulty <= 2 || f.team_a_difficulty <= 2);
    const hard = fixtures.filter(f => f.team_h_difficulty >= 4 || f.team_a_difficulty >= 4);
    const blanks = fixtures.filter(f => f.is_blank);
    const doubles = fixtures.filter(f => f.is_double);

    if (easy.length > threshold || hard.length > threshold || blanks.length > 0 || doubles.length > 0) {
      swings.push({
        gw: Number(gw),
        easy: easy.length,
        hard: hard.length,
        blanks: blanks.length,
        doubles: doubles.length,
      });
    }
  });

  return swings.sort((a, b) => a.gw - b.gw);
}

export function getFixtureSwing(fixture, teamId) {
  const isHome = fixture.team_h === Number(teamId);
  const fdr = isHome ? fixture.team_h_difficulty : fixture.team_a_difficulty;

  if (fdr <= 2) return { swing: 'easy', label: 'Easy', color: '#10B981' };
  if (fdr >= 4) return { swing: 'hard', label: 'Hard', color: '#EF4444' };
  return { swing: 'neutral', label: 'Neutral', color: '#94A3B8' };
}

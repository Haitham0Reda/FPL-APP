/**
 * xPts prediction service — Phase 2 weighted-factor version.
 *
 * The PRD §9.2 directive is to start transparent: this pure function
 * combines fixture difficulty, form, underlying stats, minutes risk,
 * and home/away. Once we have a season of historical accuracy data,
 * we layer a learned model on top (Phase 3).
 */

/** Returns xPts projected for one (player, fixture) pair. */
export const projectXpts = ({
  player,
  fixture,
  isHome,
  modelVersion = "v1-weighted"
}) => {
  // Coarse heuristic weights — tuned by hand until the ML layer lands.
  const w = {
    fixture: 0.3,
    form: 0.3,
    underlying: 0.25,
    minutes: 0.15
  };
  const fixtureDifficulty = fixture ? (isHome ? fixture.homeFdr : fixture.awayFdr) / 5 : 0.5;
  const formWeight = clamp01(player.form / 8); // 8 pts/game ≈ elite ceiling
  const underlyingStatsWeight = clamp01(player.xGI / 15); // 15 xGI = elite

  const minutesPenalty = player.minutesRisk === "injured" || player.minutesRisk === "suspended" ? 0 : player.minutesRisk === "doubtful" ? 0.5 : player.minutesRisk === "rotation" ? 0.85 : 1.0;

  // Difficulty is "lower is harder for attacker" — invert so bigger = better.
  const fixtureFit = 1 - fixtureDifficulty;
  const raw = w.fixture * fixtureFit + w.form * formWeight + w.underlying * underlyingStatsWeight;
  const xpPts = round1(raw * 6 * minutesPenalty); // 0–6 raw → 0–~6 pts
  const startProbability = minutesPenalty;
  return {
    playerId: player.id,
    gameweek: fixture?.gameweek ?? 0,
    xPts: player.position === "GK" || player.position === "DEF" ? xpPts * 0.9 : xpPts,
    startProbability,
    modelVersion,
    factors: {
      fixtureDifficulty: round2(fixtureFit),
      formWeight: round2(formWeight),
      underlyingStatsWeight: round2(underlyingStatsWeight),
      minutesRisk: round2(1 - minutesPenalty)
    }
  };
};
const clamp01 = n => Math.max(0, Math.min(1, n));
const round1 = n => Math.round(n * 10) / 10;
const round2 = n => Math.round(n * 100) / 100;
/**
 * Transfer solver — ranked sell→buy suggestions over a horizon.
 *
 * Returns suggestions with gain, cost, net-after-hit, and short "why"
 * bullet reasons.
 */

import { calculateXPts } from './xPts';

export function solveTransfers(squad, playersById, fixturesByTeam, options = {}) {
  const horizon = options.horizon || 3;
  const hit = options.hit || -4;
  const maxTransfers = options.maxTransfers || 2;

  const suggestions = [];

  squad.forEach(squadPlayer => {
    const sellPlayer = playersById[squadPlayer.playerId];
    if (!sellPlayer) return;

    const candidates = Object.values(playersById)
      .filter(p => {
        if (String(p.id) === squadPlayer.playerId) return false;
        if (squad.some(s => s.playerId === String(p.id))) return false;
        return p.position === sellPlayer.position && p.status === 'a';
      })
      .slice(0, 10);

    candidates.forEach(buyPlayer => {
      const priceDiff = (buyPlayer.now_cost - sellPlayer.now_cost) / 10;
      const sellXpts = calculateXPts(sellPlayer, null, { startProbability: 0.9 }).total;
      const buyXpts = calculateXPts(buyPlayer, null, { startProbability: 0.9 }).total;

      const projectedGain = (buyXpts - sellXpts) * horizon;
      const netAfterHit = projectedGain + hit;

      if (netAfterHit <= 0) return;

      const reasons = [];
      if (buyXpts > sellXpts) reasons.push('Higher xPts');
      if (buyPlayer.xGI > sellPlayer.xGI) reasons.push('Higher xGI');
      if ((buyPlayer.form || 0) > (sellPlayer.form || 0)) reasons.push('Stronger form');
      if (buyPlayer.minutesRisk === 'none' && sellPlayer.minutesRisk !== 'none') reasons.push('Safer minutes');
      if (reasons.length === 0) reasons.push('Better value');

      suggestions.push({
        sellId: String(sellPlayer.id),
        buyId: String(buyPlayer.id),
        sellName: sellPlayer.web_name,
        buyName: buyPlayer.web_name,
        projectedGain: Math.round(projectedGain * 10) / 10,
        cost: Math.round(priceDiff * 10) / 10,
        netAfterHit: Math.round(netAfterHit * 10) / 10,
        reasons: reasons.slice(0, 3),
      });
    });
  });

  suggestions.sort((a, b) => b.netAfterHit - a.netAfterHit);

  return suggestions.slice(0, maxTransfers);
}

export function getTransferWhy(suggestion) {
  if (!suggestion || !suggestion.reasons) return '';
  return suggestion.reasons.join(' · ');
}

/**
 * src/utils/players.js
 *
 * Shared helpers for raw FPL player ("element") objects. The FPL API only
 * gives a numeric `element_type` (1=GK, 2=DEF, 3=MID, 4=FWD) — there is no
 * `position` string on the raw payload, so anything that wants to group or
 * label players by position needs to derive it via this map.
 */

export const POSITION_BY_ELEMENT_TYPE = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };

export function getPlayerPosition(player) {
  return POSITION_BY_ELEMENT_TYPE[player?.element_type] || 'MID';
}

/**
 * Recommendation engine — explainable scorer shared by Captain / Transfers /
 * Chips tabs (PRD §4.6).
 *
 * Phase 2 ships a transparent weighted-factor model:
 *   score = w1·fixtureDifficulty
 *         + w2·formWeight
 *         + w3·underlyingStatsWeight
 *         + w4·(1 - minutesRiskPenalty)
 *         + w5·priceAdjustedValue
 *         + w6·ownershipFactor   (negative for differential mode)
 *
 * Never ship a black-box score alone — each recommendation surfaces
 * its top contributing factors in the UI.
 */
import type { Player, XPtsProjection } from "../../types/domain";

export interface CaptainCandidate {
  playerId: string;
  score: number;
  xpPts: number;
  /** Top 2–3 contributing factors — surfaced in the Captain tab UI. */
  factors: {
    label: string;
    contribution: number;
    detail: string;
  }[];
}

export interface RecommendationWeights {
  fixtureDifficulty: number;
  formWeight: number;
  underlyingStatsWeight: number;
  minutesRisk: number;
  priceAdjustedValue: number;
  ownershipFactor: number;
}

export const DEFAULT_WEIGHTS: RecommendationWeights = {
  fixtureDifficulty: 0.25,
  formWeight: 0.2,
  underlyingStatsWeight: 0.2,
  minutesRisk: 0.15,
  priceAdjustedValue: 0.1,
  ownershipFactor: 0.1,
};

const minutesRiskPenalty = (risk: Player["minutesRisk"]): number => {
  switch (risk) {
    case "injured":
    case "suspended":
      return 1.0;
    case "doubtful":
      return 0.6;
    case "rotation":
      return 0.25;
    case "none":
    default:
      return 0;
  }
};

/**
 * Rank captain candidates. Pure function — no I/O — so it's trivially
 * unit-testable and the solver (Phase 2) can call it inside its search.
 */
export const rankCaptains = (
  candidates: { player: Player; projection: XPtsProjection }[],
  options: {
    differential?: boolean;
    weights?: Partial<RecommendationWeights>;
  } = {},
): CaptainCandidate[] => {
  const w: RecommendationWeights = {
    ...DEFAULT_WEIGHTS,
    ...(options.weights ?? {}),
  };

  return candidates
    .map(({ player, projection }) => {
      const factors = [
        {
          label: "Fixture",
          contribution:
            w.fixtureDifficulty * projection.factors.fixtureDifficulty,
          detail: `Difficulty ${projection.factors.fixtureDifficulty.toFixed(2)}`,
        },
        {
          label: "Form",
          contribution: w.formWeight * projection.factors.formWeight,
          detail: `Weight ${projection.factors.formWeight.toFixed(2)}`,
        },
        {
          label: "Underlying stats",
          contribution:
            w.underlyingStatsWeight * projection.factors.underlyingStatsWeight,
          detail: `xGI ${player.xGI.toFixed(2)}`,
        },
        {
          label: "Minutes risk",
          contribution:
            w.minutesRisk * (1 - minutesRiskPenalty(player.minutesRisk)),
          detail: player.minutesRisk,
        },
      ];

      const ownershipAdj = options.differential
        ? -player.ownershipPct / 100
        : 0;
      const score =
        factors.reduce((s, f) => s + f.contribution, 0) + ownershipAdj;

      const top = factors
        .slice()
        .sort((a, b) => b.contribution - a.contribution)
        .slice(0, 3);

      return {
        playerId: player.id,
        score,
        xpPts: projection.xPts,
        factors: top,
      };
    })
    .sort((a, b) => b.score - a.score);
};

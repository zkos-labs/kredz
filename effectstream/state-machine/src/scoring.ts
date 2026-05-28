// kredz.xyz — EffectStream State Machine: Scoring Engine
//
// State transition functions that compute the three-layer KREDZ Score (0-1000).
// Replaces the Node.js + Python XGBoost backend polling loop.
//
// The state machine receives ordered events from EffectStream's Sync Service
// (NTP main clock + parallel chain protocols), aggregates them across all
// 5 networks, and computes scores deterministically.

interface ScoreState {
  did: string;
  tier: 0 | 1 | 2;
  layer1Score: number;  // on-chain signals (0-400)
  layer2Score: number;  // ZK-KYC signals (0-400)
  layer3Score: number;  // literacy signals (0-200)
  totalScore: number;   // 0-1000
  lastUpdated: number;  // epoch timestamp
  modulesCompleted: number;
  totalXP: number;
  attestationCount: number;
}

const defaultState = (did: string): ScoreState => ({
  did,
  tier: 0,
  layer1Score: 0,
  layer2Score: 0,
  layer3Score: 0,
  totalScore: 0,
  lastUpdated: 0,
  modulesCompleted: 0,
  totalXP: 0,
  attestationCount: 0,
});

// ── Layer 1: On-Chain Signals (40%, max 400) ──

function computeLayer1(walletAgeDays: number, avgMonthlyTx: number, defiCount: number,
  totalLoans: number, repaidOnTime: number, defaults: number,
  assetStability: number, govParticipation: number, crossChainCount: number): number {

  const ageScore = Math.min(walletAgeDays / 1095, 1) * 60;
  const txScore = Math.min(avgMonthlyTx / 30, 1) * 40;
  const defiScore = Math.min(defiCount / 100, 1) * 80;
  const repayRate = totalLoans > 0 ? repaidOnTime / totalLoans : 0.5;
  const repayScore = repayRate * 120 - defaults * 40;
  const stabilityScore = assetStability * 40;
  const govScore = govParticipation * 40;
  const crossScore = Math.min(crossChainCount / 5, 1) * 20;

  return Math.max(0, Math.min(400, ageScore + txScore + defiScore + repayScore + stabilityScore + govScore + crossScore));
}

// ── Layer 2: ZK-KYC Signals (40%, max 400, Tier 1+ only) ──

function computeLayer2(tier: number, hasIncome: boolean, hasEmployment: boolean,
  hasBank: boolean, hasEwallet: boolean, hasCredit: boolean, hasAdverse: boolean): number {

  if (tier < 1) return 0;

  let score = 0;
  if (hasIncome) score += 120;
  if (hasEmployment) score += 80;
  if (hasBank) score += 80;
  if (hasEwallet) score += 60;
  if (hasCredit) score -= 60;
  if (hasAdverse) score -= 80;

  return Math.max(0, Math.min(400, score));
}

// ── Layer 3: Literacy Signals (20%, max 200) ──

function computeLayer3(modulesCompleted: number, totalXP: number, recentXP: number,
  firstAttemptAccuracy: number, streakActive: boolean): number {

  const moduleScore = modulesCompleted * 3;
  const xpScore = Math.min(totalXP / 350, 1) * 145;
  const accuracyScore = firstAttemptAccuracy * 20;
  const streakScore = streakActive ? 20 : 0;
  const recentPct = totalXP > 0 ? Math.min(recentXP / totalXP, 1) : 0.5;
  const decay = 0.5 + 0.5 * recentPct;

  return Math.max(0, Math.min(200, (moduleScore + xpScore + accuracyScore + streakScore) * decay));
}

// ── State Transition Functions ──

// Called when Midnight emits a score attestation event
export function onScoreUpdated(state: ScoreState, input: {
  walletAgeDays: number; avgMonthlyTx: number; defiCount: number;
  totalLoans: number; repaidOnTime: number; defaults: number;
  assetStability: number; govParticipation: number; crossChainCount: number;
  hasIncome: boolean; hasEmployment: boolean; hasBank: boolean;
  hasEwallet: boolean; hasCredit: boolean; hasAdverse: boolean;
  modulesCompleted: number; totalXP: number; recentXP: number;
  firstAttemptAccuracy: number; streakActive: boolean;
}): ScoreState {
  const l1 = computeLayer1(
    input.walletAgeDays, input.avgMonthlyTx, input.defiCount,
    input.totalLoans, input.repaidOnTime, input.defaults,
    input.assetStability, input.govParticipation, input.crossChainCount,
  );
  const l2 = computeLayer2(
    state.tier, input.hasIncome, input.hasEmployment, input.hasBank,
    input.hasEwallet, input.hasCredit, input.hasAdverse,
  );
  const l3 = computeLayer3(
    input.modulesCompleted, input.totalXP, input.recentXP,
    input.firstAttemptAccuracy, input.streakActive,
  );

  return {
    ...state,
    layer1Score: Math.round(l1),
    layer2Score: Math.round(l2),
    layer3Score: Math.round(l3),
    totalScore: Math.min(1000, Math.round(l1 + l2 + l3)),
    lastUpdated: Date.now(),
    attestationCount: state.attestationCount + 1,
  };
}

// Called when user selects/upgrades tier on Midnight
export function onTierChanged(state: ScoreState, input: { tier: 0 | 1 | 2 }): ScoreState {
  return { ...state, tier: input.tier };
}

// Called when a new attestation is stored (triggers cross-chain relay to Base/Solana/Canton)
export function onAttestationStored(state: ScoreState, _input: { attestationId: string }): ScoreState {
  return { ...state, attestationCount: state.attestationCount + 1 };
}

// Called when user completes a literacy module
export function onLiteracyCompleted(state: ScoreState, input: {
  moduleId: string; xpEarned: number; correctAnswers: number; totalQuestions: number;
}): ScoreState {
  const newXP = state.totalXP + input.xpEarned;
  const accuracy = input.correctAnswers / input.totalQuestions;

  return {
    ...state,
    modulesCompleted: state.modulesCompleted + 1,
    totalXP: newXP,
    layer3Score: Math.round(computeLayer3(state.modulesCompleted + 1, newXP, input.xpEarned, accuracy, true)),
  };
}

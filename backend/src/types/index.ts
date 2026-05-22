// ── Shared Types for the KREDZ Scoring Engine ──

export type Tier = 0 | 1 | 2;

export type TierLabel = 'anonymous' | 'pseudonymous' | 'compliant';

export interface LayerScores {
  layer1: number; // 0-400 — on-chain signals
  layer2: number; // 0-400 — ZK-KYC signals
  layer3: number; // 0-200 — literacy signals
}

export interface KREDZScore {
  did: string;           // Midnight DID (pseudonymous)
  score: number;          // 0-1000
  tier: Tier;
  layerBreakdown: LayerScores;
  proofHash: string;      // hash of the signed attestation
  attestationId: string;  // unique attestation ID
  validUntil: string;     // ISO 8601
  updatedAt: string;      // ISO 8601
}

export interface ScoreAttestation {
  attestationId: string;
  did: string;
  score: number;
  tier: Tier;
  layerBreakdown: LayerScores;
  proofHash: string;
  recipientChain: 0 | 1; // 0 = Base, 1 = Canton
  signedAt: string;       // ISO 8601
}

export interface WalletAnalysis {
  ageDays: number;
  transactionCount: number;
  avgMonthlyTx: number;
  defiProtocolsInteracted: string[];
  defiInteractionCount: number;
  repaymentHistory: {
    totalLoans: number;
    repaidOnTime: number;
    defaultsOrLiquidations: number;
  };
  assetStability: number; // 0-1 score
  governanceParticipation: number; // 0-1 score
  crossChainNetworks: string[];
}

export interface ZKKYCCredential {
  did: string;
  hasIncomeProof: boolean;
  hasEmploymentProof: boolean;
  hasBankHistory: boolean;
  hasEwalletHistory: boolean;
  hasCreditCommitments: boolean;   // negative signal
  hasAdverseCreditEvents: boolean; // negative signal
  jurisdiction: string | null;
}

export interface LiteracyData {
  did: string;
  modulesCompleted: number;      // total unique modules
  totalXP: number;
  recentXP: number;              // XP earned in last 30 days
  firstAttemptAccuracy: number;  // 0-1
  streakActive: boolean;
}

export interface ScoreQueryRequest {
  did: string;
  purpose: 'credit_assessment' | 'risk_review' | 'compliance_check';
}

export interface ScoreUpdateEvent {
  event: 'score.updated';
  subscriptionId: string;
  borrowerDid: string;
  oldScore: number;
  newScore: number;
  delta: number;
  updatedAt: string; // ISO 8601
}

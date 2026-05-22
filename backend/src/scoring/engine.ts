import { KREDZScore, Tier } from '../types';
import { fetchWalletAnalysis } from './layer1';
import { fetchZkKycCredentials } from './layer2';
import { fetchLiteracyData } from './layer3';
import { runMLInference } from './model';
import { v4 as uuid } from 'uuid';

export async function computeScore(did: string): Promise<KREDZScore> {
  const [wallet, kyc, literacy] = await Promise.all([
    fetchWalletAnalysis(did),
    fetchZkKycCredentials(did),
    fetchLiteracyData(did),
  ]);

  const tier = determineTier(kyc.hasIncomeProof, kyc.hasEmploymentProof);

  const { layer1, layer2, layer3, total } = await runMLInference(wallet, kyc, literacy, tier);

  const now = new Date();
  const validUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    did,
    score: total,
    tier,
    layerBreakdown: { layer1, layer2, layer3 },
    proofHash: '', // filled by signer
    attestationId: uuid(),
    validUntil: validUntil.toISOString(),
    updatedAt: now.toISOString(),
  };
}

function determineTier(hasIncomeProof: boolean, hasEmploymentProof: boolean): Tier {
  if (hasIncomeProof && hasEmploymentProof) return 2;
  if (hasIncomeProof || hasEmploymentProof) return 1;
  return 0;
}

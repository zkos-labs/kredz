import { WalletAnalysis } from '../types';
import { queryMidnightIndexer } from '../providers/midnight-indexer';

export async function fetchWalletAnalysis(did: string): Promise<WalletAnalysis> {
  const data = await queryMidnightIndexer(did);

  return {
    ageDays: data.walletAgeDays ?? 180,
    transactionCount: data.totalTx ?? 0,
    avgMonthlyTx: data.avgMonthlyTx ?? 0,
    defiProtocolsInteracted: data.defiProtocols ?? [],
    defiInteractionCount: data.defiCount ?? 0,
    repaymentHistory: {
      totalLoans: data.totalLoans ?? 0,
      repaidOnTime: data.repaidOnTime ?? 0,
      defaultsOrLiquidations: data.defaults ?? 0,
    },
    assetStability: computeAssetStability(data),
    governanceParticipation: data.govParticipation ?? 0,
    crossChainNetworks: data.crossChainNetworks ?? [],
  };
}

function computeAssetStability(data: Record<string, any>): number {
  const holdingPeriod = data.avgHoldingDays ?? 0;
  return Math.min(holdingPeriod / 365, 1);
}

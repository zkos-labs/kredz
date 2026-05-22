import axios from 'axios';
import { config } from '../config';

interface MidnightIndexerData {
  walletAgeDays: number;
  totalTx: number;
  avgMonthlyTx: number;
  defiProtocols: string[];
  defiCount: number;
  totalLoans: number;
  repaidOnTime: number;
  defaults: number;
  avgHoldingDays: number;
  govParticipation: number;
  crossChainNetworks: string[];
}

export async function queryMidnightIndexer(did: string): Promise<MidnightIndexerData> {
  // GraphQL query to Midnight indexer for wallet analysis data.
  // At MVP, returns placeholder data until connected to a real indexer.

  console.log(`[midnight-indexer] querying data for ${did}`);

  try {
    const query = `
      query WalletAnalysis($did: String!) {
        wallet(did: $did) {
          ageDays
          totalTransactions
          avgMonthlyTransactions
          defiProtocols
          defiInteractionCount
          repaymentHistory {
            totalLoans
            repaidOnTime
            defaults
          }
          avgHoldingDays
          governanceParticipation
          crossChainNetworks
        }
      }
    `;

    const response = await axios.post(
      config.MIDNIGHT_INDEXER_URL,
      { query, variables: { did } },
      { headers: { 'Content-Type': 'application/json' } },
    );

    const wallet = response.data?.data?.wallet;
    return wallet ?? defaultData();
  } catch (err) {
    console.warn('[midnight-indexer] query failed, using default data:', (err as Error).message);
    return defaultData();
  }
}

function defaultData(): MidnightIndexerData {
  return {
    walletAgeDays: 365,
    totalTx: 150,
    avgMonthlyTx: 12,
    defiProtocols: ['uniswap', 'aave'],
    defiCount: 45,
    totalLoans: 3,
    repaidOnTime: 3,
    defaults: 0,
    avgHoldingDays: 90,
    govParticipation: 0.5,
    crossChainNetworks: ['ethereum', 'base'],
  };
}

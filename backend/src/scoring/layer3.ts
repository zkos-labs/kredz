import { LiteracyData } from '../types';

export async function fetchLiteracyData(did: string): Promise<LiteracyData> {
  // Reads literacy data from Midnight's literacy_registry via indexer.
  // At MVP, uses default values until the scoring engine is connected to the chain.

  console.log(`[layer3] fetching literacy data for ${did}`);

  return {
    did,
    modulesCompleted: 0,
    totalXP: 0,
    recentXP: 0,
    firstAttemptAccuracy: 0,
    streakActive: false,
  };
}

// TODO: query Midnight indexer for literacy_registry entries:
// query {
//   literacyRegistry(where: { did: { _eq: $did } }) {
//     modules_completed
//     xp_total
//   }
// }

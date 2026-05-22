import { ZKKYCCredential } from '../types';

export async function fetchZkKycCredentials(did: string): Promise<ZKKYCCredential> {
  // In v1, reads ZK credential status from Midnight shielded state via indexer.
  // At MVP, this is a placeholder that returns default (no credentials) values.

  console.log(`[layer2] fetching ZK-KYC credentials for ${did}`);

  return {
    did,
    hasIncomeProof: false,
    hasEmploymentProof: false,
    hasBankHistory: false,
    hasEwalletHistory: false,
    hasCreditCommitments: false,
    hasAdverseCreditEvents: false,
    jurisdiction: null,
  };
}

// TODO: integrate SumSub API for credential issuance
// import { sumsub } from '../providers/sumsub';
// const status = await sumsub.getCredentialStatus(did);

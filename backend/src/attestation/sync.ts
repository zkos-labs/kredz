import { ScoreAttestation } from '../types';
import { readScoreOnBase } from '../providers/evm-rpc';

export async function syncToBase(attestation: ScoreAttestation, evmAddress: string): Promise<void> {
  // In the full implementation, this:
  // 1. Calls KredzAttestationVerifier.verifyAndUpdate() on Base via ethers
  // 2. Updates the KredzScoreBadge SBT metadata
  // 3. Emits a ScoreUpdated event for protocol subscribers
  //
  // For now, logs the attestation and confirms the relayer received it.
  console.log(`[sync] attestation ${attestation.attestationId} → Base (${evmAddress})`);
  console.log(`[sync] score: ${attestation.score}, tier: ${attestation.tier}`);
}

export async function syncToCanton(attestation: ScoreAttestation): Promise<void> {
  // In the full implementation, this:
  // 1. Creates/updates KredzScore DAML contract on Canton ledger
  // 2. Notifies subscribed institutional lenders via Canton event stream
  //
  // For now, logs the attestation.
  console.log(`[sync] attestation ${attestation.attestationId} → Canton`);
  console.log(`[sync] score: ${attestation.score}, tier: ${attestation.tier}`);
}

export async function syncAttestation(attestation: ScoreAttestation, evmAddress?: string): Promise<void> {
  if (attestation.recipientChain === 0 && evmAddress) {
    await syncToBase(attestation, evmAddress);
  } else if (attestation.recipientChain === 1) {
    await syncToCanton(attestation);
  }
}

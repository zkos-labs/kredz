/**
 * kredz.compact — KREDZ ZK Smart Contract
 *
 * This file documents the Compact contract source.
 * Compile with: compact compile kredz.compact managed/kredz
 *
 * pragma language_version >= 0.22;
 *
 * export ledger tier: Uint<8>;
 * export ledger scoreHash: Bytes<32>;
 * export ledger attestationTimestamp: Uint<64>;
 *
 * // Tier 0: Anonymous — on-chain signals only
 * export circuit setTier0(): [] {
 *   tier = disclose(0 as Uint<8>);
 * }
 *
 * // Tier 1: Pseudonymous — ZK-prove one real-world attribute
 * // attribute stays private; only the proof goes on-chain
 * export circuit setTier1(attribute: Opaque<"string">): [] {
 *   tier = disclose(1 as Uint<8>);
 * }
 *
 * // Tier 2: Full Compliance — ZK-prove full KYC bundle
 * export circuit setTier2(fullKyc: Opaque<"string">): [] {
 *   tier = disclose(2 as Uint<8>);
 * }
 *
 * // Update score hash (called after scoring engine runs)
 * export circuit updateScore(scoreData: Opaque<"string">): [] {
 *   scoreHash = disclose(pad(32, scoreData));
 *   attestationTimestamp = disclose(current_time() as Uint<64>);
 * }
 */

// TypeScript stub — replace with compiled managed/kredz output after running:
// compact compile contracts/kredz.compact contracts/managed/kredz

export interface KredzLedgerState {
  tier: number;
  scoreHash: Uint8Array;
  attestationTimestamp: bigint;
}

export interface KredzContractAPI {
  deployedContractAddress: string;
  getContractState(): Promise<{ data: KredzLedgerState }>;
  getLedgerState(): Promise<{ ledgerState: KredzLedgerState }>;
  setTier0(): Promise<void>;
  setTier1(attribute: string): Promise<void>;
  setTier2(fullKyc: string): Promise<void>;
  updateScore(scoreData: string): Promise<void>;
}

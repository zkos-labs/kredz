/**
 * kredz.compact - KREDZ ZK Smart Contract (Multichain Edition)
 *
 * Compile with: compact compile contracts/kredz.compact contracts/managed/kredz
 *
 * Ledger state:
 *   tier                - privacy tier (0/1/2)
 *   scoreHash           - hash of the KREDZ score data
 *   attestationTimestamp - last score update time
 *   evmAddress          - linked Base/EVM wallet address (20 bytes)
 *   scoreAttestation    - 32-byte blob for the off-chain relayer to bridge to Base
 */

export interface KredzLedgerState {
  tier: number;
  scoreHash: Uint8Array;
  attestationTimestamp: bigint;
  evmAddress: Uint8Array;
  solanaAddress: Uint8Array;
  scoreAttestation: Uint8Array;
}

export interface KredzContractAPI {
  deployedContractAddress: string;
  getContractState(): Promise<{ data: KredzLedgerState }>;
  getLedgerState(): Promise<{ ledgerState: KredzLedgerState }>;
  setTier0(): Promise<void>;
  setTier1(attribute: string): Promise<void>;
  setTier2(fullKyc: string): Promise<void>;
  linkEvmAddress(addr: string): Promise<void>;
  linkSolanaAddress(addr: string): Promise<void>;
  updateScore(scoreData: string): Promise<void>;
}

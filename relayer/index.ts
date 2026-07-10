// DEPRECATED: replaced by EffectStream sync service.
//
// Migration path:
//   1. Complete EffectStream state-machine validation (effectstream/state-machine/src/scoring.ts)
//   2. Run both relayer and EffectStream in parallel for one full session
//   3. Compare outputs — if EffectStream matches this relayer's output, cut over
//   4. Remove this file and update deployment configs
//
// Do NOT deploy this relayer to new environments. It is frozen for existing
// deployments only. New deployments should use EffectStream exclusively.
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config();

// ── Config ────────────────────────────────────────────────────────────────────
const MIDNIGHT_INDEXER_WS = process.env.MIDNIGHT_INDEXER_WS ?? 'wss://indexer.testnet.midnight.network/ws';
const MIDNIGHT_CONTRACT_ADDRESS = process.env.MIDNIGHT_CONTRACT_ADDRESS!;
const BASE_RPC = process.env.BASE_RPC ?? 'https://sepolia.base.org';
const VERIFIER_ADDRESS = process.env.VERIFIER_ADDRESS!;
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY!;
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS ?? '15000');

// ── ABI (minimal) ─────────────────────────────────────────────────────────────
const VERIFIER_ABI = [
  'function submitAttestation(address user, uint16 score, uint8 tier, uint64 timestamp, bytes calldata sig) external',
  'function lastTimestamp(address user) external view returns (uint64)',
  'event ScoreAttested(address indexed user, uint16 score, uint8 tier, uint64 timestamp)',
];

// ── Midnight contract state shape (from kredz.compact ledger) ─────────────────
interface MidnightContractState {
  tier: number;
  scoreHash: string;       // hex
  attestationTimestamp: string; // decimal string (bigint)
  evmAddress: string;      // hex (20 bytes)
  scoreAttestation: string; // hex (32 bytes)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Decode score from attestation blob: bytes 0-1 = score (uint16 big-endian) */
function decodeScore(attestationHex: string): number {
  const buf = Buffer.from(attestationHex.replace('0x', ''), 'hex');
  return (buf[0] << 8) | buf[1];
}

/** Decode EVM address from attestation blob: bytes 2-21 */
function decodeEvmAddress(attestationHex: string): string {
  const buf = Buffer.from(attestationHex.replace('0x', ''), 'hex');
  return '0x' + buf.slice(2, 22).toString('hex');
}

/** Build the EIP-191 digest matching KredzAttestationVerifier._buildDigest */
function buildDigest(user: string, score: number, tier: number, timestamp: number): Uint8Array {
  const inner = ethers.solidityPackedKeccak256(
    ['address', 'uint16', 'uint8', 'uint64'],
    [user, score, tier, timestamp]
  );
  return ethers.getBytes(inner);
}

// ── Midnight Indexer polling ──────────────────────────────────────────────────

async function fetchContractState(contractAddress: string): Promise<MidnightContractState | null> {
  // The Midnight indexer REST endpoint for contract state
  const indexerHttp = MIDNIGHT_INDEXER_WS.replace('wss://', 'https://').replace('ws://', 'http://').replace('/ws', '');
  const url = `${indexerHttp}/api/v1/contract/${contractAddress}/state`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json() as MidnightContractState;
  } catch (err) {
    console.error('[relayer] Failed to fetch contract state:', err);
    return null;
  }
}

// ── Main relay loop ───────────────────────────────────────────────────────────

async function main() {
  if (!MIDNIGHT_CONTRACT_ADDRESS) throw new Error('MIDNIGHT_CONTRACT_ADDRESS not set');
  if (!VERIFIER_ADDRESS) throw new Error('VERIFIER_ADDRESS not set');
  if (!RELAYER_PRIVATE_KEY) throw new Error('RELAYER_PRIVATE_KEY not set');

  const provider = new ethers.JsonRpcProvider(BASE_RPC);
  const wallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);
  const verifier = new ethers.Contract(VERIFIER_ADDRESS, VERIFIER_ABI, wallet);

  console.log('[relayer] Started. Watching Midnight contract: ' + MIDNIGHT_CONTRACT_ADDRESS);
  console.log('[relayer] Relaying to Base verifier: ' + VERIFIER_ADDRESS);
  console.log('[relayer] Relayer address: ' + wallet.address);

  // Track last relayed timestamp per user to avoid duplicate relays
  const lastRelayed = new Map<string, number>();

  async function tick() {
    const state = await fetchContractState(MIDNIGHT_CONTRACT_ADDRESS);
    if (!state) return;

    const attestationHex = state.scoreAttestation;
    if (!attestationHex || attestationHex === '0x' + '00'.repeat(32)) return;

    const score = decodeScore(attestationHex);
    const evmAddress = decodeEvmAddress(attestationHex);
    const timestamp = parseInt(state.attestationTimestamp);
    const tier = state.tier;

    if (!evmAddress || evmAddress === '0x' + '00'.repeat(20)) return;
    if (score === 0) return;

    const prev = lastRelayed.get(evmAddress) ?? 0;
    if (timestamp <= prev) return; // already relayed

    console.log('[relayer] New attestation: user=' + evmAddress + ' score=' + score + ' tier=' + tier + ' ts=' + timestamp);

    // Check on-chain last timestamp to avoid redundant txs
    try {
      const onChainTs = await verifier.lastTimestamp(evmAddress) as bigint;
      if (BigInt(timestamp) <= onChainTs) {
        lastRelayed.set(evmAddress, timestamp);
        return;
      }
    } catch { /* continue */ }

    // Sign the attestation
    const digest = buildDigest(evmAddress, score, tier, timestamp);
    const sig = await wallet.signMessage(digest);

    try {
      const tx = await verifier.submitAttestation(evmAddress, score, tier, timestamp, sig);
      console.log('[relayer] Submitted tx: ' + tx.hash);
      await tx.wait();
      console.log('[relayer] Confirmed. Score ' + score + ' for ' + evmAddress + ' is now on Base.');
      lastRelayed.set(evmAddress, timestamp);
    } catch (err) {
      console.error('[relayer] submitAttestation failed:', err);
    }
  }

  // Initial tick + polling loop
  await tick();
  setInterval(tick, POLL_INTERVAL_MS);
}

main().catch(e => { console.error(e); process.exit(1); });

import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';

const STORAGE_KEY = 'kredz_attestor_secret';

let cachedSecret: Uint8Array | null = null;

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function getOrCreateSecret(): Uint8Array {
  if (cachedSecret) return cachedSecret;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored.length === 64) {
      cachedSecret = hexToBytes(stored);
      return cachedSecret;
    }
  } catch { /* localStorage unavailable */ }

  cachedSecret = crypto.getRandomValues(new Uint8Array(32));
  try {
    localStorage.setItem(STORAGE_KEY, bytesToHex(cachedSecret));
  } catch { /* localStorage unavailable */ }
  return cachedSecret;
}

export async function persistSecret(
  _session: any,
  _contractAddress: string,
): Promise<void> {
  getOrCreateSecret();
}

export function attestorSecret(context: WitnessContext): [any, Uint8Array] {
  const ps = (context as any).privateState ?? {};
  const secret = ps.attestorSecret ?? getOrCreateSecret();
  return [{ ...ps, attestorSecret: secret }, secret];
}

export function makeWitnesses() {
  return { attestorSecret };
}

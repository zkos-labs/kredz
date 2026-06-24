import type { WitnessContext } from '@midnight-ntwrk/compact-runtime';

let cachedSecret: Uint8Array | null = null;

function getOrCreateSecret(): Uint8Array {
  if (!cachedSecret) {
    cachedSecret = crypto.getRandomValues(new Uint8Array(32));
  }
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

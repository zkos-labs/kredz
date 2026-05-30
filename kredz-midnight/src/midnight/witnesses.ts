import type { ConnectedSession } from './session';

let cachedSecret: Uint8Array | null = null;

function getOrCreateSecret(): Uint8Array {
  if (!cachedSecret) {
    cachedSecret = crypto.getRandomValues(new Uint8Array(32));
    console.log('[Witness] Generated new attestor secret (32 bytes)');
  }
  return cachedSecret;
}

export async function persistSecret(
  session: ConnectedSession,
  contractAddress: string,
): Promise<void> {
  const secret = getOrCreateSecret();
  await session.providers.privateStateProvider.setContractAddress(contractAddress);
  await session.providers.privateStateProvider.set('attestorSecret', secret);
}

export function attestorSecret(context: { privateState: any }): [any, Uint8Array] {
  const ps = context.privateState ?? {};
  const secret = ps.attestorSecret ?? getOrCreateSecret();
  const updatedPs = { ...ps, attestorSecret: secret };
  return [updatedPs, secret];
}

export function makeWitnesses() {
  return { attestorSecret };
}

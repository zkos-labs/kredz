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

export function attestorSecret(context: { privateState: any }): [any, Uint8Array] {
  const ps = context.privateState ?? {};
  const secret = (ps as any).attestorSecret ?? getOrCreateSecret();
  return [{ ...ps, attestorSecret: secret }, secret];
}

export function makeWitnesses() {
  return { attestorSecret };
}

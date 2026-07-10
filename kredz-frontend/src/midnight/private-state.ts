export function createPrivateStateProvider() {
  let scope = '';
  const stateStore = new Map<string, unknown>();
  const signingKeyStore = new Map<string, unknown>();
  const key = (id: string) => `${scope}:${id}`;

  return {
    setContractAddress(address: string) { scope = address; },
    async set(id: string, state: unknown) { stateStore.set(key(id), state); },
    async get(id: string) { return stateStore.get(key(id)) ?? null; },
    async remove(id: string) { stateStore.delete(key(id)); },
    async clear() { stateStore.clear(); },
    async setSigningKey(addr: string, k: unknown) { signingKeyStore.set(addr, k); },
    async getSigningKey(addr: string) { return signingKeyStore.get(addr) ?? null; },
    async removeSigningKey(addr: string) { signingKeyStore.delete(addr); },
    async clearSigningKeys() { signingKeyStore.clear(); },
    async exportPrivateStates(): Promise<Record<string, unknown>> {
      const result: Record<string, unknown> = {};
      stateStore.forEach((v, k) => { result[k] = v; });
      return result;
    },
    async importPrivateStates(states: Record<string, unknown>): Promise<void> {
      for (const [k, v] of Object.entries(states)) { stateStore.set(k, v); }
    },
    async exportSigningKeys(): Promise<Record<string, unknown>> {
      const result: Record<string, unknown> = {};
      signingKeyStore.forEach((v, k) => { result[k] = v; });
      return result;
    },
    async importSigningKeys(keys: Record<string, unknown>): Promise<void> {
      for (const [k, v] of Object.entries(keys)) { signingKeyStore.set(k, v); }
    },
  };
}

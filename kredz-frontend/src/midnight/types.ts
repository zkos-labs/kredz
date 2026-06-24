// Type augmentation for 1AM Midnight wallet (dust-free)
// Replaces Lace Beta. 1AM injects at window.midnight['1am']
// Docs: https://1am.xyz/developers

export interface ShieldedAddresses {
  shieldedAddress: string;
  shieldedCoinPublicKey: string;
  shieldedEncryptionPublicKey: string;
}

export interface UnshieldedAddress {
  unshieldedAddress: string;
}

export interface DustAddress {
  dustAddress: string;
}

export interface Configuration {
  networkId: string;
  indexerUri: string;
  indexerWsUri: string;
  proverServerUri?: string;
  substrateNodeUri: string;
}

export interface ProvingProvider {
  prove(serializedPreimage: Uint8Array, keyLocation: string): Promise<Uint8Array>;
}

// window.midnight['1am'] before connect
export interface InitialAPI {
  rdns: string;
  connect(networkId: string): Promise<ConnectedAPI>;
  name: string;
  icon: string;
  apiVersion: string;
}

// window.midnight['1am'] after connect
export interface ConnectedAPI {
  getShieldedAddresses(): Promise<ShieldedAddresses>;
  getUnshieldedAddress(): Promise<UnshieldedAddress>;
  getDustAddress(): Promise<DustAddress>;
  getShieldedBalances(): Promise<Record<string, bigint>>;
  getUnshieldedBalances(): Promise<Record<string, bigint>>;
  getDustBalance(): Promise<{ balance: bigint; cap: bigint }>;
  getConfiguration(): Promise<Configuration>;
  getProvingProvider(keyProvider: unknown): Promise<ProvingProvider>;
  balanceUnsealedTransaction(hex: string): Promise<{ tx: string }>;
  submitTransaction(hex: string): Promise<void>;
  signData(data: string, options?: unknown): Promise<unknown>;
}

declare global {
  interface Window {
    midnight?: {
      '1am'?: InitialAPI;
      mnLace?: unknown; // legacy Lace, no longer used
    };
  }
}

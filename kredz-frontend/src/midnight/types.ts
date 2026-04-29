// Type augmentation for Lace Beta Midnight wallet
export interface MidnightWalletAPI {
  state(): Promise<{
    address: string;
    coinPublicKey: string;
    encryptionPublicKey: string;
  }>;
  balanceAndProveTransaction(tx: unknown, newCoins: unknown): Promise<unknown>;
  submitTransaction(tx: unknown): Promise<unknown>;
}

export interface MidnightWallet {
  enable(): Promise<MidnightWalletAPI>;
  disconnect(): Promise<void>;
  serviceUriConfig(): Promise<{
    indexerUri: string;
    indexerWsUri: string;
    proverServerUri: string;
  }>;
}

declare global {
  interface Window {
    midnight?: {
      mnLace?: MidnightWallet;
    };
  }
}

import { useState, useCallback } from 'react';
import type { MidnightWalletAPI } from '../midnight/types';

export interface WalletState {
  address: string;
  coinPublicKey: string;
  encryptionPublicKey: string;
}

export interface ServiceUris {
  indexerUri: string;
  indexerWsUri: string;
  proverServerUri: string;
}

export interface ConnectedWallet {
  state: WalletState;
  uris: ServiceUris;
  walletAPI: MidnightWalletAPI;
}

export function useMidnightWallet() {
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const lace = window.midnight?.mnLace;
      if (!lace) throw new Error('LACE_NOT_FOUND');
      const walletAPI = await lace.enable();
      const state = await walletAPI.state();
      const uris = await lace.serviceUriConfig();
      setWallet({ state, uris, walletAPI });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      setError(msg);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await window.midnight?.mnLace?.disconnect();
    } finally {
      setWallet(null);
      setError(null);
    }
  }, []);

  return { wallet, isConnecting, error, connect, disconnect };
}

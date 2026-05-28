import { useState, useCallback } from 'react';
import type { InitialAPI, ConnectedAPI, ShieldedAddresses } from '../midnight/types';

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
  connectedAPI: ConnectedAPI;
}

function detectWallet(): Promise<InitialAPI | null> {
  return new Promise((resolve) => {
    const wallet = window.midnight?.['1am'];
    if (wallet) { resolve(wallet); return; }

    let attempts = 0;
    const interval = setInterval(() => {
      const w = window.midnight?.['1am'];
      if (w) { clearInterval(interval); resolve(w); }
      else if (++attempts > 50) { clearInterval(interval); resolve(null); }
    }, 100);
  });
}

export function useMidnightWallet() {
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const initialAPI = await detectWallet();
      if (!initialAPI) throw new Error('ONEM_NOT_FOUND');

      const connectedAPI = await initialAPI.connect('preview');

      const { shieldedAddress, shieldedCoinPublicKey, shieldedEncryptionPublicKey }
        = await connectedAPI.getShieldedAddresses() as ShieldedAddresses & {
          shieldedCoinPublicKey: string; shieldedEncryptionPublicKey: string;
        };

      const config = await connectedAPI.getConfiguration();

      setWallet({
        state: {
          address: shieldedAddress,
          coinPublicKey: shieldedCoinPublicKey,
          encryptionPublicKey: shieldedEncryptionPublicKey,
        },
        uris: {
          indexerUri: config.indexerUri,
          indexerWsUri: config.indexerWsUri,
          proverServerUri: config.proverServerUri,
        },
        connectedAPI,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      setError(msg);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    setWallet(null);
    setError(null);
  }, []);

  return { wallet, isConnecting, error, connect, disconnect };
}

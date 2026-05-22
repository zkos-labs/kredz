import { useState, useCallback } from 'react';

export interface SolanaWallet {
  address: string; // base58 public key
}

// Wallet Standard: Phantom v2+ injects window.phantom.solana; older wallets use window.solana
function getProvider() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w?.phantom?.solana ?? w?.solana ?? null;
}

export function useSolanaWallet() {
  const [solanaWallet, setSolanaWallet] = useState<SolanaWallet | null>(() => {
    try {
      const stored = localStorage.getItem('kredz_solana_wallet');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const provider = getProvider();
      if (!provider) throw new Error('PHANTOM_NOT_FOUND');
      const resp = await provider.connect({ onlyIfTrusted: false });
      const address: string = resp.publicKey.toString();
      const wallet: SolanaWallet = { address };
      setSolanaWallet(wallet);
      localStorage.setItem('kredz_solana_wallet', JSON.stringify(wallet));
      return wallet;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Solana connection failed';
      setError(msg);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try { await getProvider()?.disconnect(); } catch { /* ignore */ }
    setSolanaWallet(null);
    localStorage.removeItem('kredz_solana_wallet');
  }, []);

  return { solanaWallet, isConnecting, error, connect, disconnect };
}

import { useState, useCallback } from 'react';

export interface EvmWallet {
  address: string;
  chainId: number;
}

// Base mainnet = 8453, Base Sepolia = 84532
const BASE_CHAIN_IDS = [8453, 84532];

export function useEvmWallet() {
  const [evmWallet, setEvmWallet] = useState<EvmWallet | null>(() => {
    try {
      const stored = localStorage.getItem('kredz_evm_wallet');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const eth = (window as Window & { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
      if (!eth) throw new Error('METAMASK_NOT_FOUND');

      const accounts = await eth.request({ method: 'eth_requestAccounts' }) as string[];
      if (!accounts.length) throw new Error('No accounts returned');

      const chainIdHex = await eth.request({ method: 'eth_chainId' }) as string;
      const chainId = parseInt(chainIdHex, 16);

      // Prompt switch to Base Sepolia if not already on a Base chain
      if (!BASE_CHAIN_IDS.includes(chainId)) {
        try {
          await eth.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x14a34' }], // Base Sepolia
          });
        } catch {
          // User rejected switch. Continue anyway, just warn
          console.warn('[KREDZ] Not on Base chain, continuing anyway');
        }
      }

      const wallet: EvmWallet = { address: accounts[0], chainId };
      setEvmWallet(wallet);
      localStorage.setItem('kredz_evm_wallet', JSON.stringify(wallet));
      return wallet;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'EVM connection failed';
      setError(msg);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setEvmWallet(null);
    localStorage.removeItem('kredz_evm_wallet');
  }, []);

  return { evmWallet, isConnecting, error, connect, disconnect };
}

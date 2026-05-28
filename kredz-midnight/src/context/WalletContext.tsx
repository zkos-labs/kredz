import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ConnectedSession } from '../midnight/session';
import { createConnectedSession } from '../midnight/session';

type WalletContextType = {
  address: string | null;
  isConnected: boolean;
  walletType: '1am' | 'lace' | null;
  walletStatus: 'checking' | 'detected' | 'not-found';
  isConnecting: boolean;
  session: ConnectedSession | null;
  connect: (network?: string) => Promise<ConnectedSession | undefined>;
  disconnect: () => void;
};

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletType, setWalletType] = useState<'1am' | 'lace' | null>(null);
  const [walletStatus, setWalletStatus] = useState<'checking' | 'detected' | 'not-found'>('checking');
  const [isConnecting, setIsConnecting] = useState(false);
  const [session, setSession] = useState<ConnectedSession | null>(null);
  const connectingRef = useRef(false);

  useEffect(() => {
    const startedAt = Date.now();
    const id = setInterval(() => {
      const w1am = (window as any).midnight?.['1am'];
      const wLace = (window as any).midnight?.mnLace;
      if (w1am) { setWalletType('1am'); setWalletStatus('detected'); clearInterval(id); return; }
      if (wLace) { setWalletType('lace'); setWalletStatus('detected'); clearInterval(id); return; }
      if (Date.now() - startedAt >= 6000) { setWalletStatus('not-found'); clearInterval(id); }
    }, 300);
    return () => clearInterval(id);
  }, []);

  const connect = useCallback(async (network = 'preprod') => {
    if (connectingRef.current) return;
    connectingRef.current = true;
    setIsConnecting(true);
    try {
      const wallet = (window as any).midnight?.['1am'] ?? (window as any).midnight?.mnLace;
      if (!wallet) throw new Error('No wallet found');
      const api = await wallet.connect(network);
      const sess = await createConnectedSession(api);
      setSession(sess);
      setAddress(sess.unshieldedAddress);
      setIsConnected(true);
      return sess;
    } catch (e) {
      console.error('Wallet connect failed:', e);
      throw e;
    } finally {
      connectingRef.current = false;
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setSession(null);
    setWalletStatus('checking');
    setWalletType(null);
  }, []);

  return (
    <WalletContext.Provider value={{ address, isConnected, walletType, walletStatus, isConnecting, session, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextType {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}

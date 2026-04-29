import { createContext, useContext, useState, type ReactNode } from 'react';
import { useMidnightWallet, type ConnectedWallet } from '../hooks/useMidnightWallet';

export type Tier = 0 | 1 | 2 | null;

interface AppContextValue {
  wallet: ConnectedWallet | null;
  isConnecting: boolean;
  walletError: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  tier: Tier;
  setTier: (t: Tier) => void;
  contractAddress: string | null;
  setContractAddress: (a: string | null) => void;
  score: number;
  setScore: (s: number) => void;
  layerScores: [number, number, number];
  setLayerScores: (ls: [number, number, number]) => void;
  completedModules: string[];
  completeModule: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { wallet, isConnecting, error: walletError, connect, disconnect } = useMidnightWallet();
  const [tier, setTier] = useState<Tier>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [layerScores, setLayerScores] = useState<[number, number, number]>([0, 0, 0]);
  const [completedModules, setCompletedModules] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('kredz_modules') || '[]'); }
    catch { return []; }
  });

  const completeModule = (id: string) => {
    setCompletedModules(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem('kredz_modules', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AppContext.Provider value={{
      wallet, isConnecting, walletError: walletError, connect, disconnect,
      tier, setTier,
      contractAddress, setContractAddress,
      score, setScore,
      layerScores, setLayerScores,
      completedModules, completeModule,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

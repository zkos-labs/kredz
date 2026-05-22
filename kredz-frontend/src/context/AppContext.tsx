import { createContext, useContext, useState, type ReactNode } from 'react';
import { useMidnightWallet, type ConnectedWallet } from '../hooks/useMidnightWallet';
import { useEvmWallet, type EvmWallet } from '../hooks/useEvmWallet';
import { useSolanaWallet, type SolanaWallet } from '../hooks/useSolanaWallet';

export type Tier = 0 | 1 | 2 | null;
export type ActiveChain = 'midnight' | 'base' | 'solana';

interface AppContextValue {
  wallet: ConnectedWallet | null;
  isConnecting: boolean;
  walletError: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  evmWallet: EvmWallet | null;
  isEvmConnecting: boolean;
  evmError: string | null;
  connectEvm: () => Promise<EvmWallet>;
  disconnectEvm: () => void;
  solanaWallet: SolanaWallet | null;
  isSolanaConnecting: boolean;
  solanaError: string | null;
  connectSolana: () => Promise<SolanaWallet>;
  disconnectSolana: () => Promise<void>;
  walletsLinked: boolean;
  setWalletsLinked: (v: boolean) => void;
  activeChain: ActiveChain;
  setActiveChain: (c: ActiveChain) => void;
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
  baseScore: number;
  setBaseScore: (s: number) => void;
  baseScoreTimestamp: number | null;
  setBaseScoreTimestamp: (t: number | null) => void;
  solanaScore: number;
  setSolanaScore: (s: number) => void;
  solanaScoreTimestamp: number | null;
  setSolanaScoreTimestamp: (t: number | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { wallet, isConnecting, error: walletError, connect, disconnect } = useMidnightWallet();
  const { evmWallet, isConnecting: isEvmConnecting, error: evmError, connect: connectEvm, disconnect: disconnectEvm } = useEvmWallet();
  const { solanaWallet, isConnecting: isSolanaConnecting, error: solanaError, connect: connectSolana, disconnect: disconnectSolana } = useSolanaWallet();

  const [walletsLinked, setWalletsLinked] = useState(() =>
    localStorage.getItem('kredz_wallets_linked') === 'true'
  );
  const [activeChain, setActiveChain] = useState<ActiveChain>('midnight');
  const [tier, setTier] = useState<Tier>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(() =>
    localStorage.getItem('kredz_contract_address')
  );
  const [score, setScore] = useState(0);
  const [layerScores, setLayerScores] = useState<[number, number, number]>([0, 0, 0]);
  const [completedModules, setCompletedModules] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('kredz_modules') || '[]'); }
    catch { return []; }
  });
  const [baseScore, setBaseScore] = useState(0);
  const [baseScoreTimestamp, setBaseScoreTimestamp] = useState<number | null>(null);
  const [solanaScore, setSolanaScore] = useState(0);
  const [solanaScoreTimestamp, setSolanaScoreTimestamp] = useState<number | null>(null);

  const handleSetContractAddress = (a: string | null) => {
    setContractAddress(a);
    if (a) localStorage.setItem('kredz_contract_address', a);
    else localStorage.removeItem('kredz_contract_address');
  };

  const handleSetWalletsLinked = (v: boolean) => {
    setWalletsLinked(v);
    localStorage.setItem('kredz_wallets_linked', String(v));
  };

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
      wallet, isConnecting, walletError, connect, disconnect,
      evmWallet, isEvmConnecting, evmError, connectEvm, disconnectEvm,
      solanaWallet, isSolanaConnecting, solanaError, connectSolana, disconnectSolana,
      walletsLinked, setWalletsLinked: handleSetWalletsLinked,
      activeChain, setActiveChain,
      tier, setTier,
      contractAddress, setContractAddress: handleSetContractAddress,
      score, setScore,
      layerScores, setLayerScores,
      completedModules, completeModule,
      baseScore, setBaseScore,
      baseScoreTimestamp, setBaseScoreTimestamp,
      solanaScore, setSolanaScore,
      solanaScoreTimestamp, setSolanaScoreTimestamp,
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

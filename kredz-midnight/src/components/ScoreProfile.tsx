import { useEffect, useState } from 'react';
import { User, Shield, AlertCircle } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { readContractState } from '../midnight/contract';

type Props = { contractAddress: string };
type ProfileData = { tier: number; hasEvm: boolean; hasSolana: boolean };

const TIER_LABELS = ['Anonymous', 'Pseudonymous', 'Full Compliance'];
const TIER_COLORS = ['text-zinc-400', 'text-amber-400', 'text-emerald-400'];
const TIER_BG = ['bg-zinc-800', 'bg-amber-900/30', 'bg-emerald-900/30'];

export default function ScoreProfile({ contractAddress }: Props) {
  const { session, address } = useWallet();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session || !contractAddress) return;
    setIsLoading(true);
    readContractState(session, contractAddress)
      .then((data) => {
        if (data) {
          setProfile({
            tier: data.tiers?.get?.(address ?? '') ?? 0,
            hasEvm: !!(data as any)?.evm_linked?.has,
            hasSolana: !!(data as any)?.solana_linked?.has,
          });
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [session, contractAddress, address]);

  if (!session) return null;
  if (isLoading) return <div className="text-zinc-500 text-xs font-mono animate-pulse">Loading profile...</div>;
  if (error) return <div className="text-red-400 text-xs font-mono">{error}</div>;

  const tier = profile?.tier ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-violet-400" />
        <h3 className="text-sm font-mono tracking-widest uppercase text-zinc-300">Score Profile</h3>
      </div>

      <div className={`${TIER_BG[tier]} border border-white/5 rounded-xl p-4`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">KREDZ Tier</span>
          <span className={`text-xs font-mono font-bold ${TIER_COLORS[tier]}`}>
            {TIER_LABELS[tier]}
          </span>
        </div>

        <div className="flex gap-3 text-[10px] font-mono text-zinc-500">
          <span className={profile?.hasEvm ? 'text-zinc-300' : ''}>
            EVM {profile?.hasEvm ? '✓' : '✗'}
          </span>
          <span className={profile?.hasSolana ? 'text-zinc-300' : ''}>
            Solana {profile?.hasSolana ? '✓' : '✗'}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-zinc-600">
          <Shield className="w-3 h-3" />
          <span>Exact score never stored on-chain — only ZK commitment</span>
        </div>
      </div>

      <div className="space-y-1.5 text-[10px] font-mono text-zinc-500">
        <p>Tier 0 (0–399): Anonymous identity only</p>
        <p>Tier 1 (400–649): Pseudonymous with on-chain history</p>
        <p>Tier 2 (650–1000): Full compliance with ZK-KYC</p>
      </div>
    </div>
  );
}

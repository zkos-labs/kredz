import { useState } from 'react';
import { Loader2, Eye, Key } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { callCircuit } from '../midnight/contract';

type Props = { contractAddress: string };

export default function ProveTier({ contractAddress }: Props) {
  const { session } = useWallet();
  const [userKey, setUserKey] = useState('');
  const [tier, setTier] = useState<number | null>(null);
  const [scoreAbove, setScoreAbove] = useState<boolean | null>(null);
  const [threshold, setThreshold] = useState('400');
  const [scoreInput, setScoreInput] = useState('');
  const [saltInput, setSaltInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProveTier = async () => {
    if (!session || !userKey) return;
    setIsLoading(true);
    setError(null);
    setTier(null);
    setScoreAbove(null);
    try {
      const pubkeyBytes = new Uint8Array(32);
      const pkHex = userKey.replace(/^mn_addr_preprod1/, '');
      if (pkHex.length >= 64) {
        for (let i = 0; i < 32; i++) {
          pubkeyBytes[i] = parseInt(pkHex.slice(i * 2, i * 2 + 2), 16);
        }
      }

      const tx = await callCircuit(session, contractAddress, 'prove_tier', [
        Array.from(pubkeyBytes),
      ]);

      // After tx, query state to read the tier
      const state = await session.providers.publicDataProvider.queryContractState(contractAddress);
      if (state?.data) {
        const ledger = (state.data as any);
        setTier(typeof ledger === 'number' ? ledger : null);
      }
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleProveScoreAbove = async () => {
    if (!session || !userKey || !scoreInput || !saltInput) return;
    setIsLoading(true);
    setError(null);
    try {
      const pubkeyBytes = new Uint8Array(32);
      const pkHex = userKey.replace(/^mn_addr_preprod1/, '');
      if (pkHex.length >= 64) {
        for (let i = 0; i < 32; i++) {
          pubkeyBytes[i] = parseInt(pkHex.slice(i * 2, i * 2 + 2), 16);
        }
      }

      const scoreNum = parseInt(scoreInput, 10);
      const thresholdNum = parseInt(threshold, 10);
      const saltBytes = new TextEncoder().encode(saltInput).slice(0, 16);

      const tx = await callCircuit(session, contractAddress, 'prove_score_above', [
        Array.from(pubkeyBytes),
        scoreNum,
        Array.from(saltBytes),
        thresholdNum,
      ]);

      const state = await session.providers.publicDataProvider.queryContractState(contractAddress);
      if (state?.data) {
        setScoreAbove((state.data as any)?.result === true);
      }
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-4 h-4 text-violet-400" />
        <h3 className="text-sm font-mono tracking-widest uppercase text-zinc-300">Prove Tier</h3>
      </div>

      <div>
        <label className="block text-[10px] font-mono tracking-wider text-zinc-500 uppercase mb-1">User Public Key</label>
        <input
          type="text"
          value={userKey}
          onChange={(e) => setUserKey(e.target.value)}
          placeholder="mn_addr_preprod1..."
          className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs font-mono text-zinc-200 focus:border-violet-500/50 focus:outline-none"
        />
      </div>

      <button
        onClick={handleProveTier}
        disabled={isLoading || !session || !userKey}
        className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-mono tracking-widest uppercase py-2.5 rounded-lg transition-all"
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
        Prove Tier
      </button>

      {tier !== null && (
        <div className="bg-violet-900/20 border border-violet-500/20 rounded p-3">
          <p className="text-[10px] font-mono text-violet-300">
            Tier revealed: <span className="text-white font-bold">{['Anonymous', 'Pseudonymous', 'Full Compliance'][tier] ?? `Tier ${tier}`}</span>
          </p>
          <p className="text-[9px] font-mono text-zinc-500 mt-1">Exact score remains private — only tier disclosed</p>
        </div>
      )}

      {/* Prove Score Above Threshold */}
      <div className="border-t border-white/5 pt-4 space-y-3">
        <div className="flex items-center gap-1.5">
          <Key className="w-3 h-3 text-amber-400" />
          <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase">Prove Score Above Threshold</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-mono tracking-wider text-zinc-500 uppercase mb-1">Score (private)</label>
            <input
              type="number"
              min={0}
              max={1000}
              value={scoreInput}
              onChange={(e) => setScoreInput(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs font-mono text-zinc-200 focus:border-violet-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono tracking-wider text-zinc-500 uppercase mb-1">Threshold</label>
            <input
              type="number"
              min={0}
              max={1000}
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs font-mono text-zinc-200 focus:border-violet-500/50 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-mono tracking-wider text-zinc-500 uppercase mb-1">Salt (private witness)</label>
          <input
            type="text"
            value={saltInput}
            onChange={(e) => setSaltInput(e.target.value)}
            placeholder="Any string — used to verify commitment"
            className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs font-mono text-zinc-200 focus:border-violet-500/50 focus:outline-none"
          />
        </div>

        <button
          onClick={handleProveScoreAbove}
          disabled={isLoading || !session || !userKey || !scoreInput || !saltInput}
          className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-mono tracking-widest uppercase py-2.5 rounded-lg transition-all"
        >
          <Key className="w-3.5 h-3.5" />
          Prove Score Above Threshold
        </button>

        {scoreAbove !== null && (
          <div className={`${scoreAbove ? 'bg-emerald-900/20 border-emerald-500/20' : 'bg-red-900/20 border-red-500/20'} border rounded p-3`}>
            <p className="text-[10px] font-mono">
              Score {scoreAbove ? <span className="text-emerald-400">exceeds</span> : <span className="text-red-400">does not exceed</span>} threshold of {threshold}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/20 rounded p-3">
          <p className="text-[10px] font-mono text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}

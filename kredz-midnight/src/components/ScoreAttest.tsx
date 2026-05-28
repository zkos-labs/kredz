import { useState } from 'react';
import { Loader2, Check, ShieldCheck } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { callCircuit } from '../midnight/contract';

type Props = { contractAddress: string };

export default function ScoreAttest({ contractAddress }: Props) {
  const { session } = useWallet();
  const [userKey, setUserKey] = useState('');
  const [score, setScore] = useState('');
  const [tier, setTier] = useState('0');
  const [isAttesting, setIsAttesting] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAttest = async () => {
    if (!session || !userKey || !score) return;
    setIsAttesting(true);
    setError(null);
    setTxId(null);
    try {
      const pubkeyBytes = new Uint8Array(32);
      const pkHex = userKey.replace(/^mn_addr_preprod1/, '');
      if (pkHex.length >= 64) {
        for (let i = 0; i < 32; i++) {
          pubkeyBytes[i] = parseInt(pkHex.slice(i * 2, i * 2 + 2), 16);
        }
      }

      const scoreNum = parseInt(score, 10);
      const tierNum = parseInt(tier, 10);
      const salt = crypto.getRandomValues(new Uint8Array(16));

      const tx = await callCircuit(session, contractAddress, 'attest_score', [
        Array.from(pubkeyBytes),
        scoreNum,
        Array.from(salt),
        tierNum,
      ]);

      setTxId(tx);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setIsAttesting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-4 h-4 text-violet-400" />
        <h3 className="text-sm font-mono tracking-widest uppercase text-zinc-300">Attest Score</h3>
      </div>

      <div className="space-y-3">
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-mono tracking-wider text-zinc-500 uppercase mb-1">Score (0-1000)</label>
            <input
              type="number"
              min={0}
              max={1000}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs font-mono text-zinc-200 focus:border-violet-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono tracking-wider text-zinc-500 uppercase mb-1">Tier</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded px-3 py-2 text-xs font-mono text-zinc-200 focus:border-violet-500/50 focus:outline-none"
            >
              <option value="0">Tier 0 — Anonymous</option>
              <option value="1">Tier 1 — Pseudonymous</option>
              <option value="2">Tier 2 — Full Compliance</option>
            </select>
          </div>
        </div>

        <div className="text-[10px] font-mono text-zinc-500">
          <span className="text-violet-400/70">Privacy:</span> Score + salt are ZK witnesses. Only tier classification and commitment hash go on-chain.
        </div>

        <button
          onClick={handleAttest}
          disabled={isAttesting || !session || !userKey || !score}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-mono tracking-widest uppercase py-2.5 rounded-lg transition-all"
        >
          {isAttesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          {isAttesting ? 'Attesting...' : 'Submit Attestation'}
        </button>

        {txId && (
          <div className="bg-emerald-900/20 border border-emerald-500/20 rounded p-3">
            <p className="text-[10px] font-mono text-emerald-400">Attested: {txId.slice(0, 64)}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-900/20 border border-red-500/20 rounded p-3">
            <p className="text-[10px] font-mono text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, BookOpen, RefreshCw, Loader2, Link2, Award, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LiteracyModules } from '../components/LiteracyModules';
import { joinKredzContract } from '../midnight/contract';
import { toast } from '../components/Toast';
import { useBaseScore } from '../hooks/useBaseScore';
import { useSolanaScore } from '../hooks/useSolanaScore';

const TIER_LABELS = ['Anonymous', 'Pseudonymous', 'Full Compliance'];
const TIER_COLORS = ['text-[#DEDBC8]/50', 'text-[#DEDBC8]', 'text-[#DEDBC8]'];
const TIER_RANGES = ['0-400', '0-650', '0-1000'];
const TIER_MAX = [400, 650, 1000];

const LAYERS = [
  { icon: TrendingUp, label: 'On-Chain Signals', key: 0, max: 400, color: 'from-[#DEDBC8]/30 to-[#DEDBC8]/60' },
  { icon: Shield, label: 'ZK-KYC Signals', key: 1, max: 400, color: 'from-[#DEDBC8]/40 to-[#DEDBC8]/80' },
  { icon: BookOpen, label: 'Behavioral Literacy', key: 2, max: 200, color: 'from-[#DEDBC8]/20 to-[#DEDBC8]/50' },
];

function ScoreRing({ score, max }: { score: number; max: number }) {
  const r = 80;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(score / max, 1);
  const [animated, setAnimated] = useState(0);
  const ref = useRef<SVGCircleElement>(null);
  useEffect(() => { const t = setTimeout(() => setAnimated(pct), 100); return () => clearTimeout(t); }, [pct]);

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg width="192" height="192" viewBox="0 0 192 192" className="-rotate-90">
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#DEDBC8" />
            <stop offset="100%" stopColor="#F5F3E8" />
          </linearGradient>
        </defs>
        <circle cx="96" cy="96" r={r} fill="none" strokeWidth="10" className="score-ring-track" />
        <circle ref={ref} cx="96" cy="96" r={r} fill="none" strokeWidth="10"
          className="score-ring-fill" strokeDasharray={circ}
          strokeDashoffset={circ - animated * circ}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16,1,0.3,1)' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedNumber value={score} className="text-4xl font-black text-gradient" />
        <span className="text-xs text-[#DEDBC8]/30 mt-1">KREDZ Score</span>
      </div>
    </div>
  );
}

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0; const end = value; const step = (end / 1500) * 16;
    const t = setInterval(() => { start = Math.min(start + step, end); setDisplay(Math.floor(start)); if (start >= end) clearInterval(t); }, 16);
    return () => clearInterval(t);
  }, [value]);
  return <span className={className}>{display}</span>;
}

export default function Dashboard() {
  const { wallet, tier, score, layerScores, contractAddress, setScore, setLayerScores, evmWallet, solanaWallet, walletsLinked, setBaseScore, setBaseScoreTimestamp, setSolanaScore, setSolanaScoreTimestamp } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const { data: baseData, loading: baseLoading, minting: baseMinting, fetchScore: fetchBaseScore, mintBadge } = useBaseScore();
  const { data: solanaData, loading: solanaLoading, fetchScore: fetchSolanaScore } = useSolanaScore();
  const [solanaMinting, setSolanaMinting] = useState(false);

  useEffect(() => { if (walletsLinked && evmWallet?.address) fetchBaseScore(evmWallet.address); }, [walletsLinked, evmWallet?.address, fetchBaseScore]);
  useEffect(() => { if (walletsLinked && solanaWallet?.address) fetchSolanaScore(solanaWallet.address); }, [walletsLinked, solanaWallet?.address, fetchSolanaScore]);
  useEffect(() => { if (baseData) { setBaseScore(baseData.score); setBaseScoreTimestamp(baseData.timestamp); } }, [baseData, setBaseScore, setBaseScoreTimestamp]);
  useEffect(() => { if (solanaData) { setSolanaScore(solanaData.score); setSolanaScoreTimestamp(solanaData.timestamp); } }, [solanaData, setSolanaScore, setSolanaScoreTimestamp]);

  async function refreshScore() {
    if (!wallet || !contractAddress) return;
    setRefreshing(true);
    try {
      const api = await joinKredzContract(wallet.connectedAPI, contractAddress);
      const state = await api.getContractState();
      const t = state.data.tier as 0 | 1 | 2;
      const base: [number, number, number] = [120, 0, layerScores[2]];
      if (t >= 1) base[1] = 180;
      if (t >= 2) { base[0] = 200; base[1] = 280; }
      setLayerScores(base); setScore(base.reduce((a, b) => a + b, 0));
      toast('Score refreshed from chain', 'success');
      if (walletsLinked && evmWallet?.address) await fetchBaseScore(evmWallet.address);
      if (walletsLinked && solanaWallet?.address) await fetchSolanaScore(solanaWallet.address);
    } catch { toast('Failed to refresh score', 'error'); }
    finally { setRefreshing(false); }
  }

  async function handleMintBadge() {
    if (!evmWallet?.address) return;
    try { await mintBadge(evmWallet.address, score, tier ?? 0, Math.floor(Date.now() / 1000)); toast('Score badge minted on Base!', 'success'); }
    catch (err) { toast(err instanceof Error ? err.message : 'Mint failed', 'error'); }
  }

  async function handleMintSolanaBadge() {
    if (!solanaWallet?.address) return;
    setSolanaMinting(true);
    try { await new Promise(r => setTimeout(r, 1500)); toast('Solana badge minting requires relayer signature. Coming soon!', 'info'); }
    catch (err) { toast(err instanceof Error ? err.message : 'Mint failed', 'error'); }
    finally { setSolanaMinting(false); }
  }

  const tierIdx = tier ?? 0;
  const maxScore = TIER_MAX[tierIdx];

  return (
    <div className="min-h-screen pt-24 px-4 md:px-12 pb-16 relative bg-black">
      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-[10px] sm:text-xs text-[#DEDBC8] uppercase tracking-[0.2em] mb-1">Your Dashboard</p>
            <h1 className="font-medium text-3xl md:text-4xl text-[#E1E0CC] leading-[0.95]">KREDZ Score</h1>
            <p className="text-sm text-[#DEDBC8]/30 mt-1 font-mono truncate max-w-xs">
              {contractAddress ? `Contract: ${contractAddress.slice(0, 20)}...` : 'No contract deployed'}
            </p>
          </div>
          <button onClick={refreshScore} disabled={refreshing}
            className="flex items-center gap-2 bg-[#101010] px-4 py-2.5 rounded-full text-sm text-[#DEDBC8]/60 hover:text-[#DEDBC8] transition-colors border border-[#DEDBC8]/5">
            {refreshing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            Refresh from Chain
          </button>
        </motion.div>

        {/* Score + Tier */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="bg-[#101010] rounded-3xl p-6 md:p-8 flex flex-col items-center gap-4 md:col-span-1">
            <ScoreRing score={score} max={maxScore} />
            <div className="text-center">
              <div className={`font-medium text-lg ${TIER_COLORS[tierIdx]}`}>{TIER_LABELS[tierIdx]}</div>
              <div className="text-xs text-[#DEDBC8]/30 mt-1">Score Range: {TIER_RANGES[tierIdx]}</div>
            </div>
            <div className="w-full bg-[#0A0A0A] rounded-xl p-3 flex items-center gap-2 border border-[#DEDBC8]/5">
              <Shield size={14} className="text-[#DEDBC8]/40" />
              <span className="text-xs text-[#DEDBC8]/50">Tier {tierIdx} - ZK-verified on Midnight</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-[#101010] rounded-3xl p-6 md:p-8 md:col-span-2 flex flex-col gap-5">
            <h2 className="font-medium text-lg text-[#E1E0CC]">Score Breakdown</h2>
            {LAYERS.map(({ icon: Icon, label, key, max, color }, i) => {
              const val = layerScores[key];
              const pct = Math.min((val / max) * 100, 100);
              return (
                <motion.div key={label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon size={15} className="text-[#DEDBC8]/60" />
                      <span className="text-sm text-[#DEDBC8]/70">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#E1E0CC]">{val}</span>
                      <span className="text-xs text-[#DEDBC8]/20">/ {max}</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-[#0A0A0A] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 1.2, delay: 0.4 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className={`h-full rounded-full bg-gradient-to-r ${color}`} />
                  </div>
                </motion.div>
              );
            })}
            <div className="mt-auto pt-4 border-t border-[#DEDBC8]/5 flex items-center justify-between">
              <span className="text-sm text-[#DEDBC8]/40">Total Score</span>
              <div className="flex items-baseline gap-1">
                <span className="font-black text-2xl text-gradient">{score}</span>
                <span className="text-sm text-[#DEDBC8]/20">/ {maxScore}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Network Score Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}
          className="flex items-center justify-between mb-4">
          <span className="font-medium text-xs sm:text-sm text-[#DEDBC8]/50 uppercase tracking-[0.1em]">Your Score Across Networks</span>
          <span className="text-[10px] text-[#DEDBC8]/20">One score, five networks, zero repetition</span>
        </motion.div>

        {/* Canton Card */}
        {walletsLinked && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
            className="bg-[#101010] rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] flex items-center justify-center shrink-0 border border-indigo-500/10">
                <Link2 size={20} className="text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-[#E1E0CC]">Canton Network</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300">DAML</span>
                  {tierIdx >= 2 && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300">Active</span>}
                </div>
                <p className="text-sm text-[#DEDBC8]/40">
                  {tierIdx >= 2
                    ? 'Your score is available to institutional lenders on Canton via DAML smart contracts. Sub-transaction privacy. Lenders query your score confidentially.'
                    : tierIdx >= 1
                    ? 'Upgrade to Tier 2 (Full Compliance) to unlock institutional lender access on Canton Network.'
                    : 'Institutional access unlocks at Tier 2. Build your score and complete KYC to reach lenders on Canton.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <a href="https://docs.canton.network" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#1A1A1A] text-xs text-[#DEDBC8]/50 hover:text-[#DEDBC8] transition-colors border border-[#DEDBC8]/5">
                Canton Docs <ExternalLink size={12} />
              </a>
            </div>
          </motion.div>
        )}

        {/* Base Card */}
        {walletsLinked && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-[#101010] rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] flex items-center justify-center shrink-0 border border-blue-500/10">
                <Link2 size={20} className="text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-[#E1E0CC]">Base Score</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300">ERC-8004</span>
                </div>
                {baseLoading ? <div className="flex items-center gap-2 text-[#DEDBC8]/30 text-sm"><Loader2 size={13} className="animate-spin" /> Fetching from Base...</div>
                  : baseData ? <div className="flex items-center gap-3">
                      <span className="font-black text-2xl text-gradient">{baseData.score}</span>
                      <span className="text-xs text-[#DEDBC8]/30">Last synced {new Date(baseData.timestamp * 1000).toLocaleDateString()}</span>
                      {baseData.tokenId > 0 && <a href={`https://sepolia.basescan.org/token/${import.meta.env.VITE_BADGE_ADDRESS}?a=${evmWallet?.address}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-300 hover:text-blue-200"><Award size={12} /> Badge #{baseData.tokenId} <ExternalLink size={10} /></a>}
                    </div>
                  : <p className="text-sm text-[#DEDBC8]/40">No Base score yet - sync your score to bridge it.</p>}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={() => evmWallet?.address && fetchBaseScore(evmWallet.address)} disabled={baseLoading}
                className="flex items-center gap-1.5 bg-[#1A1A1A] px-3 py-2 rounded-full text-xs text-[#DEDBC8]/50 hover:text-[#DEDBC8] transition-colors border border-[#DEDBC8]/5">
                {baseLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Sync
              </button>
              <button onClick={handleMintBadge} disabled={baseMinting || score === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#DEDBC8] text-black font-medium text-xs transition-all hover:gap-2 disabled:opacity-30">
                {baseMinting ? <Loader2 size={13} className="animate-spin" /> : <Award size={13} />}
                {baseData?.tokenId ? 'Update Badge' : 'Mint Badge'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Solana Card */}
        {walletsLinked && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
            className="bg-[#101010] rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] flex items-center justify-center shrink-0 border border-emerald-500/10">
                <Link2 size={20} className="text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-[#E1E0CC]">Solana Score</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300">Devnet</span>
                </div>
                {solanaLoading ? <div className="flex items-center gap-2 text-[#DEDBC8]/30 text-sm"><Loader2 size={13} className="animate-spin" /> Fetching from Solana...</div>
                  : solanaData ? <div className="flex items-center gap-3">
                      <span className="font-black text-2xl text-gradient">{solanaData.score}</span>
                      <span className="text-xs text-[#DEDBC8]/30">Last synced {new Date(solanaData.timestamp * 1000).toLocaleDateString()}</span>
                      {solanaData.tier > 0 && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#DEDBC8]/5 text-[#DEDBC8]/60">Tier {solanaData.tier}</span>}
                    </div>
                  : <p className="text-sm text-[#DEDBC8]/40">No Solana score yet - sync your score to bridge it.</p>}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={() => solanaWallet?.address && fetchSolanaScore(solanaWallet.address)} disabled={solanaLoading}
                className="flex items-center gap-1.5 bg-[#1A1A1A] px-3 py-2 rounded-full text-xs text-[#DEDBC8]/50 hover:text-[#DEDBC8] transition-colors border border-[#DEDBC8]/5">
                {solanaLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Sync
              </button>
              <button onClick={handleMintSolanaBadge} disabled={solanaMinting || score === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#DEDBC8] text-black font-medium text-xs transition-all hover:gap-2 disabled:opacity-30">
                {solanaMinting ? <Loader2 size={13} className="animate-spin" /> : <Award size={13} />} Mint Badge
              </button>
              <a href={`https://solscan.io/account/${solanaWallet?.address}?cluster=devnet`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#1A1A1A] text-xs text-[#DEDBC8]/50 hover:text-[#DEDBC8] transition-colors border border-[#DEDBC8]/5">
                <ExternalLink size={13} />
              </a>
            </div>
          </motion.div>
        )}

        {/* Literacy Modules */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-medium text-xl text-[#E1E0CC]">Financial Literacy Modules</h2>
              <p className="text-sm text-[#DEDBC8]/40 mt-1">Complete modules to boost your Layer 3 score on-chain</p>
            </div>
            <div className="bg-[#101010] px-3 py-1.5 rounded-full text-xs text-[#DEDBC8]/50 border border-[#DEDBC8]/5">
              Layer 3: <span className="text-[#DEDBC8] font-semibold">{layerScores[2]}</span> / 200
            </div>
          </div>
          <LiteracyModules />
        </motion.div>
      </div>
    </div>
  );
}

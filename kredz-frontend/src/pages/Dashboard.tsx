'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Lock, BookOpen, Shield, RefreshCw, Loader2, Link2, Award, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LiteracyModules } from '../components/LiteracyModules';
import { joinKredzContract } from '../midnight/contract';
import { toast } from '../components/Toast';
import { useBaseScore } from '../hooks/useBaseScore';
import { useSolanaScore } from '../hooks/useSolanaScore';

const TIER_LABELS = ['Anonymous', 'Pseudonymous', 'Full Compliance'];
const TIER_COLORS = ['text-slate-400', 'text-gold', 'text-yellow-300'];
const TIER_RANGES = ['0 – 400', '0 – 650', '0 – 1000'];
const TIER_MAX = [400, 650, 1000];

const LAYERS = [
  { icon: TrendingUp, label: 'On-Chain Signals', key: 0, max: 400, color: 'from-blue-500 to-cyan-400' },
  { icon: Lock, label: 'ZK-KYC Signals', key: 1, max: 400, color: 'from-accent to-gold' },
  { icon: BookOpen, label: 'Behavioral Literacy', key: 2, max: 200, color: 'from-green-500 to-emerald-400' },
];

function ScoreRing({ score, max }: { score: number; max: number }) {
  const r = 80;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(score / max, 1);
  const [animated, setAnimated] = useState(0);
  const ref = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimated(pct), 100);
    return () => clearTimeout(timeout);
  }, [pct]);

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg width="192" height="192" viewBox="0 0 192 192" className="-rotate-90">
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B56939" />
            <stop offset="100%" stopColor="#D4A853" />
          </linearGradient>
        </defs>
        <circle cx="96" cy="96" r={r} fill="none" strokeWidth="10" className="score-ring-track" />
        <circle
          ref={ref}
          cx="96" cy="96" r={r} fill="none" strokeWidth="10"
          className="score-ring-fill"
          strokeDasharray={circ}
          strokeDashoffset={circ - animated * circ}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatedNumber value={score} className="font-manrope font-black text-4xl text-gradient" />
        <span className="font-inter text-xs text-light/40 mt-1">KREDZ Score</span>
      </div>
    </div>
  );
}

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1500;
    const step = (end / duration) * 16;
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setDisplay(Math.floor(start));
      if (start >= end) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span className={className}>{display}</span>;
}

export default function Dashboard() {
  const { wallet, tier, score, layerScores, contractAddress, setScore, setLayerScores, evmWallet, solanaWallet, walletsLinked, setBaseScore, setBaseScoreTimestamp, setSolanaScore, setSolanaScoreTimestamp } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const { data: baseData, loading: baseLoading, minting: baseMinting, fetchScore: fetchBaseScore, mintBadge } = useBaseScore();
  const { data: solanaData, loading: solanaLoading, fetchScore: fetchSolanaScore } = useSolanaScore();
  const [solanaMinting, setSolanaMinting] = useState(false);

  // Fetch Base score on mount if wallets are linked
  useEffect(() => {
    if (walletsLinked && evmWallet?.address) {
      fetchBaseScore(evmWallet.address);
    }
  }, [walletsLinked, evmWallet?.address, fetchBaseScore]);

  // Fetch Solana score on mount if wallets are linked
  useEffect(() => {
    if (walletsLinked && solanaWallet?.address) {
      fetchSolanaScore(solanaWallet.address);
    }
  }, [walletsLinked, solanaWallet?.address, fetchSolanaScore]);

  // Sync baseScore into context when baseData changes
  useEffect(() => {
    if (baseData) {
      setBaseScore(baseData.score);
      setBaseScoreTimestamp(baseData.timestamp);
    }
  }, [baseData, setBaseScore, setBaseScoreTimestamp]);

  // Sync solanaScore into context when solanaData changes
  useEffect(() => {
    if (solanaData) {
      setSolanaScore(solanaData.score);
      setSolanaScoreTimestamp(solanaData.timestamp);
    }
  }, [solanaData, setSolanaScore, setSolanaScoreTimestamp]);

  async function refreshScore() {
    if (!wallet || !contractAddress) return;
    setRefreshing(true);
    try {
      const api = await joinKredzContract(wallet, contractAddress);
      const state = await api.getContractState();
      const t = state.data.tier as 0 | 1 | 2;
      const base: [number, number, number] = [120, 0, layerScores[2]];
      if (t >= 1) base[1] = 180;
      if (t >= 2) { base[0] = 200; base[1] = 280; }
      setLayerScores(base);
      setScore(base.reduce((a, b) => a + b, 0));
      toast('Score refreshed from chain', 'success');
      // Also refresh Base and Solana scores
      if (walletsLinked && evmWallet?.address) await fetchBaseScore(evmWallet.address);
      if (walletsLinked && solanaWallet?.address) await fetchSolanaScore(solanaWallet.address);
    } catch {
      toast('Failed to refresh score', 'error');
    } finally {
      setRefreshing(false);
    }
  }

  async function handleMintBadge() {
    if (!evmWallet?.address) return;
    try {
      await mintBadge(evmWallet.address, score, tier ?? 0, Math.floor(Date.now() / 1000));
      toast('Score badge minted on Base!', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Mint failed', 'error');
    }
  }

  async function handleMintSolanaBadge() {
    if (!solanaWallet?.address) return;
    setSolanaMinting(true);
    try {
      // In production: call relayer API to get Ed25519 signature, then use mintBadge()
      // For now: simulate minting with a toast
      await new Promise(r => setTimeout(r, 1500));
      toast('Solana badge minting requires relayer signature. Coming soon!', 'info');
      // await mintBadge(solanaWallet.address, score, tier ?? 0, Math.floor(Date.now() / 1000), relayerSig, relayerPubkey);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Mint failed', 'error');
    } finally {
      setSolanaMinting(false);
    }
  }

  const tierIdx = tier ?? 0;
  const maxScore = TIER_MAX[tierIdx];

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 pb-16 relative bg-transparent">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
          <div>
            <p className="font-inter text-sm text-accent uppercase tracking-widest mb-1">Your Dashboard</p>
            <h1 className="font-manrope font-extrabold text-3xl md:text-4xl text-light">KREDZ Score</h1>
            <p className="font-inter text-sm text-light/40 mt-1 font-mono truncate max-w-xs">
              {contractAddress ? `Contract: ${contractAddress.slice(0, 20)}…` : 'No contract deployed'}
            </p>
          </div>
          <button
            onClick={refreshScore}
            disabled={refreshing}
            className="flex items-center gap-2 glass px-4 py-2.5 rounded-xl text-sm font-inter text-light/70 hover:text-light transition-colors"
          >
            {refreshing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            Refresh from Chain
          </button>
        </motion.div>

        {/* Score + Tier */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Score ring */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="glass rounded-3xl p-8 flex flex-col items-center gap-4 md:col-span-1">
            <ScoreRing score={score} max={maxScore} />
            <div className="text-center">
              <div className={`font-manrope font-bold text-lg ${TIER_COLORS[tierIdx]}`}>
                {TIER_LABELS[tierIdx]}
              </div>
              <div className="font-inter text-xs text-light/40 mt-1">Score Range: {TIER_RANGES[tierIdx]}</div>
            </div>
            <div className="w-full glass rounded-xl p-3 flex items-center gap-2">
              <Shield size={14} className="text-accent shrink-0" />
              <span className="text-xs font-inter text-light/50">
                Tier {tierIdx} — ZK-verified on Midnight
              </span>
            </div>
          </motion.div>

          {/* Layer breakdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass rounded-3xl p-8 md:col-span-2 flex flex-col gap-6">
            <h2 className="font-manrope font-bold text-lg text-light">Score Breakdown</h2>
            {LAYERS.map(({ icon: Icon, label, key, max, color }, i) => {
              const val = layerScores[key];
              const pct = Math.min((val / max) * 100, 100);
              return (
                <motion.div key={label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon size={15} className="text-gold" />
                      <span className="font-inter text-sm text-light/80">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-manrope font-bold text-light">{val}</span>
                      <span className="font-inter text-xs text-light/30">/ {max}</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-light/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1.2, delay: 0.4 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className={`h-full rounded-full bg-gradient-to-r ${color}`}
                    />
                  </div>
                </motion.div>
              );
            })}

            <div className="mt-auto pt-4 border-t border-light/5 flex items-center justify-between">
              <span className="font-inter text-sm text-light/40">Total Score</span>
              <div className="flex items-baseline gap-1">
                <span className="font-manrope font-black text-2xl text-gradient">{score}</span>
                <span className="font-inter text-sm text-light/30">/ {maxScore}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Base Score Card — shown when wallets are linked */}
        {walletsLinked && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="glass rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Link2 size={20} className="text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-manrope font-bold text-light">Base Score</span>
                  <span className="text-[10px] font-inter font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/20 text-blue-300">
                    ERC-8004
                  </span>
                </div>
                {baseLoading ? (
                  <div className="flex items-center gap-2 text-light/40 text-sm font-inter">
                    <Loader2 size={13} className="animate-spin" /> Fetching from Base…
                  </div>
                ) : baseData ? (
                  <div className="flex items-center gap-3">
                    <span className="font-manrope font-black text-2xl text-gradient">{baseData.score}</span>
                    <span className="font-inter text-xs text-light/40">
                      Last synced {new Date(baseData.timestamp * 1000).toLocaleDateString()}
                    </span>
                    {baseData.tokenId > 0 && (
                      <a href={`https://sepolia.basescan.org/token/${import.meta.env.VITE_BADGE_ADDRESS}?a=${evmWallet?.address}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-inter text-blue-300 hover:text-blue-200 transition-colors">
                        <Award size={12} /> Badge #{baseData.tokenId} <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="font-inter text-sm text-light/40">
                    No Base score yet — sync your score to bridge it.
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => evmWallet?.address && fetchBaseScore(evmWallet.address)}
                disabled={baseLoading}
                className="flex items-center gap-1.5 glass px-3 py-2 rounded-xl text-xs font-inter text-light/60 hover:text-light transition-colors"
              >
                {baseLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                Sync
              </button>
              <button
                onClick={handleMintBadge}
                disabled={baseMinting || score === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-dark font-manrope font-semibold text-xs transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {baseMinting ? <Loader2 size={13} className="animate-spin" /> : <Award size={13} />}
                {baseData?.tokenId ? 'Update Badge' : 'Mint Badge'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Solana Score Card — shown when wallets are linked */}
        {walletsLinked && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
            className="glass rounded-3xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-teal-500/20 border border-green-500/20 flex items-center justify-center shrink-0">
                <Link2 size={20} className="text-green-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-manrope font-bold text-light">Solana Score</span>
                  <span className="text-[10px] font-inter font-semibold px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/20 text-green-300">
                    Devnet
                  </span>
                </div>
                {solanaLoading ? (
                  <div className="flex items-center gap-2 text-light/40 text-sm font-inter">
                    <Loader2 size={13} className="animate-spin" /> Fetching from Solana…
                  </div>
                ) : solanaData ? (
                  <div className="flex items-center gap-3">
                    <span className="font-manrope font-black text-2xl text-gradient">{solanaData.score}</span>
                    <span className="font-inter text-xs text-light/40">
                      Last synced {new Date(solanaData.timestamp * 1000).toLocaleDateString()}
                    </span>
                    {solanaData.tier > 0 && (
                      <span className="text-[10px] font-inter font-semibold px-2 py-0.5 rounded-full bg-gold/15 border border-gold/20 text-gold">
                        Tier {solanaData.tier}
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="font-inter text-sm text-light/40">
                    No Solana score yet — sync your score to bridge it.
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => solanaWallet?.address && fetchSolanaScore(solanaWallet.address)}
                disabled={solanaLoading}
                className="flex items-center gap-1.5 glass px-3 py-2 rounded-xl text-xs font-inter text-light/60 hover:text-light transition-colors"
              >
                {solanaLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                Sync
              </button>
              <button
                onClick={handleMintSolanaBadge}
                disabled={solanaMinting || score === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-teal-400 text-dark font-manrope font-semibold text-xs transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {solanaMinting ? <Loader2 size={13} className="animate-spin" /> : <Award size={13} />}
                Mint Badge
              </button>
              <a
                href={`https://solscan.io/account/${solanaWallet?.address}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-xs font-inter text-light/60 hover:text-light transition-colors"
              >
                <ExternalLink size={13} />
              </a>
            </div>
          </motion.div>
        )}

        {/* Literacy Modules */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-manrope font-bold text-xl text-light">Financial Literacy Modules</h2>
              <p className="font-inter text-sm text-light/40 mt-1">Complete modules to boost your Layer 3 score on-chain</p>
            </div>
            <div className="glass px-3 py-1.5 rounded-full text-xs font-inter text-light/60">
              Layer 3: <span className="text-gold font-semibold">{layerScores[2]}</span> / 200
            </div>
          </div>
          <LiteracyModules />
        </motion.div>
      </div>
    </div>
  );
}

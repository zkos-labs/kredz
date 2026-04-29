import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Lock, BookOpen, Shield, RefreshCw, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LiteracyModules } from '../components/LiteracyModules';
import { joinKredzContract } from '../midnight/contract';
import { toast } from '../components/Toast';

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
  const { wallet, tier, score, layerScores, contractAddress, setScore, setLayerScores } = useApp();
  const [refreshing, setRefreshing] = useState(false);

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
    } catch {
      toast('Failed to refresh score', 'error');
    } finally {
      setRefreshing(false);
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

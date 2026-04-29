import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Zap, BookOpen, Lock, TrendingUp, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BlurIn } from '../components/BlurIn';
import { toast } from '../components/Toast';

const TIERS = [
  {
    id: 0, name: 'Anonymous', range: '0 – 400',
    badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    features: ['On-chain wallet analysis', 'Transaction history scoring', 'DeFi interaction tracking', 'Micro-lending access'],
    proof: 'No personal data required',
  },
  {
    id: 1, name: 'Pseudonymous', range: '0 – 650',
    badge: 'bg-accent/20 text-gold border-accent/30',
    features: ['All Tier 0 features', 'ZK-proof of one attribute', 'Income or age attestation', 'Mid-tier lending access'],
    proof: 'Prove one attribute via ZK',
    highlight: true,
  },
  {
    id: 2, name: 'Full Compliance', range: '0 – 1000',
    badge: 'bg-gold/20 text-yellow-300 border-gold/30',
    features: ['All Tier 1 features', 'Full ZK-KYC bundle', 'Institutional liquidity pools', 'Maximum score range'],
    proof: 'Full KYC via ZK circuits',
  },
];

const LAYERS = [
  { icon: TrendingUp, title: 'On-Chain Signals', desc: 'Wallet age, DeFi interactions, repayment history across Midnight & Cardano.', weight: '40%' },
  { icon: Lock, title: 'ZK-KYC Signals', desc: 'Real-world attributes proven via Midnight ZK-circuits — income, identity — without raw data exposure.', weight: '40%' },
  { icon: BookOpen, title: 'Behavioral Literacy', desc: 'Earn points completing verified financial literacy modules on DeFi mechanics and risk management.', weight: '20%' },
];

const STATS = [
  { value: '1,000', label: 'Max Score', icon: TrendingUp },
  { value: '3', label: 'Privacy Tiers', icon: Shield },
  { value: '0', label: 'Raw Data Exposed', icon: Lock },
  { value: '5+', label: 'Literacy Modules', icon: BookOpen },
];

export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.7], [0, -80]);
  const { wallet, connect, isConnecting } = useApp();
  const navigate = useNavigate();

  async function handleLaunch() {
    if (wallet) { navigate('/app'); return; }
    try {
      await connect();
      navigate('/app');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      toast(msg === 'LACE_NOT_FOUND'
        ? 'Please install Lace Beta Wallet for Midnight Network'
        : 'Connection failed. Please try again.', 'error');
    }
  }

  return (
    <div className="min-h-screen bg-transparent">

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">

        {/* Hero content */}
        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-[10] text-center max-w-4xl mx-auto pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-light/80 mb-8 border border-white/10"
            style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}
          >
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-inter">Midnight Mainnet Live</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1 }}
            className="font-manrope font-extrabold text-5xl md:text-7xl lg:text-[5.5rem] leading-[0.93] tracking-tight text-white mb-6"
          >
            The Credit Layer<br />
            for the{' '}
            <span className="text-gradient">Privacy Web</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="font-inter text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Privacy-preserving AI credit scoring on Midnight. Prove your creditworthiness
            without revealing your financial data — powered by Zero-Knowledge proofs.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={handleLaunch}
              disabled={isConnecting}
              className="glow-btn flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-accent to-gold text-dark font-manrope font-bold text-base transition-all hover:scale-105 disabled:opacity-60"
            >
              {isConnecting ? 'Connecting…' : 'Launch App'}
              <ArrowRight size={18} />
            </button>
            <a href="#how-it-works"
              className="flex items-center gap-2 px-8 py-4 rounded-full border border-white/15 text-white/70 hover:text-white hover:border-white/30 font-manrope font-semibold text-base transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)' }}>
              Learn More
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.6 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
          >
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="rounded-2xl p-4 text-center border border-white/8"
                style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)' }}>
                <Icon size={18} className="text-gold mx-auto mb-2 opacity-70" />
                <div className="font-manrope font-bold text-2xl text-gradient">{value}</div>
                <div className="font-inter text-xs text-white/40 mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[10] flex flex-col items-center gap-2"
        >
          <span className="font-inter text-xs text-white/30 tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent"
          />
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="relative px-6 md:px-12 py-28 max-w-6xl mx-auto">
        <BlurIn className="text-center mb-16">
          <p className="font-inter text-sm text-accent uppercase tracking-widest mb-3">Three-Layer Scoring</p>
          <h2 className="font-manrope font-extrabold text-4xl md:text-5xl text-white">How KREDZ Scores You</h2>
          <p className="font-inter text-white/40 mt-4 max-w-xl mx-auto">
            A single KREDZ Score (0–1000) fused from three distinct signal layers, updated continuously.
          </p>
        </BlurIn>
        <div className="grid md:grid-cols-3 gap-6">
          {LAYERS.map(({ icon: Icon, title, desc, weight }, i) => (
            <BlurIn key={title} delay={i * 0.15}>
              <div className="glass rounded-3xl p-8 h-full flex flex-col gap-4 hover:border-accent/30 transition-all hover:scale-[1.02]">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-gold/10 flex items-center justify-center">
                  <Icon size={22} className="text-gold" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-manrope font-bold text-lg text-white">Layer {i + 1}</h3>
                    <span className="text-xs font-inter text-accent bg-accent/10 px-2 py-1 rounded-full">{weight}</span>
                  </div>
                  <p className="font-manrope font-semibold text-white/90 mb-2">{title}</p>
                  <p className="font-inter text-sm text-white/50 leading-relaxed">{desc}</p>
                </div>
              </div>
            </BlurIn>
          ))}
        </div>
      </section>

      {/* ── TIERS ── */}
      <section id="tiers" className="relative px-6 md:px-12 py-28 max-w-6xl mx-auto">
        <BlurIn className="text-center mb-16">
          <p className="font-inter text-sm text-accent uppercase tracking-widest mb-3">Privacy Tiers</p>
          <h2 className="font-manrope font-extrabold text-4xl md:text-5xl text-white">Choose Your Privacy Level</h2>
          <p className="font-inter text-white/40 mt-4 max-w-xl mx-auto">
            Midnight's selective disclosure lets you prove creditworthiness at your own comfort level.
          </p>
        </BlurIn>
        <div className="grid md:grid-cols-3 gap-6">
          {TIERS.map((tier, i) => (
            <BlurIn key={tier.id} delay={i * 0.15}>
              <div className={`glass rounded-3xl p-8 h-full flex flex-col gap-5 relative overflow-hidden transition-all hover:scale-[1.02] ${tier.highlight ? 'border-accent/40' : ''}`}>
                {tier.highlight && (
                  <div className="absolute top-4 right-4 text-xs font-inter font-semibold bg-gradient-to-r from-accent to-gold text-dark px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div>
                  <span className={`inline-block text-xs font-inter font-semibold px-3 py-1 rounded-full border mb-3 ${tier.badge}`}>
                    Tier {tier.id}
                  </span>
                  <h3 className="font-manrope font-bold text-2xl text-white">{tier.name}</h3>
                  <div className="text-gradient font-manrope font-extrabold text-3xl mt-1">{tier.range}</div>
                  <p className="font-inter text-xs text-white/30 mt-1">Score Range</p>
                </div>
                <ul className="flex flex-col gap-2 flex-1">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm font-inter text-white/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="glass rounded-xl p-3 flex items-center gap-2">
                  <Shield size={14} className="text-accent shrink-0" />
                  <span className="text-xs font-inter text-white/50">{tier.proof}</span>
                </div>
              </div>
            </BlurIn>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative px-6 md:px-12 py-28 overflow-hidden">
        <BlurIn className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Users size={40} className="text-gold mx-auto mb-6 opacity-60" />
            <h2 className="font-manrope font-extrabold text-4xl md:text-5xl text-white mb-4 leading-tight">
              Build Your Credit Score<br />
              <span className="text-gradient">Without Sacrificing Privacy</span>
            </h2>
            <p className="font-inter text-white/40 mb-10 max-w-lg mx-auto leading-relaxed">
              Connect your Lace wallet, select your privacy tier, and start building your KREDZ Score on Midnight today.
            </p>
            <button
              onClick={handleLaunch}
              disabled={isConnecting}
              className="glow-btn inline-flex items-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-accent to-gold text-dark font-manrope font-bold text-base transition-all hover:scale-105"
            >
              {isConnecting ? 'Connecting…' : 'Get Your Score'}
              <Zap size={18} />
            </button>
          </div>
        </BlurIn>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 md:px-12 py-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-accent to-gold flex items-center justify-center">
              <span className="text-dark font-black text-xs">K</span>
            </div>
            <span className="font-manrope font-bold text-white/80">KREDZ</span>
          </div>
          <p className="font-inter text-xs text-white/25">
            Built on Midnight Network · Privacy-preserving credit scoring · © 2026 KREDZ
          </p>
          <div className="flex gap-6">
            {['Docs', 'GitHub', 'Discord'].map(l => (
              <a key={l} href="#" className="font-inter text-xs text-white/35 hover:text-white/70 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

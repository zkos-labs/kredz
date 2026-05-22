import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Zap, BookOpen, TrendingUp, Users, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WordsPullUp } from '../components/WordsPullUp';
import { toast } from '../components/Toast';

const TIERS = [
  {
    id: 0, name: 'Anonymous', range: '0-400',
    features: ['On-chain wallet analysis', 'Transaction history scoring', 'DeFi interaction tracking', 'Literacy modules'],
    proof: 'No personal data required',
    networks: 'Midnight, Base, Solana',
  },
  {
    id: 1, name: 'Pseudonymous', range: '0-650',
    features: ['All Tier 0 features', 'ZK-proof of one attribute', 'Income or age attestation', 'Mid-tier lending access'],
    proof: 'Prove one attribute via ZK',
    networks: 'Midnight, Base, Solana',
    highlight: true,
  },
  {
    id: 2, name: 'Full Compliance', range: '0-1000',
    features: ['All Tier 1 features', 'Full ZK-KYC bundle', 'Canton institutional lenders', 'MiCA / GENIUS Act compliant'],
    proof: 'Full KYC via ZK circuits',
    networks: 'Midnight, Canton, Base, Solana',
  },
];

const LAYERS = [
  { icon: TrendingUp, title: 'On-Chain Signals', desc: 'Wallet age, DeFi interactions, repayment history across Midnight and Cardano.', weight: '40%' },
  { icon: Shield, title: 'ZK-KYC Signals', desc: 'Real-world attributes proven via Midnight ZK-circuits. Income, identity. Without raw data exposure.', weight: '40%' },
  { icon: BookOpen, title: 'Behavioral Literacy', desc: 'Earn points completing verified financial literacy modules on DeFi mechanics and risk management.', weight: '20%' },
];

const NETWORKS = [
  { name: 'Midnight', role: 'Credit Identity', desc: 'ZK proofs protect your data. Selective disclosure.', dot: 'bg-purple-400' },
  { name: 'Canton', role: 'Institutional Lenders', desc: 'Sub-transaction privacy. Regulated lenders query scores confidentially.', dot: 'bg-indigo-400' },
  { name: 'Base', role: 'EVM DeFi', desc: 'ERC-8004 SBT badge. Any lending protocol reads your score on-chain.', dot: 'bg-blue-400' },
  { name: 'Solana', role: 'SVM DeFi', desc: 'ScoreBadge PDA with Ed25519 verification.', dot: 'bg-emerald-400' },
];

export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, -60]);
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
    <div className="min-h-screen bg-black text-[#E1E0CC]">

      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative h-screen p-4 md:p-6">
        <div className="relative h-full rounded-2xl md:rounded-[2rem] overflow-hidden bg-black">

          {/* Video background */}
          <video
            autoPlay loop muted playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source src="https://res.cloudinary.com/dfonotyfb/video/upload/v1775585556/dds3_1_rqhg7x.mp4" type="video/mp4" />
          </video>

          {/* Noise overlay */}
          <div className="noise-overlay opacity-[0.6]" />

          {/* Gradient overlay */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-transparent to-black/70" />

          {/* Navbar pill */}
          <nav className="absolute top-0 left-1/2 -translate-x-1/2 z-20 bg-black rounded-b-2xl md:rounded-b-3xl px-4 py-2 md:px-8">
            <div className="flex items-center gap-3 sm:gap-6 md:gap-10 lg:gap-12">
              {['How It Works', 'Networks', 'Tiers'].map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  className="text-[10px] sm:text-xs md:text-sm font-medium transition-colors duration-200 hover:text-[#E1E0CC]"
                  style={{ color: 'rgba(225, 224, 204, 0.7)' }}>
                  {item}
                </a>
              ))}
            </div>
          </nav>

          {/* Hero content */}
          <motion.div
            style={{ opacity: heroOpacity, y: heroY }}
            className="absolute inset-0 z-10 flex flex-col justify-end p-6 md:p-12 pb-12 md:pb-16"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
              {/* Heading */}
              <div className="md:col-span-8">
                <WordsPullUp
                  text="The Credit Layer"
                  className="text-[18vw] sm:text-[16vw] md:text-[14vw] lg:text-[12vw] xl:text-[11vw] font-medium leading-[0.88] tracking-[-0.05em] text-[#E1E0CC]"
                />
              </div>

              {/* Text + CTA */}
              <div className="md:col-span-4 flex flex-col justify-end gap-4 md:gap-6 pb-1">
                <motion.p
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="text-[#DEDBC8]/70 text-xs md:text-sm leading-[1.4]"
                >
                  Privacy-preserving AI credit scoring across Midnight, Canton, Base, and Solana. Build your score once. Use it everywhere. ZK proofs protect your data. Sub-transaction privacy protects your lenders.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="group"
                >
                  <button
                    onClick={handleLaunch}
                    disabled={isConnecting}
                    className="flex items-center gap-2 pl-6 pr-2 py-2.5 md:py-3 rounded-full bg-[#DEDBC8] text-black font-medium text-sm md:text-base transition-all hover:gap-3 disabled:opacity-50"
                  >
                    {isConnecting ? 'Connecting...' : 'Launch App'}
                    <span className="bg-black rounded-full w-9 h-9 md:w-10 md:h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ArrowRight size={14} className="text-[#E1E0CC]" />
                    </span>
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
          >
            <span className="text-[10px] text-[#DEDBC8]/30 tracking-[0.2em] uppercase">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-px h-8 bg-gradient-to-b from-[#DEDBC8]/30 to-transparent"
            />
          </motion.div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="relative px-6 md:px-12 py-28 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[10px] sm:text-xs text-[#DEDBC8] uppercase tracking-[0.2em] mb-3">Three-Layer Scoring</p>
          <WordsPullUp
            text="How KREDZ Scores You"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-[#E1E0CC] leading-[0.95]"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-[#DEDBC8]/50 mt-4 max-w-xl mx-auto text-sm md:text-base"
          >
            A single KREDZ Score (0-1000) fused from three distinct signal layers, updated continuously.
          </motion.p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {LAYERS.map(({ icon: Icon, title, desc, weight }, i) => (
            <motion.div key={title}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#101010] rounded-3xl p-6 md:p-8 flex flex-col gap-4 hover:bg-[#151515] transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#DEDBC8]/10 to-[#DEDBC8]/5 flex items-center justify-center">
                <Icon size={22} className="text-[#DEDBC8]" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-lg text-[#E1E0CC]">Layer {i + 1}</h3>
                  <span className="text-xs bg-[#DEDBC8]/10 text-[#DEDBC8] px-2 py-1 rounded-full">{weight}</span>
                </div>
                <p className="font-semibold text-[#E1E0CC] mb-2">{title}</p>
                <p className="text-sm text-[#DEDBC8]/50 leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ FOUR NETWORKS ═══ */}
      <section id="networks" className="relative px-6 md:px-12 py-28 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[10px] sm:text-xs text-[#DEDBC8] uppercase tracking-[0.2em] mb-3">One Score, Four Networks</p>
          <WordsPullUp
            text="Portable Across the Multi-Chain Web"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-[#E1E0CC] leading-[0.95]"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-[#DEDBC8]/50 mt-4 max-w-2xl mx-auto text-sm md:text-base"
          >
            Build your credit identity once on Midnight. Your score flows to wherever lenders operate.
          </motion.p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {NETWORKS.map((net, i) => (
            <motion.div key={net.name}
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#101010] rounded-3xl p-5 md:p-6 flex flex-col gap-3 hover:bg-[#151515] transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${net.dot}`} />
                <span className="font-medium text-xs uppercase tracking-wider text-[#E1E0CC]">{net.name}</span>
              </div>
              <p className="text-xs text-[#DEDBC8]/60 leading-relaxed flex-1">{net.desc}</p>
              <span className="text-[10px] text-[#DEDBC8]/30">{net.role}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ TIERS ═══ */}
      <section id="tiers" className="relative px-6 md:px-12 py-28 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[10px] sm:text-xs text-[#DEDBC8] uppercase tracking-[0.2em] mb-3">Privacy Tiers</p>
          <WordsPullUp
            text="Choose Your Privacy Level"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-[#E1E0CC] leading-[0.95]"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-[#DEDBC8]/50 mt-4 max-w-xl mx-auto text-sm md:text-base"
          >
            Selective disclosure lets you prove creditworthiness at your own comfort level.
          </motion.p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {TIERS.map((tier, i) => (
            <motion.div key={tier.id}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className={`bg-[#101010] rounded-3xl p-6 md:p-8 flex flex-col gap-5 relative overflow-hidden hover:bg-[#151515] transition-colors ${tier.highlight ? 'ring-1 ring-[#DEDBC8]/20' : ''}`}
            >
              {tier.highlight && (
                <div className="absolute top-4 right-4 text-xs font-semibold bg-[#DEDBC8] text-black px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div>
                <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-[#DEDBC8]/10 text-[#DEDBC8] border border-[#DEDBC8]/10 mb-3">
                  Tier {tier.id}
                </span>
                <h3 className="font-semibold text-2xl text-[#E1E0CC]">{tier.name}</h3>
                <div className="text-[#DEDBC8] font-extrabold text-3xl mt-1">{tier.range}</div>
                <p className="text-xs text-[#DEDBC8]/30 mt-1">Score Range</p>
              </div>
              <ul className="flex flex-col gap-2 flex-1">
                {tier.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#DEDBC8]/60">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#DEDBC8] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="bg-[#1A1A1A] rounded-xl p-3 flex items-center gap-2">
                <Shield size={14} className="text-[#DEDBC8]/50 shrink-0" />
                <span className="text-xs text-[#DEDBC8]/50">{tier.proof}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe size={11} className="text-[#DEDBC8]/20" />
                <p className="text-[10px] text-[#DEDBC8]/25">{tier.networks}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative px-6 md:px-12 py-28 bg-noise">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <Users size={40} className="text-[#DEDBC8] mx-auto mb-6 opacity-40" />
          <WordsPullUp
            text="Build Your Credit Score"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-[#E1E0CC] leading-[0.95]"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-[#DEDBC8]/50 mt-4 max-w-lg mx-auto text-sm md:text-base"
          >
            <span className="text-[#DEDBC8]">Without Sacrificing Privacy</span>
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-[#DEDBC8]/40 mt-4 mb-10 max-w-lg mx-auto text-sm leading-relaxed"
          >
            Connect your Lace wallet, link Base, Solana, Canton, select your tier, and start building your KREDZ Score, provable across four networks.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.5 }} className="group inline-flex"
          >
            <button
              onClick={handleLaunch}
              disabled={isConnecting}
              className="flex items-center gap-2 pl-6 pr-2 py-3 rounded-full bg-[#DEDBC8] text-black font-medium text-base transition-all hover:gap-3 disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Get Your Score'}
              <span className="bg-black rounded-full w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap size={15} className="text-[#E1E0CC]" />
              </span>
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="px-6 md:px-12 py-10 border-t border-[#DEDBC8]/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#DEDBC8] to-[#DEDBC8]/50 flex items-center justify-center">
              <span className="text-black font-black text-xs">K</span>
            </div>
            <span className="font-bold text-[#E1E0CC]">KREDZ</span>
          </div>
          <p className="text-xs text-[#DEDBC8]/25">
            Built on Midnight, Canton, Base, Solana, privacy-preserving credit scoring, &copy; 2026 KREDZ
          </p>
          <div className="flex gap-6">
            {['Docs', 'GitHub', 'Discord'].map(l => (
              <a key={l} href="#" className="text-xs text-[#DEDBC8]/35 hover:text-[#DEDBC8]/70 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

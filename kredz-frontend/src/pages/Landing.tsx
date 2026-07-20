import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Zap, BookOpen, TrendingUp, Users, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WordsPullUp } from '../components/WordsPullUp';
import { TypewriterSequence } from '../components/TypewriterSequence';
import { NarrativeBlock } from '../components/NarrativeBlock';
import { FieldReportCarousel } from '../components/FieldReportCarousel';
import { toast } from '../components/Toast';

// ── Chapter 1: The Hook (typewriter lines for hero) ──
const HERO_LINES = [
  { text: 'You have built something real.', pause: 900 },
  { text: 'You have paid every loan on time.', pause: 700 },
  { text: 'You have never missed a payment.', pause: 800 },
  { text: 'Not once.', pause: 1200 },
  { text: 'And yet.', pause: 1500 },
  { text: 'When you apply for credit...', pause: 600 },
  { text: 'they ask for your entire financial life.', pause: 800 },
  { text: 'Every transaction.', pause: 500 },
  { text: 'Every balance.', pause: 500 },
  { text: 'Every wallet you ever touched.', pause: 1000 },
  { text: 'You hesitate.', pause: 800 },
  { text: 'You are not hiding anything.', backspaces: [{ word: 'hiding', replacement: 'just not interested in being naked' }], pause: 1500 },
  { text: 'What if you could prove your credit...', pause: 600 },
  { text: 'without revealing your credit.', pause: 1000 },
  { text: 'What if the math spoke for you.', pause: 700 },
  { text: 'What if the proof was enough.', pause: 1200 },
];

// ── Chapter 5: Field Reports ──
const FIELD_REPORTS = [
  {
    quote: 'A lending protocol on Base asked for my entire wallet history. I said no. I showed them my KREDZ proof instead. Approved in twelve seconds.',
    attribution: 'DeFi Power User',
    context: 'Tier 1 / Base Sepolia',
  },
  {
    quote: 'Three years of DeFi. Hundreds of loans. Zero defaults. Traditional credit score: nonexistent. KREDZ score: 847. Guess which one the Canton lender accepted.',
    attribution: 'Yield Strategist',
    context: 'Tier 2 / Canton + Base',
  },
  {
    quote: 'I was Tier 0 for six months. Anonymous proof, no data shared. When I needed a larger line, I upgraded to Tier 2 in one click. Same score. Institutional ready. Same me.',
    attribution: 'Privacy Advocate',
    context: 'Tier 0 → Tier 2 / Midnight',
  },
  {
    quote: 'My Cardano wallet history finally matters. Five years of staking. Hundreds of transactions. All invisible to lenders. Until KREDZ.',
    attribution: 'Cardano OG',
    context: 'Tier 1 / Cardano + Midnight',
  },
];

const TIERS = [
  {
    id: 0, name: 'Anonymous', range: '0-400',
    features: ['On-chain wallet analysis', 'Transaction history scoring', 'DeFi interaction tracking', 'Literacy modules'],
    proof: 'No personal data required',
    networks: 'Midnight, Base, Solana, Cardano',
  },
  {
    id: 1, name: 'Pseudonymous', range: '0-650',
    features: ['All Tier 0 features', 'ZK-proof of one attribute', 'Income or age attestation', 'Mid-tier lending access'],
    proof: 'Prove one attribute via ZK',
    networks: 'Midnight, Base, Solana, Cardano',
    highlight: true,
  },
  {
    id: 2, name: 'Full Compliance', range: '0-1000',
    features: ['All Tier 1 features', 'Full ZK-KYC bundle', 'Canton institutional lenders', 'MiCA / GENIUS Act compliant'],
    proof: 'Full KYC via ZK circuits',
    networks: 'Midnight, Canton, Base, Solana, Cardano',
  },
];

const LAYERS = [
  { icon: TrendingUp, title: 'On-Chain Signals', desc: 'Wallet age, DeFi interactions, repayment history across Midnight, Canton, Base, Solana, and Cardano.', weight: '40%' },
  { icon: Shield, title: 'ZK-KYC Signals', desc: 'Real-world attributes proven via Midnight ZK-circuits. Income, identity. Without raw data exposure.', weight: '40%' },
  { icon: BookOpen, title: 'Behavioral Literacy', desc: 'Earn points completing verified financial literacy modules on DeFi mechanics and risk management.', weight: '20%' },
];

const NETWORKS = [
  { name: 'Midnight', role: 'Credit Identity', desc: 'ZK proofs protect your data. Selective disclosure.', dot: 'bg-purple-400' },
  { name: 'Canton', role: 'Institutional Lenders', desc: 'DAML smart contracts. Sub-transaction privacy. Regulated lenders query scores confidentially via the Canton ledger API.', dot: 'bg-indigo-400' },
  { name: 'Base', role: 'EVM DeFi', desc: 'ERC-8004 SBT badge. Any lending protocol reads your score on-chain.', dot: 'bg-blue-400' },
  { name: 'Solana', role: 'SVM DeFi', desc: 'ScoreBadge PDA with Ed25519 verification.', dot: 'bg-emerald-400' },
  { name: 'Cardano', role: 'Native Chain', desc: 'Midnight partner chain. Blockfrost indexer for wallet history analysis.', dot: 'bg-blue-500' },
];

export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, -60]);
  const { wallet, connect, isConnecting } = useApp();
  const navigate = useNavigate();
  const [typewriterDone, setTypewriterDone] = useState(false);

  async function handleLaunch() {
    if (wallet) { navigate('/app'); return; }
    try {
      await connect();
      navigate('/app');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      toast(msg === 'ONEM_NOT_FOUND'
        ? 'Please install the 1AM wallet for Midnight Network'
        : 'Connection failed. Please try again.', 'error');
    }
  }

  return (
    <div className="min-h-screen bg-black text-[#E1E0CC]">

      {/* ═══ CHAPTER 1: THE HOOK ═══ */}
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

          {/* Hero content */}
          <motion.div
            style={{ opacity: heroOpacity, y: heroY }}
            className="absolute inset-0 z-10 flex flex-col justify-end p-4 md:p-12 pb-16 md:pb-16"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
              {/* Heading */}
              <div className="md:col-span-8">
                <WordsPullUp
                  text="The Credit Layer"
                  className="text-[16vw] sm:text-[14vw] md:text-[12vw] lg:text-[11vw] xl:text-[10vw] font-medium leading-[0.88] tracking-[-0.05em] text-[#E1E0CC]"
                />
              </div>

              {/* Narrative typewriter + CTA */}
              <div className="md:col-span-4 flex flex-col justify-end gap-3 md:gap-4 pb-1">
                <div className="min-h-[140px] md:min-h-[180px]">
                  <TypewriterSequence
                    lines={HERO_LINES}
                    onComplete={() => setTypewriterDone(true)}
                    className="text-[#DEDBC8]/70 text-xs md:text-sm leading-[1.5]"
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={typewriterDone ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
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

      {/* ═══ CHAPTER 2: THE ESCALATION ═══ */}
      <section className="relative px-4 md:px-12 py-16 md:py-24 max-w-4xl mx-auto">
        <NarrativeBlock
          paragraphs={[
            'You tried to do it the old way.',
            'You uploaded bank statements. Tax returns. Pay stubs.',
            'You waited two weeks for a credit decision.',
            'You got rejected because the algorithm did not understand your yield strategy.',
            'You tried to explain that your net worth is onchain.',
            'They asked for a PDF.',
            'They asked for a PDF of your wallet.',
            'You realized then: the bridge does not exist.',
            'Either you stay anonymous and untrusted.',
            'Or you expose everything and hope they do not misuse it.',
            'There is no middle ground.',
            'Or there was not.',
            'Until now.',
          ]}
          className="text-center"
          paragraphClassName="text-[#DEDBC8]/60 text-base md:text-lg leading-relaxed mb-3"
          staggerDelay={0.1}
        />
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="relative px-4 md:px-12 py-16 md:py-28 max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-16">
          <p className="text-[10px] sm:text-xs text-[#DEDBC8] uppercase tracking-[0.2em] mb-3">Three-Layer Scoring</p>
          <WordsPullUp
            text="How Your Score Is Built"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-[#E1E0CC] leading-[0.95]"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-[#DEDBC8]/50 mt-4 max-w-xl mx-auto text-sm md:text-base"
          >
            A single KREDZ Score fused from three distinct signal layers, updated continuously.
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

      {/* ═══ CHAPTER 3: THE DISCOVERY ═══ */}
      <section className="relative px-4 md:px-12 py-16 md:py-24 max-w-4xl mx-auto">
        <div className="w-px h-12 bg-gradient-to-b from-transparent via-[#DEDBC8]/10 to-transparent mx-auto mb-12" />
        <NarrativeBlock
          paragraphs={[
            'KREDZ is a privacy-preserving credit identity.',
            'It lives on Midnight. It proves itself on Base. It travels to Solana.',
            'It reaches into Canton for institutional lenders.',
            'It speaks to Cardano for wallet history.',
            'Five networks. One score. Zero exposure.',
          ]}
          paragraphClassName="text-[#DEDBC8]/60 text-base md:text-lg leading-relaxed mb-3"
        />
        <motion.p
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-[#DEDBC8]/80 text-base md:text-lg leading-relaxed mt-6 text-center"
        >
          A ZK proof attests your creditworthiness. Not your transaction history. Not your wallet balances. Not your name. <span className="text-[#DEDBC8]">Just the proof.</span>
        </motion.p>
      </section>

      {/* ═══ NETWORKS ═══ */}
      <section id="networks" className="relative px-4 md:px-12 py-16 md:py-28 max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-16">
          <p className="text-[10px] sm:text-xs text-[#DEDBC8] uppercase tracking-[0.2em] mb-3">One Score, Five Networks</p>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
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

      {/* ═══ CHAPTER 4: THE ARSENAL ═══ */}
      <section id="tiers" className="relative px-4 md:px-12 py-16 md:py-28 max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-16">
          <p className="text-[10px] sm:text-xs text-[#DEDBC8] uppercase tracking-[0.2em] mb-3">What You Now Hold</p>
          <WordsPullUp
            text="Choose Your Privacy Level"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-[#E1E0CC] leading-[0.95]"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-[#DEDBC8]/50 mt-4 max-w-xl mx-auto text-sm md:text-base"
          >
            You control what they see. Same score. Same you. Different lens.
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

      {/* ═══ CHAPTER 5: THE PROOF ═══ */}
      <section className="relative px-4 md:px-12 py-16 md:py-28 bg-noise">
        <div className="max-w-3xl mx-auto relative z-10">
          <NarrativeBlock
            paragraphs={[
              'Messages from those who crossed before you.',
            ]}
            className="text-center mb-10"
            paragraphClassName="text-[#DEDBC8] uppercase tracking-[0.2em] text-[10px] sm:text-xs"
          />
          <FieldReportCarousel
            reports={FIELD_REPORTS}
            className="mb-8"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center text-[#DEDBC8]/30 text-sm"
          >
            These are not testimonials. These are proof of concept. This works.
          </motion.p>
        </div>
      </section>

      {/* ═══ CHAPTER 6: THE CHOICE ═══ */}
      <section className="relative px-4 md:px-12 py-16 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          <NarrativeBlock
            paragraphs={[
              'You have read the story.',
              'But you already knew the ending.',
              'Because you have been waiting for this.',
            ]}
            className="mb-8"
            paragraphClassName="text-[#DEDBC8]/50 text-base md:text-lg leading-relaxed mb-2"
            staggerDelay={0.1}
          />

          <Users size={40} className="text-[#DEDBC8] mx-auto mb-6 opacity-40" />
          <WordsPullUp
            text="Start Your Story"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-[#E1E0CC] leading-[0.95]"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-[#DEDBC8]/50 mt-4 max-w-lg mx-auto text-sm md:text-base"
          >
            <span className="text-[#DEDBC8]">Your secrets stay yours. Your reputation goes everywhere.</span>
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-[#DEDBC8]/40 mt-4 mb-10 max-w-md mx-auto text-sm leading-relaxed"
          >
            Link your wallets. Generate your proof. Claim your score. The infrastructure is live across five networks. The only missing piece is you.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.6 }} className="group inline-flex"
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

        {/* ── INFRASTRUCTURE ── */}
        <div className="max-w-4xl mx-auto mt-24 relative z-10">
          <div className="text-center mb-10">
            <p className="text-[10px] sm:text-xs text-[#DEDBC8] uppercase tracking-[0.2em] mb-3">Infrastructure</p>
            <h2 className="text-2xl sm:text-3xl font-medium text-[#E1E0CC]">Powered By</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="bg-[#101010] rounded-3xl p-5 md:p-6 flex flex-col gap-3 hover:bg-[#151515] transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="font-medium text-sm text-[#E1E0CC]">1AM Wallet</span>
              </div>
              <p className="text-xs text-[#DEDBC8]/60 leading-relaxed">Dust-free Midnight wallet. Zero NIGHT for gas. ProofStation sponsors all ZK proving and transaction fees server-side.</p>
              <a href="https://1am.xyz" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#DEDBC8]/30 hover:text-[#DEDBC8]/60 transition-colors">1am.xyz</a>
              <a href="https://1am.xyz/developers" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#DEDBC8]/30 hover:text-[#DEDBC8]/60 transition-colors">Developer docs</a>
            </div>
            <div className="bg-[#101010] rounded-3xl p-5 md:p-6 flex flex-col gap-3 hover:bg-[#151515] transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="font-medium text-sm text-[#E1E0CC]">EffectStream</span>
              </div>
              <p className="text-xs text-[#DEDBC8]/60 leading-relaxed">Multichain sync engine by Midnight Foundation. Reads events from all 5 networks into a unified state machine. Replaces manual indexer polling.</p>
              <a href="https://github.com/effectstream/effectstream" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#DEDBC8]/30 hover:text-[#DEDBC8]/60 transition-colors">github.com/effectstream</a>
              <a href="https://effectstream.github.io/docs" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#DEDBC8]/30 hover:text-[#DEDBC8]/60 transition-colors">Docs</a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="px-4 md:px-12 py-10 border-t border-[#DEDBC8]/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#DEDBC8] to-[#DEDBC8]/50 flex items-center justify-center">
              <span className="text-black font-black text-xs">K</span>
            </div>
            <span className="font-bold text-[#E1E0CC]">KREDZ</span>
          </div>
          <p className="text-xs text-[#DEDBC8]/25 text-center">
            Midnight, Canton, Base, Solana, Cardano &middot; Privacy-preserving credit scoring &middot; &copy; 2026 KREDZ
          </p>
          <div className="flex gap-6">
            {[
              { label: 'Docs', href: '#' },
              { label: 'GitHub', href: 'https://github.com/kredz-labs/kredz' },
              { label: 'Discord', href: '#' },
              { label: 'Privacy', href: '/privacy' },
            ].map(({ label, href }) => {
              const isExternal = href.startsWith('http');
              return isExternal
                ? <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="text-xs text-[#DEDBC8]/35 hover:text-[#DEDBC8]/70 transition-colors">{label}</a>
                : <a key={label} href={href} className="text-xs text-[#DEDBC8]/35 hover:text-[#DEDBC8]/70 transition-colors">{label}</a>;
            })}
          </div>
        </div>
      </footer>
    </div>
  );
}

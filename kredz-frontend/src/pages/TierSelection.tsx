import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, CheckCircle, ArrowRight, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { deployKredzContract } from '../midnight/contract';
import { toast } from '../components/Toast';

const TIERS = [
  {
    id: 0 as const,
    name: 'Anonymous',
    subtitle: 'On-chain signals only',
    range: '0 – 400',
    color: 'from-slate-500 to-slate-400',
    borderHover: 'hover:border-slate-400/40',
    proof: null,
    proofLabel: null,
    description: 'Score based purely on your on-chain behavior. No personal data required.',
    features: ['Wallet age & activity', 'DeFi interaction history', 'Repayment behavior', 'Micro-lending access'],
  },
  {
    id: 1 as const,
    name: 'Pseudonymous',
    subtitle: 'ZK-prove one attribute',
    range: '0 – 650',
    color: 'from-accent to-gold',
    borderHover: 'hover:border-accent/50',
    proof: 'attribute',
    proofLabel: 'Prove one attribute (e.g. income > $5k or age > 18)',
    description: 'Prove a single real-world attribute via ZK-circuit. The attribute stays private - only the proof goes on-chain.',
    features: ['All Anonymous features', 'ZK income attestation', 'ZK age verification', 'Mid-tier lending access'],
    highlight: true,
  },
  {
    id: 2 as const,
    name: 'Full Compliance',
    subtitle: 'Full ZK-KYC bundle',
    range: '0 – 1000',
    color: 'from-gold to-yellow-300',
    borderHover: 'hover:border-gold/50',
    proof: 'fullKyc',
    proofLabel: 'Full KYC bundle (name, income, ID - all ZK-proven)',
    description: 'Full compliance via ZK-circuits. Unlock institutional liquidity pools and the maximum score range.',
    features: ['All Pseudonymous features', 'Full ZK-KYC bundle', 'Institutional pools', 'Maximum score range'],
  },
];

export default function TierSelection() {
  const { wallet, setTier, setContractAddress, setScore, setLayerScores } = useApp();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<0 | 1 | 2 | null>(null);
  const [proofInput, setProofInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'prove'>('select');

  const selectedTier = TIERS.find(t => t.id === selected);

  async function handleSelect(tierId: 0 | 1 | 2) {
    setSelected(tierId);
    const tier = TIERS.find(t => t.id === tierId)!;
    if (tier.proof) {
      setStep('prove');
    } else {
      await submitTier(tierId, '');
    }
  }

  async function submitTier(tierId: 0 | 1 | 2, input: string) {
    if (!wallet) return;
    setLoading(true);
    try {
      toast('Deploying KREDZ contract on Midnight…', 'info');
      const api = await deployKredzContract(wallet);
      setContractAddress(api.deployedContractAddress);

      toast('Generating ZK proof and submitting transaction…', 'info');
      if (tierId === 0) await api.setTier0();
      else if (tierId === 1) await api.setTier1(input);
      else await api.setTier2(input);

      const state = await api.getContractState();
      const tier = state.data.tier as 0 | 1 | 2;

      // Compute mock layer scores based on tier
      const base = [120, 0, 0] as [number, number, number];
      if (tier >= 1) base[1] = 180;
      if (tier >= 2) { base[0] = 200; base[1] = 280; }
      const total = base.reduce((a, b) => a + b, 0);

      setTier(tier);
      setLayerScores(base);
      setScore(total);

      toast(`Tier ${tier} activated! Your KREDZ Score: ${total}`, 'success');
      navigate('/app/dashboard');
    } catch (err) {
      console.error(err);
      toast('Transaction failed. Please try again.', 'error');
      setLoading(false);
      setStep('select');
    }
  }

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12 pb-16 relative bg-transparent">
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="font-inter text-sm text-accent uppercase tracking-widest mb-3">ZK-KYC Onboarding</p>
          <h1 className="font-manrope font-extrabold text-4xl md:text-5xl text-light mb-4">
            Choose Your Privacy Tier
          </h1>
          <p className="font-inter text-light/50 max-w-xl mx-auto">
            Select how much you want to prove. Your data stays private - only ZK proofs go on-chain.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid md:grid-cols-3 gap-6">
              {TIERS.map((tier, i) => (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => !loading && handleSelect(tier.id)}
                  className={`glass rounded-3xl p-8 flex flex-col gap-5 cursor-pointer transition-all border border-transparent ${tier.borderHover} ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'} ${selected === tier.id ? 'border-accent/50 scale-[1.02]' : ''} relative overflow-hidden`}
                >
                  {tier.highlight && (
                    <div className="absolute top-4 right-4 text-xs font-inter font-semibold bg-gradient-to-r from-accent to-gold text-dark px-3 py-1 rounded-full">
                      Recommended
                    </div>
                  )}
                  <div>
                    <div className={`inline-block text-xs font-inter font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${tier.color} text-dark mb-3`}>
                      Tier {tier.id}
                    </div>
                    <h3 className="font-manrope font-bold text-2xl text-light">{tier.name}</h3>
                    <p className="font-inter text-xs text-light/40 mt-1">{tier.subtitle}</p>
                    <div className="text-gradient font-manrope font-extrabold text-3xl mt-2">{tier.range}</div>
                    <p className="font-inter text-xs text-light/30 mt-0.5">Score Range</p>
                  </div>
                  <p className="font-inter text-sm text-light/60 leading-relaxed">{tier.description}</p>
                  <ul className="flex flex-col gap-2 flex-1">
                    {tier.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm font-inter text-light/70">
                        <CheckCircle size={13} className="text-gold shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="glass rounded-xl p-3 flex items-center gap-2">
                    <Shield size={13} className="text-accent shrink-0" />
                    <span className="text-xs font-inter text-light/50">
                      {tier.proof ? tier.proofLabel : 'No personal data required'}
                    </span>
                  </div>
                  {loading && selected === tier.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-dark/60 rounded-3xl">
                      <Loader2 size={32} className="text-gold animate-spin" />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {step === 'prove' && selectedTier && (
            <motion.div key="prove" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="max-w-lg mx-auto glass rounded-3xl p-10">
              <button onClick={() => { setStep('select'); setSelected(null); }}
                className="mb-6 text-light/40 hover:text-light/70 transition-colors">
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-6">
                <Lock size={24} className="text-gold" />
                <div>
                  <h2 className="font-manrope font-bold text-xl text-light">ZK Proof Required</h2>
                  <p className="font-inter text-xs text-light/40">Tier {selectedTier.id} - {selectedTier.name}</p>
                </div>
              </div>
              <p className="font-inter text-sm text-light/60 mb-6 leading-relaxed">
                {selectedTier.proofLabel}. Your input is processed locally and only a ZK proof is submitted to Midnight - your raw data never leaves your device.
              </p>
              <label className="block font-inter text-xs text-light/50 mb-2 uppercase tracking-wider">
                {selectedTier.id === 1 ? 'Attribute Value (e.g. "income:8000" or "age:25")' : 'KYC Bundle (e.g. "name:John,income:8000,id:verified")'}
              </label>
              <input
                type="text"
                value={proofInput}
                onChange={e => setProofInput(e.target.value)}
                placeholder={selectedTier.id === 1 ? 'income:8000' : 'name:John,income:8000,id:verified'}
                className="w-full glass rounded-xl px-4 py-3 font-inter text-sm text-light placeholder-light/20 outline-none focus:border-accent/50 border border-transparent transition-colors mb-6"
              />
              <button
                onClick={() => submitTier(selectedTier.id, proofInput)}
                disabled={!proofInput.trim() || loading}
                className="glow-btn w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-accent to-gold text-dark font-manrope font-bold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> Generating ZK Proof…</> : <>Generate Proof & Submit <ArrowRight size={18} /></>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

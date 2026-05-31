import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, CheckCircle, ArrowRight, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { deployContract } from '../midnight/contract';
import { toast } from '../components/Toast';

const TIERS = [
  { id: 0 as const, name: 'Anonymous', subtitle: 'On-chain signals only', range: '0-400',
    proof: null, proofLabel: null,
    description: 'Score based purely on your on-chain behavior. No personal data required.',
    features: ['Wallet age and activity', 'DeFi interaction history', 'Repayment behavior', 'Micro-lending access'],
  },
  { id: 1 as const, name: 'Pseudonymous', subtitle: 'ZK-prove one attribute', range: '0-650',
    proof: 'attribute', proofLabel: 'Prove one attribute (e.g. income > $5k or age > 18)',
    description: 'Prove a single real-world attribute via ZK-circuit. The attribute stays private - only the proof goes on-chain.',
    features: ['All Anonymous features', 'ZK income attestation', 'ZK age verification', 'Mid-tier lending access'],
    highlight: true,
  },
  { id: 2 as const, name: 'Full Compliance', subtitle: 'Full ZK-KYC bundle', range: '0-1000',
    proof: 'fullKyc', proofLabel: 'Full KYC bundle (name, income, ID - all ZK-proven)',
    description: 'Full compliance via ZK-circuits. Unlock institutional liquidity pools via Zenith EVM on Canton and the maximum score range.',
    features: ['All Pseudonymous features', 'Full ZK-KYC bundle', 'Zenith (Canton) lenders', 'Maximum score range'],
  },
];

export default function TierSelection() {
  const { wallet, setTier, contractAddress, setContractAddress, setScore, setLayerScores } = useApp();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<0 | 1 | 2 | null>(null);
  const [proofInput, setProofInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'prove'>('select');
  const selectedTier = TIERS.find(t => t.id === selected);

  async function handleSelect(tierId: 0 | 1 | 2) {
    setSelected(tierId);
    const tier = TIERS.find(t => t.id === tierId)!;
    if (tier.proof) setStep('prove'); else await submitTier(tierId, '');
  }

  async function submitTier(tierId: 0 | 1 | 2, _input: string) {
    if (!wallet) return;
    setLoading(true);
    try {
      if (contractAddress) {
        toast('Contract already deployed, setting tier...', 'info');
      } else {
        toast('Deploying KREDZ contract on Midnight Preprod...', 'info');
        const address = await deployContract(wallet.connectedAPI);
        setContractAddress(address);
      }
      setTier(tierId);
      const base: [number, number, number] = [120, 0, 0];
      if (tierId >= 1) base[1] = 180;
      if (tierId >= 2) { base[0] = 200; base[1] = 280; }
      const total = base.reduce((a, b) => a + b, 0);
      setLayerScores(base); setScore(total);
      toast(`Tier ${tierId} activated! Your KREDZ Score: ${total}`, 'success');
      navigate('/app/dashboard');
    } catch (err) {
      console.error(err);
      toast('Transaction failed. Please try again.', 'error');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen pt-24 px-4 md:px-12 pb-16 relative bg-black">
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="text-[10px] sm:text-xs text-[#DEDBC8] uppercase tracking-[0.2em] mb-3">ZK-KYC Onboarding</p>
          <h1 className="font-medium text-3xl sm:text-4xl md:text-5xl text-[#E1E0CC] leading-[0.95] mb-4">Choose Your Privacy Tier</h1>
          <p className="text-sm md:text-base text-[#DEDBC8]/50 max-w-xl mx-auto">Select how much you want to prove. Your data stays private - only ZK proofs go on-chain.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {step === 'select' && (
            <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid md:grid-cols-3 gap-4 md:gap-6">
              {TIERS.map((tier, i) => (
                <motion.div key={tier.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => !loading && handleSelect(tier.id)}
                  className={`bg-[#101010] rounded-3xl p-6 md:p-8 flex flex-col gap-5 cursor-pointer transition-all hover:bg-[#151515] hover:scale-[1.01] ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${selected === tier.id ? 'ring-1 ring-[#DEDBC8]/20 scale-[1.01]' : ''} relative overflow-hidden ${tier.highlight ? 'ring-1 ring-[#DEDBC8]/20' : ''}`}
                >
                  {tier.highlight && (
                    <div className="absolute top-4 right-4 text-xs font-semibold bg-[#DEDBC8] text-black px-3 py-1 rounded-full">Recommended</div>
                  )}
                  <div>
                    <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-[#DEDBC8]/10 text-[#DEDBC8] border border-[#DEDBC8]/10 mb-3">Tier {tier.id}</span>
                    <h3 className="font-semibold text-2xl text-[#E1E0CC]">{tier.name}</h3>
                    <p className="text-xs text-[#DEDBC8]/30 mt-1">{tier.subtitle}</p>
                    <div className="text-[#DEDBC8] font-extrabold text-3xl mt-2">{tier.range}</div>
                    <p className="text-xs text-[#DEDBC8]/20 mt-0.5">Score Range</p>
                  </div>
                  <p className="text-sm text-[#DEDBC8]/60 leading-relaxed">{tier.description}</p>
                  <ul className="flex flex-col gap-2 flex-1">
                    {tier.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-[#DEDBC8]/60">
                        <CheckCircle size={13} className="text-[#DEDBC8]/40 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <div className="bg-[#0A0A0A] rounded-xl p-3 flex items-center gap-2 border border-[#DEDBC8]/5">
                    <Shield size={13} className="text-[#DEDBC8]/30 shrink-0" />
                    <span className="text-xs text-[#DEDBC8]/50">{tier.proof ? tier.proofLabel : 'No personal data required'}</span>
                  </div>
                  {loading && selected === tier.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-3xl"><Loader2 size={32} className="text-[#DEDBC8] animate-spin" /></div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {step === 'prove' && selectedTier && (
            <motion.div key="prove" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="max-w-lg mx-auto bg-[#101010] rounded-3xl p-8 md:p-10 border border-[#DEDBC8]/5">
              <button onClick={() => { setStep('select'); setSelected(null); }}
                className="mb-6 text-[#DEDBC8]/30 hover:text-[#DEDBC8]/70 transition-colors"><X size={20} /></button>
              <div className="flex items-center gap-3 mb-6">
                <Lock size={24} className="text-[#DEDBC8]/60" />
                <div>
                  <h2 className="font-medium text-xl text-[#E1E0CC]">ZK Proof Required</h2>
                  <p className="text-xs text-[#DEDBC8]/40">Tier {selectedTier.id} - {selectedTier.name}</p>
                </div>
              </div>
              <p className="text-sm text-[#DEDBC8]/60 mb-6 leading-relaxed">
                {selectedTier.proofLabel}. Your input is processed locally and only a ZK proof is submitted to Midnight - your raw data never leaves your device.
              </p>
              <label className="block text-xs text-[#DEDBC8]/40 mb-2 uppercase tracking-[0.1em]">
                {selectedTier.id === 1 ? 'Attribute Value (e.g. "income:8000" or "age:25")' : 'KYC Bundle (e.g. "name:John,income:8000,id:verified")'}
              </label>
              <input type="text" value={proofInput} onChange={e => setProofInput(e.target.value)}
                placeholder={selectedTier.id === 1 ? 'income:8000' : 'name:John,income:8000,id:verified'}
                className="w-full bg-[#0A0A0A] rounded-xl px-4 py-3 text-sm text-[#E1E0CC] placeholder-[#DEDBC8]/10 outline-none border border-[#DEDBC8]/5 focus:border-[#DEDBC8]/20 transition-colors mb-6"
              />
              <button onClick={() => submitTier(selectedTier.id, proofInput)}
                disabled={!proofInput.trim() || loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-[#DEDBC8] text-black font-medium transition-all hover:gap-3 disabled:opacity-30 disabled:cursor-not-allowed">
                {loading ? <><Loader2 size={18} className="animate-spin" /> Generating ZK Proof...</> : <>Generate Proof and Submit <ArrowRight size={18} /></>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

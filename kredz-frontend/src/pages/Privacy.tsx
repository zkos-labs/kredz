import { motion } from 'framer-motion';
import { Shield, Lock, Globe, Eye } from 'lucide-react';

const SECTIONS = [
  {
    icon: Shield,
    title: 'What we collect',
    content: 'Kredz does not store or collect your personal identity. All credit scoring happens through zero-knowledge proofs on the Midnight blockchain. Your raw financial data (income, employment, bank history, identity documents) never reaches our servers. We only receive ZK proofs that attest to attributes without revealing the underlying values. Income becomes "above $5,000" not "$7,250."',
  },
  {
    icon: Lock,
    title: 'How your data is protected',
    content: 'Your Midnight wallet identity is pseudonymous. The Compact circuits on Midnight enforce selective disclosure — you choose what to prove and to whom. On-chain state (score hashes, tier levels, attestation timestamps) is public to the Midnight ledger, but contains no personally identifiable information. Linked wallet addresses (Base, Solana) are stored on Midnight\'s shielded ledger, visible only to you.',
  },
  {
    icon: Eye,
    title: 'Third-party providers',
    content: 'For Tier 1 and Tier 2 users who choose to unlock higher credit limits, Kredz integrates with KYC providers (SumSub) and wallet screening (Chainalysis KYT). These providers operate under their own privacy policies and data processing agreements. Kredz receives only the ZK credential — not the underlying identity documents. For Tier 0 users, no third-party providers are involved.',
  },
  {
    icon: Globe,
    title: 'Your rights',
    content: 'You can revoke your ZK credentials at any time through your Midnight wallet. Credential revocation removes your Tier 1 or Tier 2 status and deletes the associated ZK proof from the ledger. For KYC data held by SumSub, you may submit a deletion request directly. On-chain ZK commitments are pseudonymous and cannot be linked to your real identity without your private key, which only you control. Kredz uses the 1AM wallet for Midnight connectivity — ProofStation sponsors all transaction fees. No cookies, no tracking, no analytics scripts on kredz.xyz.',
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen pt-28 px-4 md:px-12 pb-16 bg-black">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <p className="text-[10px] sm:text-xs text-[#DEDBC8] uppercase tracking-[0.2em] mb-3">Your Data, Your Control</p>
          <h1 className="font-medium text-3xl sm:text-4xl md:text-5xl text-[#E1E0CC] leading-[0.95] mb-4">Privacy Policy</h1>
          <p className="text-sm text-[#DEDBC8]/50 max-w-lg mx-auto leading-relaxed">
            Kredz is a privacy-preserving credit identity protocol. We designed the system so that you never have to trust us with your raw data. Here is exactly how it works.
          </p>
        </motion.div>

        <div className="flex flex-col gap-4">
          {SECTIONS.map(({ icon: Icon, title, content }, i) => (
            <motion.div key={title}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-[#101010] rounded-3xl p-6 md:p-8 flex flex-col gap-4 hover:bg-[#151515] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] flex items-center justify-center">
                  <Icon size={20} className="text-[#DEDBC8]/60" />
                </div>
                <h2 className="font-medium text-lg text-[#E1E0CC]">{title}</h2>
              </div>
              <p className="text-sm text-[#DEDBC8]/60 leading-relaxed">{content}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="text-xs text-[#DEDBC8]/25 text-center mt-12"
        >
          Last updated: May 2026. This policy applies to kredz.xyz and all associated services. For questions, reach out on Discord or GitHub.
        </motion.p>
      </div>
    </div>
  );
}

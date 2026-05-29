import { motion } from 'framer-motion';
import { Shield, Lock, Globe, Eye, FileText, Server, Cookie, Fingerprint } from 'lucide-react';

const SECTIONS = [
  {
    icon: FileText,
    title: 'Overview',
    content: 'Kredz Labs ("Kredz," "we," "us") operates kredz.xyz and the Kredz credit identity protocol. This Privacy Policy explains how your data is handled when you use Kredz. We designed the system so that you never have to trust us with your raw personal data. Credit scoring happens through zero-knowledge proofs on the Midnight blockchain. Your raw financial data never reaches our servers.',
  },
  {
    icon: Shield,
    title: 'Information we collect',
    content: 'Kredz itself collects the minimum necessary to operate the protocol: your Midnight wallet address (pseudonymous), linked EVM and Solana wallet addresses (if you choose to link them), and transaction metadata required by the Midnight ledger. We do not collect your name, email, government ID, phone number, IP address, or device fingerprint. We do not use cookies. We do not run analytics scripts on kredz.xyz. No third-party trackers are present on our site.',
  },
  {
    icon: Lock,
    title: 'How zero-knowledge proofs protect your data',
    content: 'When you attest a credit score on Kredz, the actual score value is a private witness that never touches the Midnight ledger. Only a cryptographic hash of the score combined with a secret salt is stored on-chain. The attestor proves knowledge of their authorization key via a ZK witness without revealing the key itself. Selective disclosure circuits allow you to prove your credit tier (Anonymous, Pseudonymous, or Full Compliance) without revealing your exact score. An observer on-chain sees only: a commitment hash, a tier classification (0, 1, or 2), and optionally linked wallet addresses.',
  },
  {
    icon: Server,
    title: 'Cross-chain wallet linking',
    content: 'When you link an EVM (Base, Ethereum) or Solana wallet address, that address is stored on the Midnight ledger associated with your Midnight identity. This is necessary for the cross-chain credit portability feature. The linked address is visible on the Midnight public ledger. You control when to link addresses and may choose not to link any external wallets. Unlinked profiles remain fully functional at the Anonymous tier.',
  },
  {
    icon: Eye,
    title: 'Third-party providers',
    content: 'For Tier 1 (Pseudonymous) and Tier 2 (Full Compliance) users, Kredz integrates with KYC providers including SumSub and Chainalysis KYT to verify identity attributes and screen wallet activity. These providers operate under their own privacy policies and data processing agreements with Kredz Labs. Kredz receives only the ZK credential attesting to verification status — not the underlying identity documents, biometric data, or raw screening results. For Tier 0 (Anonymous) users, no third-party identity providers are involved at any stage.',
  },
  {
    icon: Fingerprint,
    title: 'Data retention and deletion',
    content: 'On-chain data (score hashes, tier classifications, linked wallet addresses) persist on the Midnight ledger for as long as the contract is active. ZK commitments are pseudonymous by design and cannot be linked to your real identity without your private key. You may request credential revocation at any time via your Midnight wallet, which removes your Tier 1 or Tier 2 status. KYC data held by third-party providers is subject to their respective retention policies — you may submit deletion requests directly to those providers.',
  },
  {
    icon: Globe,
    title: 'Your rights and control',
    content: 'You remain in control of your Kredz identity at all times. You can revoke ZK credentials through your Midnight wallet. You can disconnect linked EVM and Solana addresses. You can choose not to use any third-party KYC services by remaining at Tier 0 (Anonymous). Kredz uses the 1AM wallet for Midnight connectivity — all transaction fees are sponsored by ProofStation via dust-free proving. Your private key is held solely by you in your 1AM browser extension. Kredz cannot access, move, or control your wallet or funds.',
  },
  {
    icon: Cookie,
    title: 'Cookies and tracking',
    content: 'kredz.xyz does not use cookies for tracking, analytics, or advertising. We do not set any first-party or third-party cookies on your browser. We do not use localStorage for tracking purposes. The only data stored in localStorage is your wallet connection status and tier selection, which is strictly necessary for the application to function across page reloads. You can clear this data at any time through your browser settings.',
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
            Kredz is a privacy-preserving credit identity protocol built on zero-knowledge proofs. Here is exactly how your data is handled.
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

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          className="bg-[#101010] rounded-3xl p-6 md:p-8 mt-4 flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] flex items-center justify-center">
              <Shield size={20} className="text-[#DEDBC8]/60" />
            </div>
            <h2 className="font-medium text-lg text-[#E1E0CC]">Contact</h2>
          </div>
          <p className="text-sm text-[#DEDBC8]/60 leading-relaxed">
            For privacy-related inquiries or data requests, contact us at{' '}
            <a href="https://github.com/kredz-labs/kredz/issues" target="_blank" rel="noopener noreferrer" className="text-[#DEDBC8] underline underline-offset-4 hover:text-[#E1E0CC] transition-colors">
              GitHub Issues
            </a>
            {' '}or join the Midnight Network Discord and tag the Kredz project. We respond within 72 hours.
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="text-xs text-[#DEDBC8]/25 text-center mt-12"
        >
          Last updated: May 2026. Kredz Labs. This policy applies to kredz.xyz and all associated Kredz protocol services.
        </motion.p>
      </div>
    </div>
  );
}

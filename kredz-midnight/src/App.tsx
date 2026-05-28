import { useState } from 'react';
import { Shield, PlusCircle, FileText, Eye, Rocket } from 'lucide-react';
import { WalletProvider, useWallet } from './context/WalletContext';
import WalletConnect from './components/WalletConnect';
import ScoreAttest from './components/ScoreAttest';
import ScoreProfile from './components/ScoreProfile';
import ProveTier from './components/ProveTier';
import { deployContract, waitForContractIndexed } from './midnight/contract';

type Tab = 'deploy' | 'attest' | 'profile' | 'prove';

function AppContent() {
  const { session, address } = useWallet();
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('deploy');

  const handleDeploy = async () => {
    if (!session) return;
    setIsDeploying(true);
    setDeployError(null);
    try {
      // Derive owner public key from wallet
      const ownerKey = new Uint8Array(32);
      const pk = session.shieldedCoinPublicKey;
      const pkHex = typeof pk === 'string' ? pk : '';
      for (let i = 0; i < 32 && i * 2 < pkHex.length; i++) {
        ownerKey[i] = parseInt(pkHex.slice(i * 2, i * 2 + 2), 16);
      }

      const addr = await deployContract(session, ownerKey);
      await waitForContractIndexed(session, addr);
      setContractAddress(addr);
      setActiveTab('attest');
    } catch (e: any) {
      setDeployError(e.message || String(e));
    } finally {
      setIsDeploying(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'deploy', label: 'Deploy', icon: <Rocket className="w-3.5 h-3.5" /> },
    { id: 'attest', label: 'Attest', icon: <PlusCircle className="w-3.5 h-3.5" /> },
    { id: 'profile', label: 'Profile', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'prove', label: 'Prove', icon: <Eye className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-200">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-violet-400" />
            <h1 className="text-lg font-mono tracking-[0.3em] uppercase text-zinc-100">KREDZ Score Profile</h1>
          </div>
          <p className="text-[11px] font-mono text-zinc-500 max-w-sm mx-auto">
            Privacy-preserving credit identity on Midnight Network.
            Your score is verified via ZK — never stored in plaintext on-chain.
          </p>
        </div>

        {/* Wallet */}
        <div className="flex justify-center mb-6">
          <WalletConnect />
        </div>

        {/* Contract Info */}
        {contractAddress && (
          <div className="mb-6 bg-zinc-900/50 border border-violet-500/10 rounded-lg p-3">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">Contract</p>
            <p className="text-[11px] font-mono text-violet-300 truncate">{contractAddress}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-zinc-900/50 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[10px] font-mono tracking-wider uppercase transition-all ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-6">
          {activeTab === 'deploy' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-mono tracking-widest uppercase text-zinc-300">Deploy Registry</h3>
              </div>
              <p className="text-[11px] font-mono text-zinc-500">
                Deploy the KREDZ Score Profile contract to Midnight Preprod. This creates the on-chain registry for score attestations.
              </p>
              <button
                onClick={handleDeploy}
                disabled={isDeploying || !session}
                className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-mono tracking-widest uppercase py-3 rounded-lg transition-all"
              >
                {isDeploying ? 'Deploying...' : 'Deploy Contract'}
              </button>
              {deployError && (
                <div className="bg-red-900/20 border border-red-500/20 rounded p-3">
                  <p className="text-[10px] font-mono text-red-400">{deployError}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'attest' && !contractAddress && (
            <p className="text-[11px] font-mono text-zinc-500 text-center">Deploy a contract first to attest scores.</p>
          )}
          {activeTab === 'attest' && contractAddress && (
            <ScoreAttest contractAddress={contractAddress} />
          )}

          {activeTab === 'profile' && !contractAddress && (
            <p className="text-[11px] font-mono text-zinc-500 text-center">Deploy a contract first to view profiles.</p>
          )}
          {activeTab === 'profile' && contractAddress && (
            <ScoreProfile contractAddress={contractAddress} />
          )}

          {activeTab === 'prove' && !contractAddress && (
            <p className="text-[11px] font-mono text-zinc-500 text-center">Deploy a contract first to prove tiers.</p>
          )}
          {activeTab === 'prove' && contractAddress && (
            <ProveTier contractAddress={contractAddress} />
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[10px] font-mono text-zinc-600">
            Built for Midnight Build Club Fellowship · Powered by ZK proofs
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}

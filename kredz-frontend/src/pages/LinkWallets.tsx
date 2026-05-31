import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Link2, CheckCircle, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { deployContract, waitForContractIndexed } from '../midnight/contract';
import { toast } from '../components/Toast';

function truncate(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function LinkWallets() {
  const {
    wallet, connect, isConnecting,
    evmWallet, connectEvm, isEvmConnecting,
    solanaWallet, connectSolana, isSolanaConnecting,
    setWalletsLinked, setContractAddress,
  } = useApp();
  const [linking, setLinking] = useState(false);
  const navigate = useNavigate();

  async function handleConnectMidnight() {
    try { await connect(); toast('Midnight wallet connected', 'success'); }
    catch (err) {
      const msg = err instanceof Error ? err.message : '';
      toast(msg === 'ONEM_NOT_FOUND' ? 'Please install the 1AM wallet for Midnight Network' : 'Connection failed', 'error');
    }
  }

  async function handleConnectEvm() {
    try { await connectEvm(); toast('Base wallet connected', 'success'); }
    catch (err) {
      const msg = err instanceof Error ? err.message : '';
      toast(msg === 'METAMASK_NOT_FOUND' ? 'Please install MetaMask to connect a Base wallet' : 'Connection failed', 'error');
    }
  }

  async function handleConnectSolana() {
    try { await connectSolana(); toast('Solana wallet connected', 'success'); }
    catch (err) {
      const msg = err instanceof Error ? err.message : '';
      toast(msg === 'PHANTOM_NOT_FOUND' ? 'Please install Phantom to connect a Solana wallet' : 'Connection failed', 'error');
    }
  }

  async function handleLink() {
    if (!wallet || !evmWallet || !solanaWallet) return;
    setLinking(true);
    try {
      toast('Deploying KREDZ contract on Midnight Preprod...', 'info');
      const address = await deployContract(wallet.connectedAPI);
      toast('Waiting for indexer to confirm deployment...', 'info');
      await waitForContractIndexed(wallet.connectedAPI, address);
      setContractAddress(address);
      setWalletsLinked(true);
      toast(`Contract deployed: ${address.slice(0, 16)}... All wallets linked!`, 'success');
      navigate('/app/tier');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[LinkWallets] Deployment failed:', err);
      toast(`Deployment failed: ${msg}`, 'error');
    } finally { setLinking(false); }
  }

  const allConnected = !!wallet && !!evmWallet && !!solanaWallet;

  const walletCards = [
    { label: 'Midnight (1AM)', letter: 'M', dot: 'bg-purple-400', connected: !!wallet, address: wallet?.state.address, connecting: isConnecting, onConnect: handleConnectMidnight },
    { label: 'Base (MetaMask)', letter: 'B', dot: 'bg-blue-400', connected: !!evmWallet, address: evmWallet?.address, connecting: isEvmConnecting, onConnect: handleConnectEvm },
    { label: 'Solana (Phantom)', letter: 'S', dot: 'bg-emerald-400', connected: !!solanaWallet, address: solanaWallet?.address, connecting: isSolanaConnecting, onConnect: handleConnectSolana },
  ];

  return (
    <div className="min-h-screen pt-24 px-4 pb-16 flex items-center justify-center relative bg-black">
      <div className="w-full max-w-lg relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="font-medium text-[10px] sm:text-xs text-[#DEDBC8] uppercase tracking-[0.2em] mb-3">Five-Network Identity</p>
          <h1 className="font-medium text-3xl sm:text-4xl text-[#E1E0CC] leading-[0.95] mb-3">Link Your Wallets</h1>
          <p className="text-[#DEDBC8]/50 text-sm leading-relaxed max-w-sm mx-auto">
            Connect your Midnight, Base, and Solana wallets to create a unified KREDZ identity. Your score will be provable across all five networks.
          </p>
        </motion.div>

        <div className="flex flex-col gap-3 mb-6">
          {walletCards.map((card, i) => (
            <motion.div key={card.label}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#101010] rounded-2xl p-5 flex items-center justify-between gap-4 hover:bg-[#151515] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-[#1A1A1A] flex items-center justify-center border border-[#DEDBC8]/5`}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${card.dot}`} />
                    <span className="text-[#E1E0CC] font-black text-sm">{card.letter}</span>
                  </div>
                </div>
                <div>
                  <div className="font-medium text-sm text-[#E1E0CC]">{card.label}</div>
                  {card.connected && card.address
                    ? <div className="text-xs text-emerald-400 mt-0.5">{truncate(card.address)}</div>
                    : <div className="text-xs text-[#DEDBC8]/30 mt-0.5">Not connected</div>
                  }
                </div>
              </div>
              {card.connected
                ? <CheckCircle size={20} className="text-emerald-400 shrink-0" />
                : <button onClick={card.onConnect} disabled={card.connecting}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#DEDBC8] text-black font-medium text-xs transition-all hover:gap-2 disabled:opacity-50">
                    {card.connecting ? <Loader2 size={13} className="animate-spin" /> : <Wallet size={13} />}
                    Connect
                  </button>
              }
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="bg-[#0A0A0A] rounded-xl p-4 flex items-start gap-3 mb-6 border border-[#DEDBC8]/5">
          <AlertCircle size={15} className="text-[#DEDBC8]/50 shrink-0 mt-0.5" />
          <p className="text-xs text-[#DEDBC8]/50 leading-relaxed">
            Linking stores your Base and Solana addresses on Midnight via ZK circuits. Your KREDZ Score will be bridged to all five networks automatically. Canton access unlocks at Tier 2 via Zenith EVM.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          onClick={handleLink}
          disabled={!allConnected || linking}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-full bg-[#DEDBC8] text-black font-medium text-base transition-all hover:gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {linking
            ? <><Loader2 size={18} className="animate-spin" /> Linking Identities...</>
            : <><Link2 size={18} /> Link All Wallets & Continue <ArrowRight size={18} /></>
          }
        </motion.button>
      </div>
    </div>
  );
}

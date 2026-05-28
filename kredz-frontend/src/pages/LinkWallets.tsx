import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Link2, CheckCircle, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { deployKredzContract } from '../midnight/contract';
import { toast } from '../components/Toast';

function truncate(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
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
    try {
      await connect();
      toast('Midnight wallet connected', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      toast(msg === 'ONEM_NOT_FOUND' ? 'Please install the 1AM wallet for Midnight Network' : 'Connection failed', 'error');
    }
  }

  async function handleConnectEvm() {
    try {
      await connectEvm();
      toast('Base wallet connected', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      toast(msg === 'METAMASK_NOT_FOUND' ? 'Please install MetaMask to connect a Base wallet' : 'Connection failed', 'error');
    }
  }

  async function handleConnectSolana() {
    try {
      await connectSolana();
      toast('Solana wallet connected', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      toast(msg === 'PHANTOM_NOT_FOUND' ? 'Please install Phantom to connect a Solana wallet' : 'Connection failed', 'error');
    }
  }

  async function handleLink() {
    if (!wallet || !evmWallet || !solanaWallet) return;
    setLinking(true);
    try {
      toast('Deploying KREDZ contract on Midnight...', 'info');
      const api = await deployKredzContract(wallet);
      setContractAddress(api.deployedContractAddress);

      toast('Linking EVM address on-chain via ZK proof...', 'info');
      await api.linkEvmAddress(evmWallet.address);

      toast('Linking Solana address on-chain via ZK proof...', 'info');
      await api.linkSolanaAddress(solanaWallet.address);

      setWalletsLinked(true);
      toast('All wallets linked! Your KREDZ identity is now trichain.', 'success');
      navigate('/app/tier');
    } catch (err) {
      console.error(err);
      toast('Linking failed. Please try again.', 'error');
    } finally {
      setLinking(false);
    }
  }

  const allConnected = !!wallet && !!evmWallet && !!solanaWallet;

  const walletCards = [
    {
      label: 'Midnight (Lace)',
      letter: 'M',
      gradient: 'from-purple-500/20 to-blue-500/20',
      border: 'border-purple-500/20',
      textColor: 'text-purple-300',
      btnGradient: 'from-accent to-gold',
      connected: !!wallet,
      address: wallet?.state.address,
      connecting: isConnecting,
      onConnect: handleConnectMidnight,
    },
    {
      label: 'Base (MetaMask)',
      letter: 'B',
      gradient: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/20',
      textColor: 'text-blue-300',
      btnGradient: 'from-blue-500 to-cyan-400',
      connected: !!evmWallet,
      address: evmWallet?.address,
      connecting: isEvmConnecting,
      onConnect: handleConnectEvm,
    },
    {
      label: 'Solana (Phantom)',
      letter: 'S',
      gradient: 'from-green-500/20 to-teal-500/20',
      border: 'border-green-500/20',
      textColor: 'text-green-300',
      btnGradient: 'from-green-500 to-teal-400',
      connected: !!solanaWallet,
      address: solanaWallet?.address,
      connecting: isSolanaConnecting,
      onConnect: handleConnectSolana,
    },
  ];

  return (
    <div className="min-h-screen pt-24 px-6 pb-16 flex items-center justify-center relative bg-transparent">
      <div className="w-full max-w-lg relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="font-inter text-sm text-accent uppercase tracking-widest mb-3">Five-Network Identity</p>
          <h1 className="font-manrope font-extrabold text-4xl text-light mb-3">Link Your Wallets</h1>
          <p className="font-inter text-light/50 text-sm leading-relaxed max-w-sm mx-auto">
            Connect your Midnight, Base, and Solana wallets to create a unified KREDZ identity. Your score will be provable across all five networks - Midnight for scoring, Canton for institutions, Base, Solana, and Cardano for DeFi.
          </p>
        </motion.div>

        <div className="flex flex-col gap-3 mb-6">
          {walletCards.map((card, i) => (
            <motion.div key={card.label}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center border ${card.border}`}>
                  <span className={`${card.textColor} font-black text-sm`}>{card.letter}</span>
                </div>
                <div>
                  <div className="font-manrope font-semibold text-light text-sm">{card.label}</div>
                  {card.connected && card.address
                    ? <div className="font-inter text-xs text-green-400 mt-0.5">{truncate(card.address)}</div>
                    : <div className="font-inter text-xs text-light/30 mt-0.5">Not connected</div>
                  }
                </div>
              </div>
              {card.connected
                ? <CheckCircle size={20} className="text-green-400 shrink-0" />
                : <button onClick={card.onConnect} disabled={card.connecting}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r ${card.btnGradient} text-dark font-manrope font-semibold text-xs transition-all hover:scale-105 disabled:opacity-60`}>
                    {card.connecting ? <Loader2 size={13} className="animate-spin" /> : <Wallet size={13} />}
                    Connect
                  </button>
              }
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="glass rounded-xl p-4 flex items-start gap-3 mb-6">
          <AlertCircle size={15} className="text-accent shrink-0 mt-0.5" />
          <p className="font-inter text-xs text-light/50 leading-relaxed">
            Linking stores your Base and Solana addresses on Midnight via ZK circuits. Your KREDZ Score will be bridged to all five networks automatically - Base and Solana via the attestation relayer, Canton via the KredzScore DAML contract when you reach Tier 2.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          onClick={handleLink}
          disabled={!allConnected || linking}
          className="glow-btn w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-accent to-gold text-dark font-manrope font-bold text-base transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
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

import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp, type ActiveChain } from '../context/AppContext';
import { toast } from './Toast';

function truncate(addr: string) {
  return addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

const CHAIN_CONFIG: Record<ActiveChain, { label: string; color: string; dot: string }> = {
  midnight: { label: 'Midnight', color: 'text-purple-300', dot: 'bg-purple-400' },
  base: { label: 'Base', color: 'text-blue-300', dot: 'bg-blue-400' },
  solana: { label: 'Solana', color: 'text-green-300', dot: 'bg-green-400' },
};

export function Navbar() {
  const { wallet, connect, disconnect, isConnecting, evmWallet, solanaWallet, walletsLinked, activeChain, setActiveChain } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [chainDropdown, setChainDropdown] = useState(false);
  const navigate = useNavigate();

  async function handleConnect() {
    try {
      await connect();
      toast('Wallet connected', 'success');
      navigate('/app');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      toast(msg === 'LACE_NOT_FOUND' ? 'Please install Lace Beta Wallet for Midnight Network' : 'Connection failed', 'error');
    }
  }

  async function handleDisconnect() {
    await disconnect();
    navigate('/');
    toast('Wallet disconnected', 'info');
  }

  const chain = CHAIN_CONFIG[activeChain];
  const displayAddr =
    activeChain === 'base' && evmWallet ? evmWallet.address
    : activeChain === 'solana' && solanaWallet ? solanaWallet.address
    : wallet?.state.address ?? '';

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-5 flex items-center justify-between"
      style={{ background: 'linear-gradient(to bottom, rgba(0,4,31,0.95) 0%, transparent 100%)' }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-gold flex items-center justify-center">
          <span className="text-dark font-manrope font-black text-sm">K</span>
        </div>
        <span className="font-manrope font-bold text-xl text-light tracking-tight">KREDZ</span>
        {walletsLinked && (
          <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-inter font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/20 text-purple-300 ml-1">
            Multichain
          </span>
        )}
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-8">
        {['How It Works', 'Networks', 'Tiers'].map(link => (
          <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`}
            className="text-sm font-inter text-light/60 hover:text-light transition-colors">
            {link}
          </a>
        ))}
      </div>

      {/* Wallet + chain controls */}
      <div className="flex items-center gap-2">
        {wallet ? (
          <>
            {/* Chain switcher — only show when wallets are linked */}
            {walletsLinked && (
              <div className="relative">
                <button
                  onClick={() => setChainDropdown(o => !o)}
                  className="glass px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-inter transition-colors hover:border-white/20"
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${chain.dot}`} />
                  <span className={chain.color}>{chain.label}</span>
                  <ChevronDown size={11} className="text-light/40" />
                </button>
                <AnimatePresence>
                  {chainDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full mt-2 right-0 glass rounded-xl p-1.5 min-w-[140px] border border-white/10"
                    >
                      {(Object.entries(CHAIN_CONFIG) as [ActiveChain, typeof chain][]).map(([key, cfg]) => (
                        <button
                          key={key}
                          onClick={() => { setActiveChain(key); setChainDropdown(false); }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-inter transition-colors hover:bg-white/5 ${activeChain === key ? 'bg-white/5' : ''}`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          <span className={cfg.color}>{cfg.label}</span>
                          {activeChain === key && <span className="ml-auto text-light/30">✓</span>}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Address pill */}
            <div className="glass px-3 py-1.5 rounded-full flex items-center gap-2 text-sm text-light/80">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-inter">{truncate(displayAddr)}</span>
            </div>

            <button onClick={handleDisconnect}
              className="p-2 rounded-full glass text-light/60 hover:text-red-400 transition-colors">
              <LogOut size={15} />
            </button>
          </>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="glow-btn flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-accent to-gold text-dark font-manrope font-semibold text-sm transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Wallet size={15} />
            {isConnecting ? 'Connecting…' : 'Connect Wallet'}
          </button>
        )}

        <button className="md:hidden p-2 text-light/60" onClick={() => setMenuOpen(o => !o)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-4 right-4 glass rounded-2xl p-6 flex flex-col gap-4 md:hidden"
        >
          {['How It Works', 'Networks', 'Tiers'].map(link => (
            <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`}
              onClick={() => setMenuOpen(false)}
              className="text-light/70 hover:text-light font-inter text-sm">
              {link}
            </a>
          ))}
          {walletsLinked && (
            <div className="border-t border-white/5 pt-4 flex flex-col gap-2">
              <p className="font-inter text-xs text-light/30 uppercase tracking-wider">Active Chain</p>
              {(Object.entries(CHAIN_CONFIG) as [ActiveChain, typeof chain][]).map(([key, cfg]) => (
                <button key={key} onClick={() => { setActiveChain(key); setMenuOpen(false); }}
                  className={`flex items-center gap-2 text-sm font-inter ${activeChain === key ? cfg.color : 'text-light/50'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                  {activeChain === key && <span className="ml-auto">✓</span>}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
}

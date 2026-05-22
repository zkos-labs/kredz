import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp, type ActiveChain } from '../context/AppContext';
import { toast } from './Toast';

function truncate(addr: string) {
  return addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
}

const CHAIN_CONFIG: Record<ActiveChain, { label: string; dot: string }> = {
  midnight: { label: 'Midnight', dot: 'bg-purple-400' },
  base: { label: 'Base', dot: 'bg-blue-400' },
  solana: { label: 'Solana', dot: 'bg-emerald-400' },
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
      className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 flex items-center justify-center"
    >
      {/* Center pill container */}
      <div className="bg-black rounded-full px-4 py-2 md:px-6 flex items-center gap-4 md:gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 rounded-md bg-[#DEDBC8] flex items-center justify-center">
            <span className="text-black font-black text-xs">K</span>
          </div>
          <span className="font-medium text-sm text-[#E1E0CC] tracking-tight hidden sm:inline">KREDZ</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6">
          {['How It Works', 'Networks', 'Tiers'].map(link => (
            <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`}
              className="text-[10px] sm:text-xs font-medium transition-colors duration-200 hover:text-[#E1E0CC]"
              style={{ color: 'rgba(225, 224, 204, 0.7)' }}>
              {link}
            </a>
          ))}
          {walletsLinked && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#DEDBC8]/10 text-[#DEDBC8]/60">
              4 Networks
            </span>
          )}
        </div>

        {/* Wallet + chain controls */}
        <div className="flex items-center gap-2">
          {wallet ? (
            <>
              {/* Chain switcher */}
              {walletsLinked && (
                <div className="relative">
                  <button
                    onClick={() => setChainDropdown(o => !o)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A1A1A] border border-[#DEDBC8]/10 text-xs transition-colors hover:border-[#DEDBC8]/20"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${chain.dot}`} />
                    <span className="text-[#DEDBC8]/70">{chain.label}</span>
                    <ChevronDown size={10} className="text-[#DEDBC8]/30" />
                  </button>
                  <AnimatePresence>
                    {chainDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 right-0 bg-[#141414] rounded-xl p-1.5 min-w-[130px] border border-[#DEDBC8]/10"
                      >
                        {(Object.entries(CHAIN_CONFIG) as [ActiveChain, typeof chain][]).map(([key, cfg]) => (
                          <button
                            key={key}
                            onClick={() => { setActiveChain(key); setChainDropdown(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors hover:bg-[#1A1A1A] ${activeChain === key ? 'bg-[#1A1A1A]' : ''}`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            <span className="text-[#DEDBC8]/70">{cfg.label}</span>
                            {activeChain === key && <span className="ml-auto text-[#DEDBC8]/30">&#10003;</span>}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Address pill */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A1A1A] border border-[#DEDBC8]/10 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[#DEDBC8]/60">{truncate(displayAddr)}</span>
              </div>

              <button onClick={handleDisconnect}
                className="p-1.5 rounded-full text-[#DEDBC8]/30 hover:text-red-400 transition-colors">
                <LogOut size={13} />
              </button>
            </>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#DEDBC8] text-black font-medium text-xs transition-all hover:gap-2 disabled:opacity-50"
            >
              <Wallet size={12} />
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
          )}

          <button className="md:hidden p-1.5 text-[#DEDBC8]/50" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-4 right-4 bg-[#111] rounded-2xl p-5 flex flex-col gap-4 md:hidden border border-[#DEDBC8]/5"
          >
            {['How It Works', 'Networks', 'Tiers'].map(link => (
              <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`}
                onClick={() => setMenuOpen(false)}
                className="text-[#DEDBC8]/60 hover:text-[#DEDBC8] text-sm font-medium">
                {link}
              </a>
            ))}
            {walletsLinked && (
              <div className="border-t border-[#DEDBC8]/5 pt-4 flex flex-col gap-2">
                <p className="text-[10px] text-[#DEDBC8]/30 uppercase tracking-wider">Active Chain</p>
                {(Object.entries(CHAIN_CONFIG) as [ActiveChain, typeof chain][]).map(([key, cfg]) => (
                  <button key={key} onClick={() => { setActiveChain(key); setMenuOpen(false); }}
                    className={`flex items-center gap-2 text-sm font-medium ${activeChain === key ? 'text-[#DEDBC8]' : 'text-[#DEDBC8]/50'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                    {activeChain === key && <span className="ml-auto">&#10003;</span>}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

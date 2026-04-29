import { motion } from 'framer-motion';
import { Wallet, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { toast } from './Toast';

function truncate(addr: string) {
  return addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

export function Navbar() {
  const { wallet, connect, disconnect, isConnecting } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  async function handleConnect() {
    try {
      await connect();
      toast('Wallet connected', 'success');
      navigate('/app');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'LACE_NOT_FOUND') {
        toast('Please install Lace Beta Wallet for Midnight Network', 'error');
      } else {
        toast('Connection failed. Please try again.', 'error');
      }
    }
  }

  async function handleDisconnect() {
    await disconnect();
    navigate('/');
    toast('Wallet disconnected', 'info');
  }

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
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-8">
        {['How It Works', 'Tiers', 'Score'].map(link => (
          <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`}
            className="text-sm font-inter text-light/60 hover:text-light transition-colors">
            {link}
          </a>
        ))}
      </div>

      {/* Wallet button */}
      <div className="flex items-center gap-3">
        {wallet ? (
          <div className="flex items-center gap-2">
            <div className="glass px-3 py-1.5 rounded-full flex items-center gap-2 text-sm text-light/80">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="font-inter">{truncate(wallet.state.address)}</span>
            </div>
            <button onClick={handleDisconnect}
              className="p-2 rounded-full glass text-light/60 hover:text-red-400 transition-colors">
              <LogOut size={15} />
            </button>
          </div>
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

        {/* Mobile menu toggle */}
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
          {['How It Works', 'Tiers', 'Score'].map(link => (
            <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`}
              onClick={() => setMenuOpen(false)}
              className="text-light/70 hover:text-light font-inter text-sm">
              {link}
            </a>
          ))}
        </motion.div>
      )}
    </motion.nav>
  );
}

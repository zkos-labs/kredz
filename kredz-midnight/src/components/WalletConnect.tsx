import { Loader2, LogOut, Shield, Smartphone } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

export default function WalletConnect() {
  const { isConnected, address, walletType, walletStatus, isConnecting, connect, disconnect } = useWallet();

  if (walletStatus === 'checking')
    return (
      <div className="text-zinc-500 text-xs font-mono animate-pulse">
        Checking wallet...
      </div>
    );

  if (isConnected && address)
    return (
      <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-lg px-3 py-2">
        {walletType === 'lace'
          ? <Smartphone className="w-3.5 h-3.5 text-violet-400" />
          : <Shield className="w-3.5 h-3.5 text-violet-400" />}
        <div className="min-w-0">
          <span className="text-[9px] tracking-[0.2em] font-mono text-zinc-500 uppercase block">
            {walletType === '1am' ? '1AM' : 'Lace'} / {address.slice(0, 8)}...
          </span>
        </div>
        <button onClick={disconnect} title="Disconnect" className="ml-1 text-zinc-500 hover:text-red-400 transition-colors">
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={() => connect('preprod')}
        disabled={isConnecting}
        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:opacity-40 text-white text-xs font-mono tracking-widest uppercase py-2.5 px-5 rounded-lg transition-all"
      >
        {isConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
        Connect 1AM Wallet
      </button>
      {walletStatus === 'not-found' && (
        <p className="text-[10px] font-mono text-zinc-500">
          Install <a href="https://1am.xyz/install-beta" target="_blank" rel="noopener noreferrer" className="text-violet-400 underline">1AM Wallet</a> extension
        </p>
      )}
    </div>
  );
}

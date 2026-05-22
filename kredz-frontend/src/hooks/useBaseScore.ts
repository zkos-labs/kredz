import { useState, useCallback } from 'react';
import { ethers } from 'ethers';

const BADGE_ADDRESS = import.meta.env.VITE_BADGE_ADDRESS as string | undefined;
const BASE_RPC = (import.meta.env.VITE_BASE_RPC as string | undefined) ?? 'https://sepolia.base.org';

const BADGE_ABI = [
  'function tokenOfOwner(address user) external view returns (uint256)',
  'function badgeData(uint256 tokenId) external view returns (uint16 score, uint8 tier, uint64 timestamp)',
  'function mintOrUpdate(address user, uint16 score, uint8 tier, uint64 timestamp) external',
];

export interface BaseScoreData {
  score: number;
  tier: number;
  timestamp: number;
  tokenId: number;
}

export function useBaseScore() {
  const [data, setData] = useState<BaseScoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = useCallback(async (userAddress: string) => {
    if (!BADGE_ADDRESS) return;
    setLoading(true);
    setError(null);
    try {
      const provider = new ethers.JsonRpcProvider(BASE_RPC);
      const badge = new ethers.Contract(BADGE_ADDRESS, BADGE_ABI, provider);
      const tokenId = await badge.tokenOfOwner(userAddress) as bigint;
      if (tokenId === 0n) { setData(null); return; }
      const [score, tier, timestamp] = await badge.badgeData(tokenId) as [bigint, bigint, bigint];
      setData({
        score: Number(score),
        tier: Number(tier),
        timestamp: Number(timestamp),
        tokenId: Number(tokenId),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Base score');
    } finally {
      setLoading(false);
    }
  }, []);

  const mintBadge = useCallback(async (userAddress: string, score: number, tier: number, timestamp: number) => {
    if (!BADGE_ADDRESS) throw new Error('Badge contract not configured');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eth = (window as any).ethereum;
    if (!eth) throw new Error('MetaMask not found');
    setMinting(true);
    try {
      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();
      const badge = new ethers.Contract(BADGE_ADDRESS, BADGE_ABI, signer);
      const tx = await badge.mintOrUpdate(userAddress, score, tier, timestamp);
      await tx.wait();
      await fetchScore(userAddress);
    } finally {
      setMinting(false);
    }
  }, [fetchScore]);

  return { data, loading, minting, error, fetchScore, mintBadge };
}

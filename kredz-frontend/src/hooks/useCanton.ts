import { useState, useCallback } from 'react';

interface CantonScore {
  borrowerDid: string;
  score: number;
  tier: string;
  proofHash: string;
  updatedAt: string;
  expiresAt: string;
}

interface CantonConfig {
  ledgerApiUrl: string;
  kredzPartyId: string;
}

const DEFAULT_CONFIG: CantonConfig = {
  ledgerApiUrl: import.meta.env.VITE_CANTON_LEDGER_API || 'http://localhost:3975',
  kredzPartyId: import.meta.env.VITE_CANTON_KREDZ_PARTY || 'kredz',
};

export function useCanton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryScore = useCallback(async (borrowerDid: string, config: Partial<CantonConfig> = {}) => {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${cfg.ledgerApiUrl}/v1/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateIds: ['kredz:KredzScore'],
          query: { 'template.kredz:KredzScore': { borrowerDid } },
        }),
      });

      if (!response.ok) {
        throw new Error(`Canton API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const contracts = data.result || [];
      const score = contracts.length > 0 ? parseContract(contracts[0]) : null;
      setLoading(false);
      return score;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Canton query failed';
      setError(msg);
      setLoading(false);
      return null;
    }
  }, []);

  const checkHealth = useCallback(async (config: Partial<CantonConfig> = {}) => {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    try {
      const res = await fetch(`${cfg.ledgerApiUrl}/v1/health`);
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  return { queryScore, checkHealth, loading, error };
}

function parseContract(contract: Record<string, unknown>): CantonScore {
  const args = (contract.argument ?? {}) as Record<string, unknown>;
  return {
    borrowerDid: String(args.borrowerDid ?? ''),
    score: Number(args.score ?? 0),
    tier: String(args.tier ?? 'anonymous'),
    proofHash: String(args.proofHash ?? ''),
    updatedAt: String(args.updatedAt ?? ''),
    expiresAt: String(args.expiresAt ?? ''),
  };
}

import type { ConnectedWallet } from '../hooks/useMidnightWallet';

// Dynamic imports prevent Vite from statically bundling Node.js-only / WASM
// packages into the browser bundle. These resolve only at call-time.
export async function buildProviders(connected: ConnectedWallet) {
  const { connectedAPI, uris } = connected;

  const [
    { FetchZkConfigProvider },
    { indexerPublicDataProvider },
  ] = await Promise.all([
    import('@midnight-ntwrk/midnight-js-fetch-zk-config-provider'),
    import('@midnight-ntwrk/midnight-js-indexer-public-data-provider'),
  ]);

  const zkConfigProvider = new FetchZkConfigProvider(
    '/contracts/managed/kredz',  // ZK keys served from local dev server or CDN
    fetch.bind(window),
  );

  const publicDataProvider = indexerPublicDataProvider(
    uris.indexerUri, uris.indexerWsUri,
  );

  // 1AM dust-free proving: ProofStation handles ZK proof generation server-side.
  // The wallet's getProvingProvider() returns a native binary prover (~2-5 seconds).
  const provingProvider = await connectedAPI.getProvingProvider(zkConfigProvider);

  const proofProvider = {
    async proveTx(unprovenTx: unknown) {
      const { CostModel } = await import('@midnight-ntwrk/ledger-v8');
      return (unprovenTx as { prove: (p: unknown, m: unknown) => Promise<unknown> })
        .prove(provingProvider, CostModel.initialCostModel());
    },
  };

  const shielded = await connectedAPI.getShieldedAddresses();

  const walletProvider = {
    getCoinPublicKey: () => (shielded as unknown as Record<string, string>).shieldedCoinPublicKey,
    getEncryptionPublicKey: () => (shielded as unknown as Record<string, string>).shieldedEncryptionPublicKey,
    async balanceTx(tx: unknown) {
      const { Transaction } = await import('@midnight-ntwrk/ledger-v8');
      const serialized = (tx as { serialize(): Uint8Array }).serialize();
      const hex = Array.from(serialized).map(b => b.toString(16).padStart(2, '0')).join('');
      const result = await connectedAPI.balanceUnsealedTransaction(hex);
      const bytes = new Uint8Array(result.tx.match(/.{2}/g)!.map((b: string) => parseInt(b, 16)));
      return Transaction.deserialize('signature', 'proof', 'binding', bytes);
    },
  };

  const midnightProvider = {
    async submitTx(tx: unknown) {
      const serialized = (tx as { serialize(): Uint8Array }).serialize();
      const hex = Array.from(serialized).map(b => b.toString(16).padStart(2, '0')).join('');
      await connectedAPI.submitTransaction(hex);
      return (tx as { identifiers(): string[] }).identifiers()[0];
    },
  };

  return { publicDataProvider, zkConfigProvider, proofProvider, walletProvider, midnightProvider };
}

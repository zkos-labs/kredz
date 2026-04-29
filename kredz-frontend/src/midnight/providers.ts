import type { ConnectedWallet } from '../hooks/useMidnightWallet';

// Dynamic imports prevent Vite from statically bundling Node.js-only / WASM
// packages into the browser bundle. These resolve only at call-time.
export async function buildProviders(connected: ConnectedWallet) {
  const { state, uris, walletAPI } = connected;

  const [
    { FetchZkConfigProvider },
    { httpClientProofProvider },
    { indexerPublicDataProvider },
    { levelPrivateStateProvider },
  ] = await Promise.all([
    import('@midnight-ntwrk/midnight-js-fetch-zk-config-provider'),
    import('@midnight-ntwrk/midnight-js-http-client-proof-provider'),
    import('@midnight-ntwrk/midnight-js-indexer-public-data-provider'),
    import('@midnight-ntwrk/midnight-js-level-private-state-provider'),
  ]);

  return {
    privateStateProvider: levelPrivateStateProvider({ privateStateStoreName: 'kredz-private-state' }),
    zkConfigProvider: new FetchZkConfigProvider(window.location.origin, fetch.bind(window)),
    proofProvider: httpClientProofProvider(uris.proverServerUri),
    publicDataProvider: indexerPublicDataProvider(uris.indexerUri, uris.indexerWsUri),
    walletProvider: {
      coinPublicKey: state.coinPublicKey,
      encryptionPublicKey: state.encryptionPublicKey,
      balanceTx: (tx: unknown, newCoins: unknown) => walletAPI.balanceAndProveTransaction(tx, newCoins),
    },
    midnightProvider: {
      submitTx: (tx: unknown) => walletAPI.submitTransaction(tx),
    },
  };
}

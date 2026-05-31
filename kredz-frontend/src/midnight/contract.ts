import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { createUnprovenDeployTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import { toHex, fromHex } from './hex';
import { createPatchedPublicDataProvider } from './indexer-patch';
import { createPrivateStateProvider } from './private-state';
import { makeWitnesses, persistSecret } from './witnesses';
import type { ConnectedAPI } from './types';

let cachedContract: any = null;

async function loadContract(): Promise<any> {
  if (cachedContract) return cachedContract;
  const mod = await import('../../contracts/managed/kredz-score-profile/contract/index.js');
  cachedContract = mod.Contract;
  return cachedContract;
}

function getCompiledContract(): any {
  if (!cachedContract) throw new Error('Contract not loaded');
  return (CompiledContract.make as any)('kredz_score_profile', cachedContract).pipe(
    (CompiledContract as any).withWitnesses(makeWitnesses()),
    (CompiledContract as any).withCompiledFileAssets('/contract/kredz-score-profile'),
  );
}

function buildSessionProviders(api: ConnectedAPI) {
  const zkConfigProvider = new FetchZkConfigProvider<any>(
    new URL('/contract/kredz-score-profile', window.location.origin).toString(),
    window.fetch.bind(window),
  );

  const publicDataProvider = createPatchedPublicDataProvider(
    '', '',
  );

  const privateStateProvider = createPrivateStateProvider();

  return { zkConfigProvider, publicDataProvider, privateStateProvider };
}

export async function deployContract(api: ConnectedAPI): Promise<string> {
  const Contract = await loadContract();
  const compiledContract = getCompiledContract();

  const config = await api.getConfiguration();
  setNetworkId(config.networkId);

  const { zkConfigProvider, publicDataProvider, privateStateProvider } = buildSessionProviders(api);
  const shielded = await api.getShieldedAddresses();
  const provingProvider = await api.getProvingProvider(zkConfigProvider as any);

  const walletProvider = {
    getCoinPublicKey: () => shielded.shieldedCoinPublicKey,
    getEncryptionPublicKey: () => shielded.shieldedEncryptionPublicKey,
    balanceTx: async (tx: any) => {
      const txHex = toHex(tx.serialize());
      const balanced = await api.balanceUnsealedTransaction(txHex);
      if (!balanced?.tx) throw new Error('balanceUnsealedTransaction failed');
      const { Transaction } = await import('@midnight-ntwrk/ledger-v8');
      return Transaction.deserialize('signature', 'proof', 'binding', fromHex(balanced.tx));
    },
  };

  const midnightProvider = {
    submitTx: async (tx: any) => {
      const txHex = toHex(tx.serialize());
      const result = await api.submitTransaction(txHex);
      if (typeof result === 'string' && result) return result;
      if (result?.transactionId) return result.transactionId;
      if (result?.id) return result.id;
      return txHex.slice(0, 64);
    },
  };

  const providers = {
    zkConfigProvider,
    publicDataProvider,
    privateStateProvider,
    proofProvider: {
      async proveTx(unprovenTx: any) {
        const { CostModel } = await import('@midnight-ntwrk/ledger-v8');
        return unprovenTx.prove(provingProvider, CostModel.initialCostModel());
      },
    },
    walletProvider,
    midnightProvider,
  };

  const deployTxData = await createUnprovenDeployTx(
    { zkConfigProvider: providers.zkConfigProvider, walletProvider: providers.walletProvider },
    { compiledContract, args: [], signingKey: sampleSigningKey() },
  );

  const contractAddress = deployTxData.public.contractAddress;

  await submitTxAsync(providers as any, { unprovenTx: deployTxData.private.unprovenTx });

  await privateStateProvider.setContractAddress(contractAddress);
  await privateStateProvider.setSigningKey(contractAddress, deployTxData.private.signingKey);
  await persistSecret({ providers: { privateStateProvider } } as any, contractAddress);

  return contractAddress;
}

export async function waitForContractIndexed(
  api: ConnectedAPI,
  contractAddress: string,
  maxAttempts = 30,
): Promise<void> {
  const config = await api.getConfiguration();
  const publicDataProvider = createPatchedPublicDataProvider(config.indexerUri, config.indexerWsUri);
  for (let i = 0; i < maxAttempts; i++) {
    const state = await publicDataProvider.queryContractState(contractAddress);
    if (state?.data) return;
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error('Contract not indexed after polling');
}

export async function joinKredzContract(_api: ConnectedAPI, _address: string) {
  return {
    async getContractState() {
      return { data: { tier: 0 } };
    },
    async updateScore(_data: string) {},
  };
}

import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { createUnprovenDeployTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import { toHex, fromHex } from './hex';
import { createPatchedPublicDataProvider } from './indexer-patch';
import { createPrivateStateProvider } from './private-state';
import { makeWitnesses, persistSecret } from './witnesses';

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

export async function deployContract(api: any): Promise<string> {
  await loadContract();
  const compiledContract = getCompiledContract();

  const config = await api.getConfiguration();
  setNetworkId(config.networkId);

  const { zkConfigProvider } = createSessionProviders(api);
  const shielded = await api.getShieldedAddresses();
  const provingProvider = await api.getProvingProvider(zkConfigProvider as any);
  const privateStateProvider = createPrivateStateProvider();

  const providers: any = {
    zkConfigProvider,
    privateStateProvider,
    proofProvider: {
      async proveTx(unprovenTx: any) {
        const { CostModel } = await import('@midnight-ntwrk/ledger-v8');
        return unprovenTx.prove(provingProvider, CostModel.initialCostModel());
      },
    },
    walletProvider: {
      getCoinPublicKey: () => shielded.shieldedCoinPublicKey,
      getEncryptionPublicKey: () => shielded.shieldedEncryptionPublicKey,
      balanceTx: async (tx: any) => {
        const txHex = toHex(tx.serialize());
        const balanced = await api.balanceUnsealedTransaction(txHex);
        if (!balanced?.tx) throw new Error('balanceUnsealedTransaction failed');
        const { Transaction } = await import('@midnight-ntwrk/ledger-v8');
        return Transaction.deserialize('signature', 'proof', 'binding', fromHex(balanced.tx));
      },
    },
    midnightProvider: {
      submitTx: async (tx: any) => {
        const txHex = toHex(tx.serialize());
        const result = await api.submitTransaction(txHex);
        return (result as any)?.transactionId
          ?? (result as any)?.id
          ?? (result as any)?.txId
          ?? String(txHex.slice(0, 64));
      },
    },
  };

  const deployTxData = await createUnprovenDeployTx(providers, {
    compiledContract,
    args: [],
    signingKey: sampleSigningKey(),
  } as any);

  const contractAddress = deployTxData.public.contractAddress;
  await submitTxAsync(providers, { unprovenTx: deployTxData.private.unprovenTx } as any);

  await privateStateProvider.setContractAddress(contractAddress);
  await privateStateProvider.setSigningKey(contractAddress, deployTxData.private.signingKey);
  await persistSecret({ providers: { privateStateProvider } } as any, contractAddress);

  return contractAddress;
}

export async function waitForContractIndexed(
  api: any,
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

export async function joinKredzContract(api: any, address: string) {
  const config = await api.getConfiguration();
  const publicDataProvider = createPatchedPublicDataProvider(config.indexerUri, config.indexerWsUri);

  const { ledger } = await import('../../contracts/managed/kredz-score-profile/contract/index.js');

  return {
    async getContractState() {
      const contractState = await publicDataProvider.queryContractState(address);
      if (!contractState?.data) {
        return { data: { tier: 0 as const, tiers: { isEmpty: () => true } } };
      }
      const contractLedger = ledger(contractState.data);
      const tiers = contractLedger.tiers;
      const hasTier = !tiers.isEmpty();
      const tier = hasTier ? Number(tiers.lookup(new Uint8Array(32))) : 0;
      return {
        data: {
          tier: Math.min(Math.max(tier, 0), 2) as 0 | 1 | 2,
          tiers: contractLedger.tiers,
          score_hashes: contractLedger.score_hashes,
          total_users: contractLedger.total_users,
          attestor_key: contractLedger.attestor_key,
        },
      };
    },
    async updateScore(_data: string) {},
  };
}

function createSessionProviders(_api: any) {
  return {
    zkConfigProvider: new FetchZkConfigProvider<any>(
      new URL('/contract/kredz-score-profile', window.location.origin).toString(),
      window.fetch.bind(window),
    ),
  };
}

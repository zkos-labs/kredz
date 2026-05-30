import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { createUnprovenDeployTx, submitTxAsync, createUnprovenCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { sampleSigningKey } from '@midnight-ntwrk/compact-runtime';
import type { ConnectedSession } from './session';
import { makeWitnesses, persistSecret } from './witnesses';

let cachedContract: any = null;
let cachedLedger: any = null;

async function loadContract() {
  if (cachedContract) return;
  const mod = await import('../../contracts/managed/kredz-score-profile/contract/index.js');
  cachedContract = mod.Contract;
  cachedLedger = mod.ledger;
}

function getCompiledContract(): any {
  if (!cachedContract) throw new Error('Contract not loaded');
  return (CompiledContract.make as any)('kredz_score_profile', cachedContract).pipe(
    (CompiledContract as any).withWitnesses(makeWitnesses()),
    (CompiledContract as any).withCompiledFileAssets('/contract/kredz-score-profile'),
  );
}

export async function deployContract(session: ConnectedSession): Promise<string> {
  await loadContract();
  const compiledContract = getCompiledContract();

  const deployTxData = await createUnprovenDeployTx(
    { zkConfigProvider: session.providers.zkConfigProvider, walletProvider: session.providers.walletProvider },
    { compiledContract, args: [], signingKey: sampleSigningKey() },
  );

  const contractAddress = deployTxData.public.contractAddress;

  await submitTxAsync(session.providers as any, { unprovenTx: deployTxData.private.unprovenTx });

  await session.providers.privateStateProvider.setContractAddress(contractAddress);
  await session.providers.privateStateProvider.setSigningKey(contractAddress, deployTxData.private.signingKey);
  await persistSecret(session, contractAddress);

  return contractAddress;
}

export async function callCircuit(
  session: ConnectedSession,
  contractAddress: string,
  circuitId: string,
  args: any[],
): Promise<string> {
  await loadContract();
  const compiledContract = getCompiledContract();

  const callTxData = await createUnprovenCallTx(session.providers as any, {
    compiledContract,
    contractAddress,
    circuitId,
    args,
  });

  const txId = await submitTxAsync(session.providers as any, {
    unprovenTx: callTxData.private.unprovenTx,
    circuitId,
  });

  return txId;
}

export async function waitForContractIndexed(
  session: ConnectedSession,
  contractAddress: string,
  maxAttempts = 30,
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const state = await session.providers.publicDataProvider.queryContractState(contractAddress);
    if (state?.data) return;
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error('Contract not indexed after polling');
}

export async function readContractState(session: ConnectedSession, contractAddress: string): Promise<any> {
  await loadContract();
  const state = await session.providers.publicDataProvider.queryContractState(contractAddress);
  return state?.data ? cachedLedger(state.data) : null;
}

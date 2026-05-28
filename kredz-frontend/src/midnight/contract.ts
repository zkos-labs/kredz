// Compiled Midnight contract using 1AM wallet (dust-free proving via ProofStation).
// The kredz.compact contract is now compiled — real ZK circuits exist at:
//   contracts/managed/kredz/keys/*.prover (6 circuits)
//
// ZK keys must be hosted on a CDN with CORS for FetchZkConfigProvider.
// For local dev, point FetchZkConfigProvider to the /contracts/managed/kredz path.
import { buildProviders } from './providers';
import type { ConnectedWallet } from '../hooks/useMidnightWallet';
import type { KredzContractAPI } from '../contracts/kredz';

export async function deployKredzContract(wallet: ConnectedWallet): Promise<KredzContractAPI> {
  const providers = await buildProviders(wallet);

  // When deployed to a real Midnight network (preview/preprod/mainnet),
  // use @midnight-ntwrk/midnight-js-contracts to deploy the compiled contract:
  //
  // import { CompiledContract } from '@midnight-ntwrk/compact-js';
  // import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
  // import { Contract as Kredz } from '../contracts/managed/kredz/contract';
  //
  // const compiled = CompiledContract.make('Kredz', Kredz).pipe(
  //   CompiledContract.withVacantWitnesses,
  //   CompiledContract.withCompiledFileAssets('/contracts/managed/kredz'),
  // );
  // const deployed = await deployContract(providers, { compiledContract: compiled });
  // console.log('Contract deployed:', deployed.deployTxData.public.contractAddress);

  void providers; // providers used when real deploy is active

  const mockAddress = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  console.log('[KREDZ] Using mock contract at:', mockAddress, '(compiled ZK keys available)');
  return createMockAPI(mockAddress);
}

export async function joinKredzContract(wallet: ConnectedWallet, address: string): Promise<KredzContractAPI> {
  const providers = await buildProviders(wallet);
  void providers;
  void address;
  return createMockAPI(address);
}

function createMockAPI(address: string): KredzContractAPI {
  let mockTier = 0;
  let mockScore = 0;
  let mockEvmAddress = new Uint8Array(20);
  let mockAttestation = new Uint8Array(32);

  return {
    deployedContractAddress: address,
    async getContractState() {
      return {
        data: {
          tier: mockTier,
          scoreHash: new Uint8Array(32),
          attestationTimestamp: BigInt(Date.now()),
          evmAddress: mockEvmAddress,
          solanaAddress: new Uint8Array(32),
          scoreAttestation: mockAttestation,
        },
      };
    },
    async getLedgerState() {
      return {
        ledgerState: {
          tier: mockTier,
          scoreHash: new Uint8Array(32),
          attestationTimestamp: BigInt(Date.now()),
          evmAddress: mockEvmAddress,
          solanaAddress: new Uint8Array(32),
          scoreAttestation: mockAttestation,
        },
      };
    },
    async setTier0() {
      await new Promise(r => setTimeout(r, 1500));
      mockTier = 0;
      mockScore = Math.floor(Math.random() * 200) + 150;
    },
    async setTier1(attribute: string) {
      await new Promise(r => setTimeout(r, 2000));
      mockTier = 1;
      mockScore = Math.floor(Math.random() * 250) + 350;
      void attribute;
    },
    async setTier2(fullKyc: string) {
      await new Promise(r => setTimeout(r, 2500));
      mockTier = 2;
      mockScore = Math.floor(Math.random() * 350) + 650;
      void fullKyc;
    },
    async linkEvmAddress(addr: string) {
      await new Promise(r => setTimeout(r, 1000));
      const hex = addr.replace('0x', '').padEnd(40, '0').slice(0, 40);
      mockEvmAddress = new Uint8Array(hex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
    },
    async linkSolanaAddress(addr: string) {
      await new Promise(r => setTimeout(r, 1000));
      void addr;
    },
    async updateScore(scoreData: string) {
      await new Promise(r => setTimeout(r, 1000));
      mockScore += Math.floor(Math.random() * 50) + 10;
      const score = Math.min(mockScore, 1000);
      mockAttestation = new Uint8Array(32);
      mockAttestation[0] = (score >> 8) & 0xff;
      mockAttestation[1] = score & 0xff;
      mockAttestation.set(mockEvmAddress, 2);
      const ts = BigInt(Date.now());
      for (let i = 0; i < 8; i++) mockAttestation[22 + i] = Number((ts >> BigInt(56 - i * 8)) & 0xffn);
      void scoreData;
    },
  };
}

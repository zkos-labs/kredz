import { buildProviders } from './providers';
import type { ConnectedWallet } from '../hooks/useMidnightWallet';
import type { KredzContractAPI } from '../contracts/kredz';

// Mock contract API for now — replace with real MidnightSetupAPI after compiling kredz.compact
export async function deployKredzContract(wallet: ConnectedWallet): Promise<KredzContractAPI> {
  await buildProviders(wallet);
  
  // TODO: Replace with real deployment after compiling kredz.compact:
  // const contractInstance = new KredzContract({});
  // const api = await MidnightSetupAPI.deployContract(providers, contractInstance);
  
  // Mock deployment for now
  const mockAddress = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  console.log('[KREDZ] Mock contract deployed at:', mockAddress);
  
  return createMockAPI(mockAddress);
}

export async function joinKredzContract(wallet: ConnectedWallet, address: string): Promise<KredzContractAPI> {
  await buildProviders(wallet);
  
  // TODO: Replace with real join after compiling kredz.compact:
  // const contractInstance = new KredzContract({});
  // const api = await MidnightSetupAPI.joinContract(providers, contractInstance, address);
  
  return createMockAPI(address);
}

function createMockAPI(address: string): KredzContractAPI {
  let mockTier = 0;
  let mockScore = 0;
  
  return {
    deployedContractAddress: address,
    async getContractState() {
      return {
        data: {
          tier: mockTier,
          scoreHash: new Uint8Array(32),
          attestationTimestamp: BigInt(Date.now()),
        },
      };
    },
    async getLedgerState() {
      return {
        ledgerState: {
          tier: mockTier,
          scoreHash: new Uint8Array(32),
          attestationTimestamp: BigInt(Date.now()),
        },
      };
    },
    async setTier0() {
      console.log('[KREDZ] Setting tier 0 (Anonymous)');
      await new Promise(r => setTimeout(r, 1500));
      mockTier = 0;
      mockScore = Math.floor(Math.random() * 200) + 150;
    },
    async setTier1(attribute: string) {
      console.log('[KREDZ] Setting tier 1 (Pseudonymous) with attribute:', attribute);
      await new Promise(r => setTimeout(r, 2000));
      mockTier = 1;
      mockScore = Math.floor(Math.random() * 250) + 350;
    },
    async setTier2(fullKyc: string) {
      console.log('[KREDZ] Setting tier 2 (Full Compliance) with KYC:', fullKyc);
      await new Promise(r => setTimeout(r, 2500));
      mockTier = 2;
      mockScore = Math.floor(Math.random() * 350) + 650;
    },
    async updateScore(scoreData: string) {
      console.log('[KREDZ] Updating score with data:', scoreData);
      await new Promise(r => setTimeout(r, 1000));
      mockScore += Math.floor(Math.random() * 50) + 10;
    },
  };
}

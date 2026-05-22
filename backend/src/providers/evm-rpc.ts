import { ethers } from 'ethers';
import { config } from '../config';

export function getBaseProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(config.BASE_RPC_URL);
}

export async function readScoreOnBase(
  evmAddress: string,
): Promise<{ score: number; tier: string; validUntil: number } | null> {
  try {
    const provider = getBaseProvider();

    const oracleAbi = [
      'function getScore(address borrower) external view returns (uint256 score, string memory tier, uint256 validUntil)',
    ];

    const oracle = new ethers.Contract(
      evmAddress, // TODO: replace with actual KredzOracle contract address
      oracleAbi,
      provider,
    );

    const [score, tier, validUntil] = await oracle.getScore(evmAddress);
    return {
      score: Number(score),
      tier,
      validUntil: Number(validUntil),
    };
  } catch (err) {
    console.warn('[evm-rpc] failed to read score from Base:', (err as Error).message);
    return null;
  }
}

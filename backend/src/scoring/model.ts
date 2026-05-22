import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { WalletAnalysis, ZKKYCCredential, LiteracyData, Tier, LayerScores } from '../types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PYTHON_BRIDGE = join(__dirname, '../../python/bridge.py');

interface MLResult {
  layer1: number;
  layer2: number;
  layer3: number;
  total: number;
}

export function runMLInference(
  wallet: WalletAnalysis,
  kyc: ZKKYCCredential,
  literacy: LiteracyData,
  tier: Tier,
): Promise<MLResult> {
  return new Promise((resolve, reject) => {
    const py = spawn('python3', [PYTHON_BRIDGE]);

    let stdout = '';
    let stderr = '';

    py.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
    py.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });

    py.on('close', (code) => {
      if (code !== 0) {
        console.error(`[ml] python exited with code ${code}: ${stderr}`);
        resolve(fallbackScore(tier));
        return;
      }

      try {
        const result: MLResult = JSON.parse(stdout);
        resolve(result);
      } catch {
        console.error('[ml] failed to parse ML output, using fallback');
        resolve(fallbackScore(tier));
      }
    });

    py.on('error', (err) => {
      console.error('[ml] failed to spawn python:', err.message);
      resolve(fallbackScore(tier));
    });

    const input = JSON.stringify({ wallet, kyc, literacy, tier });
    py.stdin.write(input);
    py.stdin.end();
  });
}

function fallbackScore(tier: Tier): MLResult {
  const layer1 = 120 + (tier === 2 ? 80 : 0);
  const layer2 = tier >= 1 ? 180 : 0;
  const layer3 = 30;
  return {
    layer1,
    layer2,
    layer3,
    total: layer1 + layer2 + layer3,
  };
}

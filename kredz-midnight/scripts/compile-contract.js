import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const contractPath = resolve(root, 'contracts/kredz_score_profile.compact');
const managedPath = resolve(root, 'contracts/managed/kredz-score-profile');

if (!existsSync(contractPath)) {
  console.error('Contract not found:', contractPath);
  process.exit(1);
}

console.log('Compiling kredz_score_profile.compact...');

try {
  const versionOutput = execSync('compact --version', { encoding: 'utf-8' });
  const versionMatch = versionOutput.match(/(\d+\.\d+\.\d+)/);
  if (versionMatch) {
    console.log('compact version:', versionMatch[1]);
    const [major, minor] = versionMatch[1].split('.').map(Number);
    if (major !== 0 || minor < 5) {
      console.error(`ERROR: compact version ${versionMatch[1]} detected. This project requires compact 0.5.x. Install with: npm install -g @midnight-ntwrk/compact@0.5.1`);
      process.exit(1);
    }
  }
} catch {
  console.error('ERROR: compact compiler not found on PATH. Install from https://docs.midnight.network/getting-started');
  process.exit(1);
}

try {
  execSync(`compact compile "${contractPath}" "${managedPath}"`, { stdio: 'inherit', cwd: root });
} catch (e) {
  console.error('Compilation failed');
  process.exit(1);
}

console.log('');
console.log('Run "npm run sync-zk" to copy ZK assets to public/');

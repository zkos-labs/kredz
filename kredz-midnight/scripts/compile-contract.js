import { execSync } from 'child_process';
import { existsSync, mkdirSync, cpSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const contractPath = resolve(root, 'contracts/kredz_score_profile.compact');
const managedPath = resolve(root, 'contracts/managed/kredz-score-profile');
const publicPath = resolve(root, 'public/contract/kredz-score-profile');
const compiledPath = resolve(root, 'contracts/managed/kredz-score-profile/compiled');

if (!existsSync(contractPath)) {
  console.error('Contract not found:', contractPath);
  process.exit(1);
}

console.log('Compiling kredz_score_profile.compact...');
try {
  execSync(`compact compile "${contractPath}" "${managedPath}"`, {
    stdio: 'inherit',
    cwd: root,
  });
} catch (e) {
  console.error('Compilation failed. Check that compactc/compact is installed and on PATH.');
  process.exit(1);
}

console.log('Compilation successful.');
console.log('');
console.log('Run `npm run sync-zk` to copy ZK assets to public/');

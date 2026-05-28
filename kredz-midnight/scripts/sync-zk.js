import { existsSync, mkdirSync, cpSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const managedPath = resolve(root, 'contracts/managed/kredz-score-profile');
const publicPath = resolve(root, 'public/contract/kredz-score-profile');

if (!existsSync(managedPath)) {
  console.error('Managed contract directory not found:', managedPath);
  console.error('Run `npm run compile` first.');
  process.exit(1);
}

mkdirSync(publicPath, { recursive: true });

// Copy keys and zkir directories
for (const dir of ['keys', 'zkir']) {
  const srcDir = resolve(managedPath, dir);
  if (existsSync(srcDir)) {
    const destDir = resolve(publicPath, dir);
    mkdirSync(destDir, { recursive: true });
    cpSync(srcDir, destDir, { recursive: true });
    console.log(`Synced ${dir}/ → public/contract/kredz-score-profile/${dir}/`);
  }
}

// Copy contract index
const contractIndex = resolve(managedPath, 'contract/index.js');
if (existsSync(contractIndex)) {
  const destDir = resolve(publicPath, 'contract');
  mkdirSync(destDir, { recursive: true });
  cpSync(contractIndex, resolve(destDir, 'index.js'));
  console.log('Synced contract/index.js');
}

console.log('ZK assets synced. Ready to dev (npm run dev).');

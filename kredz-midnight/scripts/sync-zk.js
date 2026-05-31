import { existsSync, mkdirSync, cpSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const managedPath = resolve(root, 'contracts/managed/kredz-score-profile');
const frontendRoot = resolve(root, '..', 'kredz-frontend');

if (!existsSync(managedPath)) {
  console.error('Managed contract directory not found:', managedPath);
  console.error('Run `npm run compile` first.');
  process.exit(1);
}

// Sync to kredz-frontend/public/contract/ (browser-served ZK assets)
const publicDest = resolve(frontendRoot, 'public/contract/kredz-score-profile');
mkdirSync(publicDest, { recursive: true });
for (const dir of ['keys', 'zkir']) {
  const srcDir = resolve(managedPath, dir);
  if (existsSync(srcDir)) {
    const destDir = resolve(publicDest, dir);
    cpSync(srcDir, destDir, { recursive: true });
    console.log(`Synced ${dir}/ → kredz-frontend/public/contract/kredz-score-profile/${dir}/`);
  }
}
const contractJs = resolve(managedPath, 'contract/index.js');
if (existsSync(contractJs)) {
  mkdirSync(resolve(publicDest, 'contract'), { recursive: true });
  cpSync(contractJs, resolve(publicDest, 'contract/index.js'));
  console.log('Synced contract/index.js → kredz-frontend/public/contract/');
}

// Sync to kredz-frontend/contracts/managed/ (imported by frontend code)
const managedDest = resolve(frontendRoot, 'contracts/managed/kredz-score-profile');
mkdirSync(managedDest, { recursive: true });
cpSync(managedPath, managedDest, { recursive: true });
console.log('Synced managed/ → kredz-frontend/contracts/managed/');

console.log('ZK assets synced. Ready to dev: cd ../kredz-frontend && npm run dev');

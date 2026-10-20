import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const rootDir = path.resolve('.');
const assetsDir = path.resolve('assets');
const distAssetsDir = path.resolve('dist/assets');

if (fs.existsSync(distDir)) {
  // Sync all HTML entry files to workspace root for static / Live Server hosting
  const files = fs.readdirSync(distDir);
  for (const f of files) {
    if (f.endsWith('.html')) {
      fs.copyFileSync(path.join(distDir, f), path.join(rootDir, f));
      console.log(`Synced HTML: ${f}`);
    }
  }

  // Sync dist/assets to root assets/
  if (fs.existsSync(distAssetsDir)) {
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    const newAssets = new Set(fs.readdirSync(distAssetsDir));
    const oldAssets = fs.readdirSync(assetsDir);
    for (const oldFile of oldAssets) {
      if (!newAssets.has(oldFile)) {
        fs.unlinkSync(path.join(assetsDir, oldFile));
        console.log(`Removed stale asset: ${oldFile}`);
      }
    }
    for (const a of newAssets) {
      fs.copyFileSync(path.join(distAssetsDir, a), path.join(assetsDir, a));
      console.log(`Synced asset: ${a}`);
    }
  }
}

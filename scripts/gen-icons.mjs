// Generates PWA PNG icons from inline SVGs using sharp.
// Run with: npm run icons
// Replace public/favicon.svg art and re-run to refresh all icons.

import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pub = resolve(__dirname, '..', 'public');
const iconsDir = resolve(pub, 'icons');
mkdirSync(iconsDir, { recursive: true });

const HEART =
  'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z';

// rounded = normal icon (transparent corners); square = maskable (full bleed)
function svg({ maskable }) {
  const bgRadius = maskable ? 0 : 112;
  // smaller heart inside the safe zone for maskable
  const scale = maskable ? 8 : 10;
  const t = 256 - 12 * scale;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="${bgRadius}" fill="#C2542F" />
    <g transform="translate(${t} ${t}) scale(${scale})">
      <path d="${HEART}" fill="#FFFDF9" />
    </g>
  </svg>`;
}

const jobs = [
  { name: 'icons/icon-192.png', size: 192, maskable: false },
  { name: 'icons/icon-512.png', size: 512, maskable: false },
  { name: 'icons/icon-maskable-512.png', size: 512, maskable: true },
  { name: 'apple-touch-icon.png', size: 180, maskable: false },
];

for (const job of jobs) {
  const buf = Buffer.from(svg({ maskable: job.maskable }));
  await sharp(buf).resize(job.size, job.size).png().toFile(resolve(pub, job.name));
  console.log('wrote', job.name);
}

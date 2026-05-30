/* ============================================================
   Generate Jugnu's voice clips with ElevenLabs.

   Reads every line variant in src/data/content.ts (momentLines)
   and renders one warm, young-female Hindi clip per variant to:

     /public/voice/<moment>-<idx>.mp3

   …then writes /public/voice/voice-manifest.json listing every
   clip that exists. The app (src/lib/voice.ts) reads that manifest,
   prefers the clip, and falls back to the device's Hindi TTS for
   anything not pre-rendered. Multiple variants per moment let Jugnu
   say something a little different each time (rotated at runtime by
   pickJugnuLine), the same trick Chaina uses on the Hindi app.

   Usage (needs network access to api.elevenlabs.io):

     ELEVENLABS_API_KEY=sk_...                 \
     ELEVEN_VOICE_JUGNU=<warm-female-voice-id> \
     node scripts/generate-jugnu-voice.mjs

   Pick the voice id from your ElevenLabs library (any voice works
   with the multilingual model; choose a warm young female). List
   them with:  node scripts/generate-jugnu-voice.mjs --list-voices

   Options (env):
     ELEVEN_MODEL   default eleven_multilingual_v2 (reads Devanagari well)
     ELEVEN_SPEED   0.7–1.2, default 0.92 (a touch unhurried, friendly)
   Flags:
     --force        regenerate clips even if the mp3 already exists
     --list-voices  print your ElevenLabs voices and exit

   The API key is used ONLY here at generation time — it is never
   committed and the runtime never needs it (the clips are static).
   ============================================================ */

import { readFileSync, mkdirSync, existsSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CONTENT = join(ROOT, 'src', 'data', 'content.ts');
const OUT_DIR = join(ROOT, 'public', 'voice');
const MANIFEST = join(OUT_DIR, 'voice-manifest.json');

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVEN_VOICE_JUGNU;
const MODEL = process.env.ELEVEN_MODEL || 'eleven_multilingual_v2';
const SPEED = Number(process.env.ELEVEN_SPEED || '0.92');
const FORCE = process.argv.includes('--force');
const LIST_VOICES = process.argv.includes('--list-voices');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function listVoices() {
  const res = await fetch('https://api.elevenlabs.io/v1/voices', { headers: { 'xi-api-key': API_KEY } });
  if (!res.ok) throw new Error(`${res.status} ${await res.text().catch(() => '')}`);
  const { voices } = await res.json();
  for (const v of voices) {
    const labels = v.labels ? Object.values(v.labels).join(', ') : '';
    console.log(`${v.voice_id}  ${v.name}  [${labels}]`);
  }
}

// Pull the momentLines object literal out of content.ts. It's a plain literal
// of string fields (no references), so we can eval just that slice.
function loadMomentLines() {
  const src = readFileSync(CONTENT, 'utf8');
  const m = src.match(/export const momentLines: Record<string, Line\[\]> = (\{[\s\S]*?\n\});/);
  if (!m) throw new Error('Could not find the momentLines literal in src/data/content.ts');
  // eslint-disable-next-line no-new-func
  return new Function(`return ${m[1]}`)();
}

async function tts(text) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      // Warm + cute + steady: a little expressive style, gentle pace.
      voice_settings: { stability: 0.45, similarity_boost: 0.85, style: 0.2, use_speaker_boost: true, speed: SPEED },
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text().catch(() => '')}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  if (!API_KEY) {
    console.error('Set ELEVENLABS_API_KEY first.');
    process.exit(1);
  }
  if (LIST_VOICES) {
    await listVoices();
    return;
  }
  if (!VOICE_ID) {
    console.error('Set ELEVEN_VOICE_JUGNU=<voice-id>. List options with --list-voices.');
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const momentLines = loadMomentLines();

  let made = 0;
  let skipped = 0;
  let failed = 0;
  console.log(`Jugnu voice: ${VOICE_ID}, model ${MODEL}, speed ${SPEED}.\n`);

  for (const [key, variants] of Object.entries(momentLines)) {
    for (let idx = 0; idx < variants.length; idx++) {
      const hi = variants[idx]?.hi;
      if (!hi) continue;
      const outPath = join(OUT_DIR, `${key}-${idx}.mp3`);
      if (!FORCE && existsSync(outPath)) {
        skipped++;
        console.log(`  · have ${key}-${idx}.mp3`);
        continue;
      }
      try {
        process.stdout.write(`  → ${key}-${idx}  "${hi}" … `);
        const buf = await tts(hi);
        writeFileSync(outPath, buf);
        made++;
        console.log(`(${buf.length} bytes)`);
        await sleep(250); // be polite to the API
      } catch (e) {
        failed++;
        console.log(`FAIL: ${e.message}`);
      }
    }
  }

  // Rebuild the manifest from whatever clips are actually on disk.
  const manifest = {};
  for (const f of readdirSync(OUT_DIR)) {
    const mm = f.match(/^(.+)-(\d+)\.mp3$/);
    if (mm) manifest[`${mm[1]}-${mm[2]}`] = true;
  }
  const sorted = Object.fromEntries(Object.keys(manifest).sort().map((k) => [k, true]));
  writeFileSync(MANIFEST, JSON.stringify(sorted, null, 2) + '\n');

  console.log(`\nDone. generated=${made} skipped=${skipped} failed=${failed}`);
  console.log(`Clips: ${OUT_DIR}`);
  console.log(`Manifest: ${MANIFEST} (${Object.keys(sorted).length} clips)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

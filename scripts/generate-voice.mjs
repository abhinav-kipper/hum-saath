/* ============================================================
   Generate Dheeru's voice clips from src/data/voicelines.json.

   Each entry becomes /public/voice/<key>.mp3, plus a
   /public/voice/voice-manifest.json the app reads to know which
   clips exist (it falls back to device TTS for the rest).

   Uses Google Cloud Text-to-Speech (a warm hi-IN voice). Set:

     GOOGLE_TTS_API_KEY=...   node scripts/generate-voice.mjs

   Without a key it does a DRY RUN: it writes the manifest of the
   clips it *would* create and prints the lines, so you can wire
   the pipeline before paying for any audio. Swap VOICE/RATE below
   to taste, or point this at ElevenLabs if you prefer that voice.
   ============================================================ */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LINES_PATH = join(ROOT, 'src', 'data', 'voicelines.json');
const OUT_DIR = join(ROOT, 'public', 'voice');

const API_KEY = process.env.GOOGLE_TTS_API_KEY;
const VOICE = process.env.SAATHI_VOICE || 'hi-IN-Wavenet-B'; // a warm male hi-IN voice
const RATE = Number(process.env.SAATHI_RATE || '0.95'); // unhurried

async function synthesize(text) {
  const res = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: 'hi-IN', name: VOICE },
        audioConfig: { audioEncoding: 'MP3', speakingRate: RATE },
      }),
    },
  );
  if (!res.ok) throw new Error(`TTS ${res.status}: ${await res.text()}`);
  const { audioContent } = await res.json();
  return Buffer.from(audioContent, 'base64');
}

async function main() {
  const lines = JSON.parse(await readFile(LINES_PATH, 'utf8'));
  const keys = Object.keys(lines);
  await mkdir(OUT_DIR, { recursive: true });

  const manifest = {};
  const dryRun = !API_KEY;
  if (dryRun) {
    console.log('DRY RUN — no GOOGLE_TTS_API_KEY set. Listing clips:\n');
  }

  for (const key of keys) {
    const { hi } = lines[key];
    if (dryRun) {
      console.log(`  ${key}: ${hi}`);
      // In a dry run we do NOT claim the clip exists.
      continue;
    }
    process.stdout.write(`  ${key} … `);
    const mp3 = await synthesize(hi);
    await writeFile(join(OUT_DIR, `${key}.mp3`), mp3);
    manifest[key] = true;
    console.log('done');
  }

  await writeFile(join(OUT_DIR, 'voice-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(
    `\n${dryRun ? 'Wrote empty' : `Wrote ${keys.length} clips +`} manifest to public/voice/`,
  );
  if (dryRun) console.log('Set GOOGLE_TTS_API_KEY and re-run to generate the audio.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

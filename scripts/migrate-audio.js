/**
 * Migrate MP3 files from Firebase backup to Supabase Storage.
 * Usage: node scripts/migrate-audio.js
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';

const SUPABASE_URL = 'https://vnmjdzaszvatqeywbylw.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY env variable');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const BACKUP_DIR = join(process.env.HOME, 'firebase-backup/breathwithme-5376b.appspot.com');
const BUCKET = 'audio';

function findMp3Files(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...findMp3Files(fullPath));
    } else if (entry.toLowerCase().endsWith('.mp3')) {
      results.push(fullPath);
    }
  }
  return results;
}

const TRANSLIT = {
  'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh',
  'з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o',
  'п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts',
  'ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
  'А':'A','Б':'B','В':'V','Г':'G','Д':'D','Е':'E','Ё':'Yo','Ж':'Zh',
  'З':'Z','И':'I','Й':'Y','К':'K','Л':'L','М':'M','Н':'N','О':'O',
  'П':'P','Р':'R','С':'S','Т':'T','У':'U','Ф':'F','Х':'Kh','Ц':'Ts',
  'Ч':'Ch','Ш':'Sh','Щ':'Shch','Ъ':'','Ы':'Y','Ь':'','Э':'E','Ю':'Yu','Я':'Ya',
};

function sanitizeFileName(name) {
  let result = '';
  for (const ch of name.normalize('NFC')) {
    result += TRANSLIT[ch] ?? ch;
  }
  return result
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_.\-]/g, '');
}

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === BUCKET);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 209715200, // 200MB
    });
    if (error) throw new Error(`Failed to create bucket: ${error.message}`);
    console.log(`Created bucket "${BUCKET}" (public)`);
  } else {
    console.log(`Bucket "${BUCKET}" already exists`);
  }
}

async function main() {
  console.log('Finding MP3 files...');
  const files = findMp3Files(BACKUP_DIR);
  console.log(`Found ${files.length} MP3 files\n`);

  await ensureBucket();

  const mapping = [];
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const filePath of files) {
    const originalName = basename(filePath);
    const storagePath = sanitizeFileName(originalName);
    const fileBuffer = readFileSync(filePath);

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (error) {
      console.error(`  FAIL: ${originalName} → ${error.message}`);
      failed++;
      continue;
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    mapping.push({
      original: originalName,
      storagePath,
      publicUrl: urlData.publicUrl,
    });

    uploaded++;
    console.log(`  OK: ${originalName} → ${storagePath}`);
  }

  console.log(`\n--- Results ---`);
  console.log(`Uploaded: ${uploaded}`);
  console.log(`Skipped:  ${skipped}`);
  console.log(`Failed:   ${failed}`);
  console.log(`Total:    ${files.length}`);

  console.log(`\n--- Mapping ---`);
  for (const m of mapping) {
    console.log(`${m.original}`);
    console.log(`  → ${m.publicUrl}\n`);
  }
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

/**
 * upload_drr_collages_to_uploadthing.mjs
 * ----------------------------------------
 * Uploads all local DRR collage WebP images to UploadThing (permanent tier)
 * and rewrites src/district/data/drrCollages.ts with hardcoded CDN URLs.
 *
 * Usage (run from rac3011-web/ root on the server where .env is available):
 *   cd /home/ubuntu/rac3011-web-preprod
 *   source /home/ubuntu/rac3011-api/.env  # load UPLOADTHING_TOKEN_PERMANENT
 *   node scripts/upload_drr_collages_to_uploadthing.mjs
 *
 * Or locally:
 *   UPLOADTHING_TOKEN_PERMANENT=<token> node scripts/upload_drr_collages_to_uploadthing.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { UTApi, UTFile } from 'uploadthing/server';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COLLAGES_DIR = path.resolve(__dirname, '../public/assets/drr-collages');
const OUTPUT_TS = path.resolve(__dirname, '../src/district/data/drrCollages.ts');

const token = process.env.UPLOADTHING_TOKEN_PERMANENT;
if (!token) {
  console.error('ERROR: Missing UPLOADTHING_TOKEN_PERMANENT env var.');
  process.exit(1);
}

const utApi = new UTApi({ token });

// Full collage registry — filename lists per DRR
const REGISTRY = {
  'drr-32': [
    'drr-32_2015-16_01.webp','drr-32_2015-16_02.webp','drr-32_2015-16_03.webp',
    'drr-32_2015-16_04.webp','drr-32_2015-16_05.webp',
  ],
  'drr-33': [
    'drr-33_2016-17_01.webp','drr-33_2016-17_02.webp',
    'drr-33_2016-17_03.webp','drr-33_2016-17_04.webp',
  ],
  'drr-34': [
    'drr-34_2017-18_01.webp','drr-34_2017-18_02.webp','drr-34_2017-18_03.webp',
    'drr-34_2017-18_04.webp','drr-34_2017-18_05.webp','drr-34_2017-18_06.webp',
    'drr-34_2017-18_07.webp',
  ],
  'drr-35': [
    'drr-35_2018-19_01.webp','drr-35_2018-19_02.webp','drr-35_2018-19_03.webp',
  ],
  'drr-36': [
    'drr-36_2019-20_01.webp','drr-36_2019-20_02.webp','drr-36_2019-20_03.webp',
    'drr-36_2019-20_04.webp','drr-36_2019-20_05.webp',
  ],
  'drr-37': [
    'drr-37_2020-21-yaamini_01.webp','drr-37_2020-21-yaamini_02.webp',
    'drr-37_2020-21-yaamini_03.webp',
  ],
  'drr-38': [
    'drr-38_2020-21-sarthak_01.webp','drr-38_2020-21-sarthak_02.webp',
    'drr-38_2020-21-sarthak_03.webp','drr-38_2020-21-sarthak_04.webp',
    'drr-38_2020-21-sarthak_05.webp',
  ],
  'drr-39': [
    'drr-39_2021-22_01.webp','drr-39_2021-22_02.webp','drr-39_2021-22_03.webp',
  ],
  // 2022-23 Co-DRRs share the same set of photos
  'drr-40': [
    'drr-40_2022-23_01.webp','drr-40_2022-23_02.webp','drr-40_2022-23_03.webp',
  ],
  'drr-41': [
    'drr-40_2022-23_01.webp','drr-40_2022-23_02.webp','drr-40_2022-23_03.webp',
  ],
  'drr-42': [
    'drr-42_2023-24_01.webp','drr-42_2023-24_02.webp',
    'drr-42_2023-24_03.webp','drr-42_2023-24_04.webp',
  ],
  'drr-43': [
    'drr-43_2024-25_01.webp','drr-43_2024-25_02.webp','drr-43_2024-25_03.webp',
    'drr-43_2024-25_04.webp','drr-43_2024-25_05.webp','drr-43_2024-25_06.webp',
    'drr-43_2024-25_07.webp','drr-43_2024-25_08.webp',
  ],
  'drr-44': [
    'drr-44_2025-26_01.webp','drr-44_2025-26_02.webp','drr-44_2025-26_03.webp',
    'drr-44_2025-26_04.webp','drr-44_2025-26_05.webp','drr-44_2025-26_06.webp',
    'drr-44_2025-26_07.webp','drr-44_2025-26_08.webp','drr-44_2025-26_09.webp',
    'drr-44_2025-26_10.webp','drr-44_2025-26_11.webp','drr-44_2025-26_12.webp',
    'drr-44_2025-26_13.webp','drr-44_2025-26_14.webp','drr-44_2025-26_15.webp',
    'drr-44_2025-26_16.webp',
  ],
};

// Deduplicate filenames before uploading
const uniqueFilenames = [...new Set(Object.values(REGISTRY).flat())];
console.log(`\nFound ${uniqueFilenames.length} unique files to upload.\n`);

// Upload each file
const cdnMap = new Map();
let done = 0;

for (const filename of uniqueFilenames) {
  const filePath = path.join(COLLAGES_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`SKIP (not found): ${filename}`);
    continue;
  }
  const buffer = fs.readFileSync(filePath);
  const utFile = new UTFile([new Uint8Array(buffer)], filename, { type: 'image/webp' });

  try {
    const res = await utApi.uploadFiles(utFile);
    if (res.error) {
      console.error(`FAIL [${filename}]: ${res.error.message}`);
      continue;
    }
    const cdnUrl = res.data.ufsUrl || res.data.url;
    cdnMap.set(filename, cdnUrl);
    done++;
    console.log(`[${done}/${uniqueFilenames.length}] ${filename}\n  -> ${cdnUrl}`);
  } catch (err) {
    console.error(`ERR [${filename}]: ${err.message}`);
  }
}

console.log(`\nUpload complete: ${done}/${uniqueFilenames.length} files\n`);

if (done === 0) {
  console.error('No files uploaded. Aborting drrCollages.ts update.');
  process.exit(1);
}

// Build updated TypeScript registry
const registryLines = Object.entries(REGISTRY)
  .map(([drrId, filenames]) => {
    const urls = filenames
      .map((fn) => {
        const url = cdnMap.get(fn) || `/assets/drr-collages/${fn}`;
        return `    '${url}',`;
      })
      .join('\n');
    return `  '${drrId}': [\n${urls}\n  ],`;
  })
  .join('\n');

const newTs = `/**
 * DRR Tenure Gallery Collage Configuration - UploadThing CDN
 * ===========================================================
 * Images are stored on UploadThing CDN (permanent tier).
 * Auto-generated by scripts/upload_drr_collages_to_uploadthing.mjs
 * Last uploaded: ${new Date().toISOString()}
 *
 * To add new collages: add the webp files and run the upload script again.
 * Do NOT re-add local /assets/drr-collages references - use CDN URLs only.
 */

export interface DRRCollageEntry {
  drrId: string;
  tenure: string;
  year: string;
  drrName: string;
  images: string[];
}

/**
 * Mapping of DRR ID to collage images (UploadThing CDN URLs).
 * Specifically distinguishes co-DRR tenures:
 *  - 2020-21: Sarthak Bansal (drr-38) vs Yaamini Thareja (drr-37)
 *  - 2022-23: Rahul Sanjeev Sharma (drr-40) & Ankit Arvind Singh (drr-41)
 */
export const DRR_COLLAGE_REGISTRY: Record<string, string[]> = {
${registryLines}
};

/**
 * Retrieves the collage image URLs for a given DRR.
 */
export function getDrrCollages(drrId?: string | null): string[] {
  if (!drrId) return [];
  return DRR_COLLAGE_REGISTRY[drrId] ?? [];
}

/**
 * @deprecated All images are now on CDN - returns the URL as-is.
 * Kept for backward compatibility.
 */
export function resolveCollageUrl(url: string): string {
  return url;
}
`;

fs.writeFileSync(OUTPUT_TS, newTs, 'utf-8');
console.log(`Written: ${OUTPUT_TS}`);
console.log('\nNext steps:');
console.log('  git rm -r public/assets/drr-collages/');
console.log('  git add src/district/data/drrCollages.ts');
console.log('  git commit -m "feat: migrate DRR collages to UploadThing CDN"');
console.log('  git push origin preprod\n');

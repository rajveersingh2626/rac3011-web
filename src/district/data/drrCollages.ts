/**
 * DRR Tenure Gallery Collage Configuration & Storage Resolver
 * ==========================================================
 * Manages collage image sets for past DRR tenures.
 * Supports configurable cloud storage endpoints (S3, Cloudflare R2, Supabase Storage, CDN)
 * via `import.meta.env.VITE_DRR_GALLERY_STORAGE_URL`.
 */

export interface DRRCollageEntry {
  drrId: string;
  tenure: string;
  year: string;
  drrName: string;
  images: string[];
}

/**
 * Base storage bucket URL. If set in environment, assets are fetched from cloud storage.
 * Defaults to `/assets/drr-collages` for zero-friction local/fallback serving.
 */
const CLOUD_STORAGE_BASE_URL = (
  import.meta.env.VITE_DRR_GALLERY_STORAGE_URL ||
  import.meta.env.VITE_STORAGE_PUBLIC_URL ||
  ''
).replace(/\/+$/, '');

/**
 * Resolves an asset path to either the cloud storage URL or the public asset path.
 */
export function resolveCollageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (CLOUD_STORAGE_BASE_URL) {
    // If the path starts with /assets/drr-collages, trim to filename
    const filename = cleanPath.split('/').pop() || '';
    return `${CLOUD_STORAGE_BASE_URL}/${filename}`;
  }
  return cleanPath;
}

/**
 * Mapping of DRR ID to collage images.
 * Specifically distinguishes co-DRR tenures:
 *  - 2020-21: Sarthak Bansal (drr-38) vs Yaamini Thareja (drr-37)
 *  - 2022-23: Rahul Sanjeev Sharma (drr-40) & Ankit Arvind Singh (drr-41)
 */
export const DRR_COLLAGE_REGISTRY: Record<string, string[]> = {
  'drr-32': [
    '/assets/drr-collages/drr-32_2015-16_01.webp',
    '/assets/drr-collages/drr-32_2015-16_02.webp',
    '/assets/drr-collages/drr-32_2015-16_03.webp',
    '/assets/drr-collages/drr-32_2015-16_04.webp',
    '/assets/drr-collages/drr-32_2015-16_05.webp',
  ],
  'drr-33': [
    '/assets/drr-collages/drr-33_2016-17_01.webp',
    '/assets/drr-collages/drr-33_2016-17_02.webp',
    '/assets/drr-collages/drr-33_2016-17_03.webp',
    '/assets/drr-collages/drr-33_2016-17_04.webp',
  ],
  'drr-34': [
    '/assets/drr-collages/drr-34_2017-18_01.webp',
    '/assets/drr-collages/drr-34_2017-18_02.webp',
    '/assets/drr-collages/drr-34_2017-18_03.webp',
    '/assets/drr-collages/drr-34_2017-18_04.webp',
    '/assets/drr-collages/drr-34_2017-18_05.webp',
    '/assets/drr-collages/drr-34_2017-18_06.webp',
    '/assets/drr-collages/drr-34_2017-18_07.webp',
  ],
  'drr-35': [
    '/assets/drr-collages/drr-35_2018-19_01.webp',
    '/assets/drr-collages/drr-35_2018-19_02.webp',
    '/assets/drr-collages/drr-35_2018-19_03.webp',
  ],
  'drr-36': [
    '/assets/drr-collages/drr-36_2019-20_01.webp',
    '/assets/drr-collages/drr-36_2019-20_02.webp',
    '/assets/drr-collages/drr-36_2019-20_03.webp',
    '/assets/drr-collages/drr-36_2019-20_04.webp',
    '/assets/drr-collages/drr-36_2019-20_05.webp',
  ],
  // 2020-21 Co-DRRs
  'drr-37': [
    '/assets/drr-collages/drr-37_2020-21-yaamini_01.webp',
    '/assets/drr-collages/drr-37_2020-21-yaamini_02.webp',
    '/assets/drr-collages/drr-37_2020-21-yaamini_03.webp',
  ],
  'drr-38': [
    '/assets/drr-collages/drr-38_2020-21-sarthak_01.webp',
    '/assets/drr-collages/drr-38_2020-21-sarthak_02.webp',
    '/assets/drr-collages/drr-38_2020-21-sarthak_03.webp',
    '/assets/drr-collages/drr-38_2020-21-sarthak_04.webp',
    '/assets/drr-collages/drr-38_2020-21-sarthak_05.webp',
  ],
  'drr-39': [
    '/assets/drr-collages/drr-39_2021-22_01.webp',
    '/assets/drr-collages/drr-39_2021-22_02.webp',
    '/assets/drr-collages/drr-39_2021-22_03.webp',
  ],
  // 2022-23 Co-DRRs
  'drr-40': [
    '/assets/drr-collages/drr-40_2022-23_01.webp',
    '/assets/drr-collages/drr-40_2022-23_02.webp',
    '/assets/drr-collages/drr-40_2022-23_03.webp',
  ],
  'drr-41': [
    '/assets/drr-collages/drr-40_2022-23_01.webp',
    '/assets/drr-collages/drr-40_2022-23_02.webp',
    '/assets/drr-collages/drr-40_2022-23_03.webp',
  ],
  'drr-42': [
    '/assets/drr-collages/drr-42_2023-24_01.webp',
    '/assets/drr-collages/drr-42_2023-24_02.webp',
    '/assets/drr-collages/drr-42_2023-24_03.webp',
    '/assets/drr-collages/drr-42_2023-24_04.webp',
  ],
  'drr-43': [
    '/assets/drr-collages/drr-43_2024-25_01.webp',
    '/assets/drr-collages/drr-43_2024-25_02.webp',
    '/assets/drr-collages/drr-43_2024-25_03.webp',
    '/assets/drr-collages/drr-43_2024-25_04.webp',
    '/assets/drr-collages/drr-43_2024-25_05.webp',
    '/assets/drr-collages/drr-43_2024-25_06.webp',
    '/assets/drr-collages/drr-43_2024-25_07.webp',
    '/assets/drr-collages/drr-43_2024-25_08.webp',
  ],
  'drr-44': [
    '/assets/drr-collages/drr-44_2025-26_01.webp',
    '/assets/drr-collages/drr-44_2025-26_02.webp',
    '/assets/drr-collages/drr-44_2025-26_03.webp',
    '/assets/drr-collages/drr-44_2025-26_04.webp',
    '/assets/drr-collages/drr-44_2025-26_05.webp',
    '/assets/drr-collages/drr-44_2025-26_06.webp',
    '/assets/drr-collages/drr-44_2025-26_07.webp',
    '/assets/drr-collages/drr-44_2025-26_08.webp',
    '/assets/drr-collages/drr-44_2025-26_09.webp',
    '/assets/drr-collages/drr-44_2025-26_10.webp',
    '/assets/drr-collages/drr-44_2025-26_11.webp',
    '/assets/drr-collages/drr-44_2025-26_12.webp',
    '/assets/drr-collages/drr-44_2025-26_13.webp',
    '/assets/drr-collages/drr-44_2025-26_14.webp',
    '/assets/drr-collages/drr-44_2025-26_15.webp',
    '/assets/drr-collages/drr-44_2025-26_16.webp',
  ],
};

/**
 * Retrieves the collage image URLs for a given DRR.
 */
export function getDrrCollages(drrId?: string | null): string[] {
  if (!drrId) return [];
  const rawList = DRR_COLLAGE_REGISTRY[drrId] || [];
  return rawList.map(resolveCollageUrl);
}

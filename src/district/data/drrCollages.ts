/**
 * DRR Tenure Gallery Collage Configuration — UploadThing CDN
 * ===========================================================
 * All 66 collage images are stored on UploadThing CDN (permanent tier).
 * Migrated from local /public/assets/drr-collages/ on 2026-10-01.
 *
 * CDN base: https://hi0o78q25u.ufs.sh
 * To add new collages: upload the WebP to UploadThing and add the ufsUrl here.
 * Do NOT re-add local /assets/drr-collages references.
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
  'drr-32': [
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjesIeCcKGvgShCLPq13texX7yWswmHMdofT5u',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKj13xXtwJcFkwKpayrXBnD986fxUSeGjQiILJC',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjZgNVh5pOpfDqMyP40wxQuR8ch1SUXEYl3H5L',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjFLD9oN3MpcTLtx54msCrzOeDRK637NEjJqWl',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjmwkLhNElB20WKnAat3JZQ6GEijSLy9f8oeTm',
  ],
  'drr-33': [
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjdJE2HcoFveKjR6kZoArOPg2UGfD1Bp8WQixb',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKj2KeWWokL3tUevnuqDrFoWy0ifIAdzSBxG25K',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjxFFEaYF2TvMQOpHuWA8k6ze9XR4Udf1oC2cY',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjUJFAhEyLFzC68ZBK1PAwl2TuEph4Q7amdiGk',
  ],
  'drr-34': [
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKj34Vbot5jkV7RdrsvlSzqmfDiC1I84wB0tZaT',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjvOm3H6usF9yHuTLWJNSaqB3VUtsOmPA5XMhl',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKj5dHOCRJUpJicHIv6hlfn8yoDK7OQbku0Bw1C',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjAeWk9zfmxkQYTzGqntHCN869gEX2cJSoMjR0',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjSJdRoVOypwIm0fztjQ1lL3K9ArBTMxRvE7gW',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKj3fgow05jkV7RdrsvlSzqmfDiC1I84wB0tZaT',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjI0phgcktCtq9XsYOTBGkJoD5jR3bdUESvaez',
  ],
  'drr-35': [
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjz6tLzfDSIFvrmqozeCPWL0K2N6j3GMpyAktR',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjkvrVBNFbY4othCwHMz9xXaW67TRUrPpvnSN8',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjoJtLIGcJbWX0QSYHRdFtK9ilVOPAux2wZErh',
  ],
  'drr-36': [
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjduGncboFveKjR6kZoArOPg2UGfD1Bp8WQixb',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjFA9ozJ3MpcTLtx54msCrzOeDRK637NEjJqWl',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjMS5yNUZv9iylhT2dO0ZPcXUgFGCj7WQL3s1z',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjSaJ1taOypwIm0fztjQ1lL3K9ArBTMxRvE7gW',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjcSdtu6HAeZinKxoltIqOM2pwQYk6DFGVrh0y',
  ],
  // 2020-21 Co-DRRs
  'drr-37': [
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjz0JKEBDSIFvrmqozeCPWL0K2N6j3GMpyAktR',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjo7IOsWcJbWX0QSYHRdFtK9ilVOPAux2wZErh',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKj20XhOjkL3tUevnuqDrFoWy0ifIAdzSBxG25K',
  ],
  'drr-38': [
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjQTv9M704A5v9jFcBzby8RaM3ND1UTVZmdqJS',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjDu2DuRMoQjvZJK4IdAUNq3bX2yh7HCf0ix8e',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjxhiRPM2TvMQOpHuWA8k6ze9XR4Udf1oC2cYa',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKj3yUVLYm5jkV7RdrsvlSzqmfDiC1I84wB0tZa',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjYrawD8VfK8xUW1OAjHbZvhsiqRnVXJC2LpMr',
  ],
  'drr-39': [
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjycYOsjdoPRjeZJcKIE4pMsCb8L1adTX9i0F5',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKj2yB9S1kL3tUevnuqDrFoWy0ifIAdzSBxG25K',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKj1gv1q2JcFkwKpayrXBnD986fxUSeGjQiILJC',
  ],
  // 2022-23 Co-DRRs (share same photos)
  'drr-40': [
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjeijZk3KGvgShCLPq13texX7yWswmHMdofT5u',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjzvRYBulDSIFvrmqozeCPWL0K2N6j3GMpyAkt',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKj2IruvgkL3tUevnuqDrFoWy0ifIAdzSBxG25K',
  ],
  'drr-41': [
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjeijZk3KGvgShCLPq13texX7yWswmHMdofT5u',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjzvRYBulDSIFvrmqozeCPWL0K2N6j3GMpyAkt',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKj2IruvgkL3tUevnuqDrFoWy0ifIAdzSBxG25K',
  ],
  'drr-42': [
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjIPnnT8tCtq9XsYOTBGkJoD5jR3bdUESvaezM',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjwsvV61ZmiY81RVUZDa7FLBsOQbTk64yGonKN',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjogPEfbcJbWX0QSYHRdFtK9ilVOPAux2wZErh',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKj2KZ3DMkL3tUevnuqDrFoWy0ifIAdzSBxG25K',
  ],
  'drr-43': [
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKj5mdEYoUpJicHIv6hlfn8yoDK7OQbku0Bw1CP',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjXTjLzgw2PpcIowW9lQvbHuyDFAiECsZrx3jR',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjglidrJ6FjVZ7wCkJunUQcKsNzA9brEo5lpL6',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjk55ANBrFbY4othCwHMz9xXaW67TRUrPpvnSN',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjDY4eGKMoQjvZJK4IdAUNq3bX2yh7HCf0ix8e',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjxlIGR02TvMQOpHuWA8k6ze9XR4Udf1oC2cYa',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjBTJpCimDt6cl93I5QRWpF12zCGdofeqKmYgL',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjd9YOtLoFveKjR6kZoArOPg2UGfD1Bp8WQixb',
  ],
  'drr-44': [
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjTvk5JezkvGJEUMsOASano9wRpdQmLyxYBcVC',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjHsNE1bPIPGvaTjK38pf1mnU29zrdiBCNk04E',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjKlrQfvG8tFdTEaJ6XBkNWyRZSDwox3VG9hYP',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjFUy8Okv3MpcTLtx54msCrzOeDRK637NEjJqW',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKj8nM1m1hvQLNBJjEGFIAwyX5pdR9brxzaCsPV',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjk58d9zrFbY4othCwHMz9xXaW67TRUrPpvnSN',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjUockhSAyLFzC68ZBK1PAwl2TuEph4Q7amdiG',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjmpdQSfElB20WKnAat3JZQ6GEijSLy9f8oeTm',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjPflfslLeZzQ9L0Xd3i8WNmCPBROUGx5bTVEa',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjyZyLk0doPRjeZJcKIE4pMsCb8L1adTX9i0F5',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjrtZoOjiNPHSY7oVN6QZnetwfqDFRbjuMgEBv',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjs1K8iwSFboN2BQJynKC6W3THUjglMOrh5Vcv',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKj28I0W4kL3tUevnuqDrFoWy0ifIAdzSBxG25K',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjUot5k9wyLFzC68ZBK1PAwl2TuEph4Q7amdiG',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKj23hHpqSkL3tUevnuqDrFoWy0ifIAdzSBxG25',
    'https://hi0o78q25u.ufs.sh/f/dhfzaaoFveKjU0uiRjyLFzC68ZBK1PAwl2TuEph4Q7amdiGk',
  ],
};

/**
 * Retrieves the collage image URLs for a given DRR.
 */
export function getDrrCollages(drrId?: string | null): string[] {
  if (!drrId) return [];
  return DRR_COLLAGE_REGISTRY[drrId] ?? [];
}

/**
 * @deprecated All images are now on UploadThing CDN — returns the URL as-is.
 * Kept for backward compatibility only.
 */
export function resolveCollageUrl(url: string): string {
  return url;
}

// Centralized image imports for Past District Rotaract Representatives
import ankitArvind from './pdrr_images/ankit arvind.webp';
import anmolChawla from './pdrr_images/anmol chawla.webp';
import architBhatia from './pdrr_images/archit bhatia.webp';
import arpitMehra from './pdrr_images/arpit mehra.webp';
import ashimaAgarwal from './pdrr_images/ashima agarwal.webp';
import geetika from './pdrr_images/geetika.webp';
import harshSirohi from './pdrr_images/harsh sirohi.webp';
import kritiMalhotra from './pdrr_images/kriti malhotra.webp';
import manujMittal from './pdrr_images/manuj mittal.webp';
import niranjanDev from './pdrr_images/niranjan dev.webp';
import rahulSanjeev from './pdrr_images/rahul sanjeev.webp';
import rishikaKhanna from './pdrr_images/rishika khanna.webp';
import sarthakBansal from './pdrr_images/sarthak bansal.webp';
import yaaminiThareja from './pdrr_images/yaamini thareja.webp';

export const PDRR_PHOTOS = {
  'archit-bhatia': architBhatia,
  'rishika-khanna': rishikaKhanna,
  'geetika': geetika,
  'kriti-malhotra': kritiMalhotra,
  'ankit-arvind': ankitArvind,
  'rahul-sanjeev': rahulSanjeev,
  'niranjan-dev': niranjanDev,
  'sarthak-bansal': sarthakBansal,
  'yaamini-thareja': yaaminiThareja,
  'arpit-mehra': arpitMehra,
  'ashima-agarwal': ashimaAgarwal,
  'anmol-chawla': anmolChawla,
  'manuj-mittal': manujMittal,
  'harsh-sirohi': harshSirohi
} satisfies Record<string, string>;

export type PdrrPhotoKey = keyof typeof PDRR_PHOTOS;

export function findPdrrPhoto(name: string, slug?: string): string | null {
  const clean = (s: string) =>
    s.replace(/^(Rtn\.|Rtr\.|PDRR\s*|DRR\s*)+/gi, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanName = clean(name);
  const cleanSlug = slug ? clean(slug) : '';

  for (const [key, photo] of Object.entries(PDRR_PHOTOS)) {
    const cleanKey = clean(key);
    if (
      cleanKey === cleanName ||
      cleanKey === cleanSlug ||
      cleanName.includes(cleanKey) ||
      cleanKey.includes(cleanName) ||
      (cleanSlug && (cleanSlug.includes(cleanKey) || cleanKey.includes(cleanSlug)))
    ) {
      return photo;
    }
  }
  return null;
}

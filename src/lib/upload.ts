import { API_ORIGIN, ApiError, apiFetch } from '@/lib/api';

export type StorageTier = 'permanent' | 'dynamic' | 'private';

export interface StoredFile {
  id: string;
  tier: StorageTier;
  key: string;
  url: string | null;
  name: string;
  mimeType: string;
  size: number;
}

export interface UploadGrant {
  grantId: string;
  uploadUrl: string;
  fields?: Record<string, string>;
  key?: string;
}

const MB = 1024 * 1024;

export const TIER_MAX_BYTES: Record<StorageTier, number> = {
  permanent: 5 * MB,
  dynamic: 10 * MB,
  private: 25 * MB,
};

const BASE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf'] as const;

const OPENXML_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
] as const;

export const TIER_MIME_TYPES: Record<StorageTier, readonly string[]> = {
  permanent: BASE_MIME_TYPES,
  dynamic: BASE_MIME_TYPES,
  private: [...BASE_MIME_TYPES, ...OPENXML_MIME_TYPES],
};

const MIME_LABELS: Record<string, string> = {
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
  'image/avif': 'AVIF',
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
};

function formatMb(bytes: number): string {
  const mb = bytes / MB;
  return `${Number.isInteger(mb) ? mb.toFixed(0) : mb.toFixed(1)} MB`;
}

function describeAllowed(tier: StorageTier): string {
  return TIER_MIME_TYPES[tier].map((m) => MIME_LABELS[m] ?? m).join(', ');
}

/** UX affordance only: the server re-validates every grant and is the authority (spec §4.8 rule 6). */
export function validateFile(file: { type: string; size: number }, tier: StorageTier): string | null {
  if (!TIER_MIME_TYPES[tier].includes(file.type)) {
    return `This file type is not accepted here. Convert it to one of ${describeAllowed(tier)} and try again.`;
  }
  if (file.size > TIER_MAX_BYTES[tier]) {
    return `This file is ${formatMb(file.size)}. Compress or resize it to under ${formatMb(TIER_MAX_BYTES[tier])} and try again.`;
  }
  if (file.size === 0) return 'This file is empty. Pick a file with content and try again.';
  return null;
}

function keyFromUrl(uploadUrl: string): string {
  try {
    return new URL(uploadUrl, API_ORIGIN || 'http://localhost').pathname.replace(/^\/+/, '');
  } catch {
    return uploadUrl;
  }
}

interface ProviderLegInput {
  grant: UploadGrant;
  file: File;
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
}

function sendToProvider({ grant, file, onProgress, signal }: ProviderLegInput): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Upload cancelled', 'AbortError'));
      return;
    }
    const xhr = new XMLHttpRequest();
    const usesFormData = Boolean(grant.fields);
    xhr.open(usesFormData ? 'POST' : 'PUT', grant.uploadUrl, true);
    // third-party host: never attach our session cookies
    xhr.withCredentials = false;

    const onAbort = (): void => xhr.abort();
    signal?.addEventListener('abort', onAbort);
    const done = (): void => signal?.removeEventListener('abort', onAbort);

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (event: ProgressEvent): void => {
        if (event.lengthComputable && event.total > 0) onProgress(Math.min(1, event.loaded / event.total));
      };
    }
    xhr.onload = (): void => {
      done();
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(1);
        resolve();
      } else {
        reject(new ApiError(xhr.status, `Upload to storage failed (${xhr.status}). Check your connection and retry.`));
      }
    };
    xhr.onerror = (): void => {
      done();
      reject(new ApiError(0, 'Upload to storage failed. Check your connection and retry.'));
    };
    xhr.onabort = (): void => {
      done();
      reject(new DOMException('Upload cancelled', 'AbortError'));
    };

    if (usesFormData) {
      const form = new FormData();
      for (const [name, value] of Object.entries(grant.fields ?? {})) form.append(name, value);
      form.append('file', file, file.name);
      xhr.send(form);
    } else {
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    }
  });
}

export interface UploadFileInput {
  file: File;
  tier: StorageTier;
  resourceType: string;
  resourceId?: string;
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
}

export async function compressImageToWebP(file: File, maxDimension = 1600, quality = 0.82): Promise<File> {
  // Only process standard raster images (skip SVG, animated GIF, PDFs, etc.)
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;

    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/webp', quality);
    });

    if (!blob) return file;

    const newName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
    return new File([blob], newName, { type: 'image/webp', lastModified: Date.now() });
  } catch {
    return file;
  }
}

export async function uploadFile(input: UploadFileInput): Promise<StoredFile> {
  const file = await compressImageToWebP(input.file);
  const { tier, resourceType, resourceId, onProgress, signal } = input;
  const problem = validateFile(file, tier);
  if (problem) throw new ApiError(400, problem);

  const grant = await apiFetch<UploadGrant>('/files/grants', {
    method: 'POST',
    body: { tier, mimeType: file.type, size: file.size, resourceType, resourceId },
    signal,
  });

  onProgress?.(0);
  await sendToProvider({ grant, file, onProgress, signal });

  const providerKey = grant.key ?? grant.fields?.key ?? keyFromUrl(grant.uploadUrl);
  return apiFetch<StoredFile>(`/files/grants/${encodeURIComponent(grant.grantId)}`, {
    method: 'PATCH',
    body: { providerKey },
    signal,
  });
}

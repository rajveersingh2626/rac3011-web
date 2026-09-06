import { ApiError } from '@/lib/api';
import type { ScopeType } from './types';

export const SCOPE_LABEL: Record<ScopeType, string> = {
  none: 'District-wide',
  club: 'Club',
  zone: 'Zone',
  project: 'Project',
};

export function errorMessageOf(error: unknown): string | null {
  if (!error) return null;
  return error instanceof ApiError ? error.message : 'Something went wrong. Try again.';
}

import { apiFetch } from '@/lib/api';
import { auditRowSchema, paginatedSchema } from './types';

const auditPage = paginatedSchema(auditRowSchema);

function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : '';
}

export interface AuditLogParams {
  resourceType?: string;
  resourceId?: string;
  actorId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchAuditLog(params: AuditLogParams = {}) {
  const qs = query({
    'filter[resourceType]': params.resourceType,
    'filter[resourceId]': params.resourceId,
    'filter[actorId]': params.actorId,
    'filter[from]': params.from,
    'filter[to]': params.to,
    page: params.page,
    pageSize: params.pageSize,
  });
  return apiFetch(`/audit${qs}`, { schema: auditPage });
}

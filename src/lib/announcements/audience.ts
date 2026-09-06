import type { Audience } from './types';

export function isAudienceEmpty(audience: Audience): boolean {
  return (
    !audience.roleKeys?.length && !audience.zoneIds?.length && !audience.clubIds?.length && !audience.memberIds?.length
  );
}

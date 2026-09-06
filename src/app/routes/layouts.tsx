import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { PortalShell } from '@/components/layout/PortalShell';
import { AdminShell } from '@/components/layout/AdminShell';
import { SurfaceLoading } from './SurfaceLoading';
import { DistrictPageShell } from '@/district/components/Layout/DistrictPageShell';

export function PublicLayout() {
  return (
    <DistrictPageShell>
      <Outlet />
    </DistrictPageShell>
  );
}

export function PortalLayout() {
  return (
    <PortalShell>
      <Suspense fallback={<SurfaceLoading />}>
        <Outlet />
      </Suspense>
    </PortalShell>
  );
}

export function AdminLayout() {
  return (
    <AdminShell>
      <Suspense fallback={<SurfaceLoading />}>
        <Outlet />
      </Suspense>
    </AdminShell>
  );
}

import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { PortalShell } from '@/components/layout/PortalShell';
import { AdminShell } from '@/components/layout/AdminShell';
import { SurfaceLoading } from './SurfaceLoading';
import { DistrictPageShell } from '@/district/components/Layout/DistrictPageShell';
import { DistrictBackdrop } from '@/components/layout/DistrictBackdrop';

export function PublicLayout() {
  return (
    <>
      <DistrictBackdrop />
      <div className="relative z-[1]">
        <DistrictPageShell>
          <Outlet />
        </DistrictPageShell>
      </div>
    </>
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

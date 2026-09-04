import { Outlet } from 'react-router';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { PortalShell } from '@/components/layout/PortalShell';
import { AdminShell } from '@/components/layout/AdminShell';
import { useHomeQuery } from '@/lib/publicApi/home';

export function PublicLayout() {
  const { data } = useHomeQuery();
  return (
    <>
      <PublicHeader />
      <Outlet />
      <PublicFooter visits={data?.visits.count} />
    </>
  );
}

export function PortalLayout() {
  return (
    <PortalShell>
      <Outlet />
    </PortalShell>
  );
}

export function AdminLayout() {
  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}

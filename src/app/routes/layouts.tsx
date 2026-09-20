import { Suspense, type ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router';
import { PortalShell } from '@/components/layout/PortalShell';
import { AdminShell } from '@/components/layout/AdminShell';
import { SurfaceLoading } from './SurfaceLoading';
import { DistrictPageShell } from '@/district/components/Layout/DistrictPageShell';
import { DistrictBackdrop } from '@/components/layout/DistrictBackdrop';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ErrorState } from '@/components/ui/ErrorState';
import { Container } from '@/components/ui/Container';

function PageErrorBoundary({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <ErrorBoundary
      key={location.pathname}
      fallback={
        <Container className="py-12">
          <ErrorState
            title="Unable to load page"
            body="We encountered a problem while rendering this section. Please try reloading or navigating to another page."
            retryLabel="Reload page"
            onRetry={() => window.location.reload()}
          />
        </Container>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export function PublicLayout() {
  return (
    <>
      <DistrictBackdrop />
      <div className="relative z-[1] pt-12 md:pt-0">
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
      <PageErrorBoundary>
        <Suspense fallback={<SurfaceLoading />}>
          <Outlet />
        </Suspense>
      </PageErrorBoundary>
    </PortalShell>
  );
}

export function AdminLayout() {
  return (
    <AdminShell>
      <PageErrorBoundary>
        <Suspense fallback={<SurfaceLoading />}>
          <Outlet />
        </Suspense>
      </PageErrorBoundary>
    </AdminShell>
  );
}


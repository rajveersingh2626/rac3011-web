import type { ReactNode } from 'react';
import { portalHref } from '@/app/host';
import Footer from '@/district/components/Layout/Footer';
import { DistrictBackdrop } from './DistrictBackdrop';
import { FloatingNav, type FloatingNavProps } from './FloatingNav';

export interface DistrictFrameProps {
  nav?: FloatingNavProps;
  hideFloatingNav?: boolean;
  fullBleed?: boolean;
  hideFooter?: boolean;
  children: ReactNode;
}

export function DistrictFrame({
  nav,
  hideFloatingNav,
  fullBleed,
  hideFooter,
  children,
}: DistrictFrameProps) {
  const onNavigatePage = (page: string) => {
    if (page === 'portal') window.location.href = portalHref('/portal/login');
    else if (nav?.homeHref) window.location.href = nav.homeHref;
  };
  return (
    <div className="relative flex min-h-screen flex-col">
      {!fullBleed && <DistrictBackdrop />}
      {!hideFloatingNav && nav && <FloatingNav {...nav} />}
      <main
        className={
          fullBleed
            ? 'relative z-[1] w-full flex-1'
            : 'relative z-[1] mx-auto w-full max-w-[1440px] flex-1 px-4 pt-[112px] pb-10 md:px-8 md:pt-[104px]'
        }
      >
        {children}
      </main>
      {!hideFooter && (
        <div className="relative z-[1]">
          <Footer onNavigatePage={onNavigatePage} />
        </div>
      )}
    </div>
  );
}

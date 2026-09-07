import type { ReactNode } from 'react';
import Footer from '@/district/components/Layout/Footer';
import { DistrictBackdrop } from './DistrictBackdrop';
import { FloatingNav, type FloatingNavProps } from './FloatingNav';

export interface DistrictFrameProps {
  nav: FloatingNavProps;
  children: ReactNode;
}

export function DistrictFrame({ nav, children }: DistrictFrameProps) {
  const onNavigatePage = (page: string) => {
    if (page === 'portal') window.location.href = '/portal/login';
    else window.location.href = nav.homeHref;
  };
  return (
    <div className="relative flex min-h-screen flex-col">
      <DistrictBackdrop />
      <FloatingNav {...nav} />
      <main className="relative z-[1] mx-auto w-full max-w-[1440px] flex-1 px-4 pt-[88px] pb-10 md:px-8">{children}</main>
      <div className="relative z-[1]">
        <Footer onNavigatePage={onNavigatePage} />
      </div>
    </div>
  );
}

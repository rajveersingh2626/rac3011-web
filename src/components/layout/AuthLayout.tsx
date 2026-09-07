import { Outlet } from 'react-router';
import { DistrictFrame } from './DistrictFrame';

export function AuthLayout() {
  return (
    <DistrictFrame nav={{ links: [], homeHref: '/', title: 'District Portal' }}>
      <div className="flex min-h-[calc(100vh-88px-260px)] items-center justify-center py-6">
        <div
          data-testid="auth-card"
          className="relative w-full max-w-[460px] overflow-hidden rounded-[16px] border border-line-accent bg-white/85 p-8 shadow-lift backdrop-blur-md"
        >
          <div data-testid="auth-accent" className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#D81B60] via-[#123499] to-[#880E4F]" />
          <img src="/district-logo.png" alt="Rotaract District Organization 3011" className="mx-auto mb-6 h-8 w-auto" />
          <Outlet />
        </div>
      </div>
    </DistrictFrame>
  );
}

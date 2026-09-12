import { useMemo, useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router';
import { Globe, ExternalLink, ArrowRight, Menu as MenuIcon, X as XIcon } from 'lucide-react';
import { useAuth } from '@/app/auth';
import { useTheme } from '@/app/theme';
import { Avatar } from '@/components/ui/Avatar';
import { Menu, type MenuItem } from '@/components/ui/Menu';
import { Drawer } from '@/components/ui/Drawer';
import { cn } from '@/lib/cn';
import { PORTAL_NAV_GROUPS, type NavGroup } from './portalNav';

function visibleGroups(groups: NavGroup[], can: (perm: string) => boolean): NavGroup[] {
  return groups
    .filter((g) => !g.perm || can(g.perm))
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.perm || can(i.perm)) }))
    .filter((g) => g.items.length > 0);
}

function NavLinkItem({ to, label, onClick, external }: { to: string; label: string; onClick?: () => void; external?: boolean }) {
  const [isHovered, setIsHovered] = useState(false);

  if (external) {
    return (
      <a
        href={to}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group flex min-h-10 items-center justify-between rounded-[8px] px-3.5 text-[13px] font-semibold text-[#4A4A5A] transition-all hover:bg-[#FDF0F5]/70 hover:text-[#D81B60]"
      >
        <div className="flex items-center gap-1.5 overflow-hidden">
          <div
            className="flex items-center text-[#D81B60] transition-all duration-200"
            style={{
              width: isHovered ? '16px' : '0px',
              opacity: isHovered ? 1 : 0,
            }}
          >
            <ArrowRight size={13} />
          </div>
          <span
            className="transition-transform duration-200"
            style={{ transform: isHovered ? 'translateX(3px)' : 'translateX(0)' }}
          >
            {label}
          </span>
        </div>
        <ExternalLink size={12} className="opacity-50 group-hover:opacity-100 group-hover:text-[#D81B60]" />
      </a>
    );
  }

  return (
    <NavLink
      to={to}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={({ isActive }) =>
        cn(
          'group flex min-h-10 items-center rounded-[8px] px-3.5 text-[13px] font-semibold transition-all',
          isActive
            ? 'bg-[#FDF0F5] text-[#D81B60] border-l-4 border-l-[#D81B60] border-y border-r border-[#F3E5EB] font-bold shadow-xs'
            : 'text-[#4A4A5A] hover:bg-[#FDF0F5]/70 hover:text-[#D81B60]',
        )
      }
    >
      {({ isActive }) => (
        <div className="flex items-center gap-1.5 overflow-hidden w-full">
          <div
            className="flex items-center text-[#D81B60] transition-all duration-200"
            style={{
              width: (isHovered || isActive) ? '16px' : '0px',
              opacity: (isHovered || isActive) ? 1 : 0,
            }}
          >
            <ArrowRight size={13} />
          </div>
          <span
            className="transition-transform duration-200"
            style={{ transform: (isHovered || isActive) ? 'translateX(3px)' : 'translateX(0)' }}
          >
            {label}
          </span>
        </div>
      )}
    </NavLink>
  );
}

function GroupList({ groups, adminOpenDefault, onNavigate }: { groups: NavGroup[]; adminOpenDefault: boolean; onNavigate?: () => void }) {
  return (
    <nav aria-label="Portal" className="flex flex-col gap-5">
      {groups.map((group) =>
        group.key === 'admin' ? (
          <details key={group.key} open={adminOpenDefault} className="group">
            <summary className="mb-2 cursor-pointer list-none text-[11px] font-extrabold tracking-[1.2px] text-[#123499]">
              {group.label.toUpperCase()}
            </summary>
            <div className="flex flex-col gap-1">
              {group.items.map((item) => (
                <NavLinkItem key={item.key} to={item.to} label={item.label} onClick={onNavigate} external={item.external} />
              ))}
            </div>
          </details>
        ) : (
          <div key={group.key}>
            <p className="mb-2 text-[11px] font-extrabold tracking-[1.2px] text-[#123499]">{group.label.toUpperCase()}</p>
            <div className="flex flex-col gap-1">
              {group.items.map((item) => (
                <NavLinkItem key={item.key} to={item.to} label={item.label} onClick={onNavigate} external={item.external} />
              ))}
            </div>
          </div>
        ),
      )}
    </nav>
  );
}

function ScopeSwitcher() {
  const { me } = useAuth();
  if (!me || me.clubs.length === 0) return null;
  const isSuperAdmin = me.roles.some((r) => r.roleKey === 'super_admin');
  const isDistrict = me.profile?.clubId === 'DISTRICT' || isSuperAdmin;

  if (isSuperAdmin) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11.5px] font-bold text-white shadow-xs">
        <span className="size-2 rounded-full bg-[#D81B60] shadow-[0_0_8px_#D81B60]" />
        District 3011 · Super Admin
      </span>
    );
  }

  if (isDistrict) {
    const roleKey = me.roles[0]?.roleKey ?? 'council';
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11.5px] font-bold text-white shadow-xs">
        <span className="size-2 rounded-full bg-[#D81B60] shadow-[0_0_8px_#D81B60]" />
        District Secretariat · {roleKey.toUpperCase()}
      </span>
    );
  }

  if (me.clubs.length === 1) {
    const club = me.clubs[0];
    const role = me.roles[0]?.roleKey ?? 'member';
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11.5px] font-semibold text-white/90">
        <span className="size-1.5 rounded-full bg-[#D81B60]" />
        {club.shortName} · {role}
      </span>
    );
  }
  const items: MenuItem[] = me.clubs.map((club) => ({ id: club.id, label: club.name, onSelect: () => undefined }));
  return (
    <Menu
      label={me.clubs[0].shortName}
      items={items}
      triggerClassName="border-white/20 bg-white/10 hover:bg-white/15 text-white min-h-9 py-1 px-3 rounded-full text-[12px] font-bold"
    />
  );
}

function UserMenu() {
  const { me, signOut, can } = useAuth();
  const { theme, toggle } = useTheme();
  if (!me) return null;
  const canManageRoles = can('roles:manage');
  const items: MenuItem[] = [
    ...(canManageRoles
      ? [{ id: 'access', label: 'Give / Revoke Access (Admin)', onSelect: () => { window.location.href = '/portal/admin/users'; } }]
      : []),
    { id: 'website', label: 'Return to District Website', onSelect: () => { window.location.href = '/'; } },
    { id: 'theme', label: theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode', onSelect: toggle },
    { id: 'sep', type: 'separator' },
    { id: 'signout', label: 'Sign out', onSelect: () => void signOut(), destructive: true },
  ];
  return (
    <Menu
      align="end"
      triggerClassName="border-white/20 bg-white/10 hover:bg-white/15 hover:border-white/30 text-white min-h-9 py-1 px-2.5 rounded-full shadow-xs"
      label={
        <span className="flex items-center gap-2">
          <Avatar name={me.user.name} src={me.profile?.photoUrl ?? undefined} size="sm" />
          <span className="hidden text-[12.5px] font-bold text-white sm:inline">{me.user.name}</span>
        </span>
      }
      items={items}
    />
  );
}

export interface PortalShellProps {
  children: ReactNode;
  adminOpenDefault?: boolean;
}

export function PortalShell({ children, adminOpenDefault }: PortalShellProps) {
  const { me, can } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const groups = useMemo(() => visibleGroups(PORTAL_NAV_GROUPS, (perm) => can(perm)), [me, can]);
  const hasAdminPerm = can('roles:manage') || can('reports:review') || can('settings:manage');
  const shouldOpenAdmin = adminOpenDefault ?? hasAdminPerm;

  return (
    <div className="flex min-h-screen flex-col bg-page">
      {/* Top Portal Quote Ribbon */}
      <div className="relative z-30 flex items-center justify-center bg-gradient-to-r from-[#123499] via-[#880E4F] to-[#D81B60] py-1 px-4 text-center shadow-xs">
        <span className="font-['Dancing_Script',cursive] text-[13.5px] font-semibold text-white tracking-wide drop-shadow-xs">
          “Start with rotaract and good things happen”
        </span>
      </div>

      <header className="relative flex h-[62px] shrink-0 items-center justify-between bg-[#0F1218] px-4 lg:px-7 shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#D81B60] via-[#123499] to-[#880E4F]" />

        {/* Left: Mobile Menu Trigger + District Logo */}
        <div className="flex items-center gap-3.5 lg:gap-6">
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-white transition-all hover:bg-white/20 hover:border-white/30"
          >
            {mobileNavOpen ? <XIcon size={18} /> : <MenuIcon size={18} />}
          </button>
          <Link to="/portal/dashboard" className="flex items-center gap-2.5">
            <img src="/district-logo.png" alt="Rotaract District Organization 3011" className="h-7 w-auto brightness-0 invert" />
            <span className="hidden sm:inline-block rounded-md bg-white/10 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#FF6B8B]">
              Portal
            </span>
          </Link>
        </div>

        {/* Center: Main Website Quick Navigator */}
        <div className="hidden md:flex items-center gap-1.5 text-[12px] font-semibold text-white/80">
          <a
            href="/"
            className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/10"
          >
            <Globe size={13} className="text-[#FF4081]" />
            <span>Main Website</span>
          </a>
          <span className="text-white/25">·</span>
          <a href="/directory" className="text-white/70 hover:text-white px-2 py-1 rounded-md hover:bg-white/10 transition-colors text-[11.5px]">Clubs Map</a>
          <span className="text-white/25">·</span>
          <a href="/showcase" className="text-white/70 hover:text-white px-2 py-1 rounded-md hover:bg-white/10 transition-colors text-[11.5px]">Showcase</a>
          <span className="text-white/25">·</span>
          <a href="/heritage" className="text-white/70 hover:text-white px-2 py-1 rounded-md hover:bg-white/10 transition-colors text-[11.5px]">Heritage</a>
          <span className="text-white/25">·</span>
          <a href="/governance" className="text-white/70 hover:text-white px-2 py-1 rounded-md hover:bg-white/10 transition-colors text-[11.5px]">Leadership</a>
        </div>

        {/* Right: User Scope & Profile Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ScopeSwitcher />
          <UserMenu />
        </div>
      </header>

      {/* Main Container with Restored Sidebar & Content */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 gap-8 px-4 py-6 lg:px-7">
        <aside className="hidden w-[230px] shrink-0 lg:block sticky top-6 max-h-[calc(100vh-4rem)] overflow-y-auto pr-2 pb-6 scrollbar-thin">
          <GroupList groups={groups} adminOpenDefault={shouldOpenAdmin} />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {/* Mobile Drawer */}
      <Drawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} title="District Portal Navigation" side="left">
        <GroupList groups={groups} adminOpenDefault={shouldOpenAdmin} onNavigate={() => setMobileNavOpen(false)} />
      </Drawer>
    </div>
  );
}

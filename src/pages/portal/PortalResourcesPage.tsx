import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import {
  FolderOpen,
  ExternalLink,
  Search,
  Lock,
  Sparkles,
  ShieldCheck,
  PlusCircle,
  Copy,
  Check,
  Folder,
} from 'lucide-react';
import { useDocumentMeta } from '@/lib/meta';
import { useAuth } from '@/app/auth';
import { fetchResources, categoryLabel } from '@/lib/publicApi/resources';
import { DISTRICT_RESOURCES, type DistrictResource, type ResourceSublink, type ResourceSubfolder } from '@/district/data/districtData';
import { Container } from '@/components/ui/Container';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

interface UnifiedResourceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  badge?: string;
  driveUrl?: string;
  isLocked?: boolean;
  isMaster?: boolean;
  sublinks?: ResourceSublink[];
  subfolders?: ResourceSubfolder[];
}

function getFormatBadge(name: string, type?: string): { label: string; tone: BadgeTone } {
  const t = (type || '').toUpperCase();
  if (t === 'PDF') return { label: 'PDF', tone: 'red' };
  if (t === 'PPTX' || t === 'LETTERHEAD') return { label: t, tone: 'amber' };
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) return { label: 'PDF', tone: 'red' };
  if (lower.endsWith('.pptx') || lower.endsWith('.ppt')) return { label: 'PPTX', tone: 'amber' };
  if (lower.endsWith('.docx') || lower.endsWith('.doc')) return { label: 'DOCX', tone: 'blue' };
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) return { label: 'XLSX', tone: 'green' };
  return { label: t || 'FILE', tone: 'neutral' };
}

export function PortalResourcesPage() {
  useDocumentMeta({ title: 'District Resource Center' });
  const { can } = useAuth();
  const canManage = can('public_content:manage');

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Master Google Drive from official district data
  const masterDrive = DISTRICT_RESOURCES.find((r) => r.isRoot);
  const staticResources = DISTRICT_RESOURCES.filter((r) => !r.isRoot);

  // Live portal-managed resources
  const { data: apiData, isPending } = useQuery({
    queryKey: ['portal-resources'],
    queryFn: fetchResources,
    staleTime: 5 * 60 * 1000,
  });

  // Combine static and API resources
  const allItems: UnifiedResourceItem[] = useMemo(() => {
    const portalItems: UnifiedResourceItem[] = (apiData?.items || []).map((r) => ({
      id: `api-${r.id}`,
      title: r.title,
      description: r.description || (r.comingSoonMonth ? `Coming ${r.comingSoonMonth}` : ''),
      category: categoryLabel(r.category),
      badge: r.isLocked ? 'Portal Restricted' : 'Portal Resource',
      driveUrl: r.url || undefined,
      isLocked: r.isLocked,
    }));

    const portalTitles = new Set(portalItems.map((p) => p.title.trim().toLowerCase()));

    const staticItems: UnifiedResourceItem[] = staticResources
      .filter((s) => !portalTitles.has(s.title.trim().toLowerCase()))
      .map((s: DistrictResource) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        category: s.category,
        badge: s.badge,
        driveUrl: s.driveUrl,
        isLocked: false,
        sublinks: s.sublinks,
        subfolders: s.subfolders,
      }));

    return [...portalItems, ...staticItems];
  }, [apiData, staticResources]);

  // Derive unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    allItems.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return ['all', ...Array.from(set)];
  }, [allItems]);

  // Filter by category and search
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allItems.filter((item) => {
      const matchesCat = activeCategory === 'all' || item.category === activeCategory;
      if (!matchesCat) return false;
      if (!q) return true;

      const inTitle = item.title.toLowerCase().includes(q);
      const inDesc = item.description?.toLowerCase().includes(q);
      const inSublinks = item.sublinks?.some((sl) => sl.name.toLowerCase().includes(q));
      const inSubfolders = item.subfolders?.some(
        (sf) => sf.name.toLowerCase().includes(q) || sf.description.toLowerCase().includes(q),
      );

      return inTitle || inDesc || inSublinks || inSubfolders;
    });
  }, [allItems, activeCategory, searchQuery]);

  const handleCopy = (id: string, url?: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Container className="py-6 lg:py-8" width="default">
      {/* Master Google Drive Hero Banner */}
      <div className="relative mb-8 overflow-hidden rounded-[24px] border border-accent/25 bg-gradient-to-br from-[#181B2A] via-[#12141F] to-[#0A0B10] p-6 lg:p-9 text-white shadow-2xl backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#D81B60]/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-[#123499]/25 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/15 px-3 py-1 text-xs font-bold text-[#FF6B8B]">
              <Sparkles className="size-3.5 text-[#FF6B8B]" />
              OFFICIAL DISTRICT REPOSITORY (RY 2026-27)
            </div>
            <h1 className="m-0 text-2xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              District Resources &amp; Document Drive
            </h1>
            <p className="mt-2.5 text-sm lg:text-base text-fg-muted leading-relaxed m-0 font-normal">
              Direct access to the official shared Google Drive repository containing administrative protocols,
              installation guidelines, contact rosters, points manuals, brand toolkits, and certificates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {masterDrive && (
              <a
                href={masterDrive.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-[14px] bg-[#D81B60] hover:bg-[#C21350] px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-[#D81B60]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <FolderOpen className="size-4.5" />
                <span>Open Master Google Drive</span>
                <ExternalLink className="size-3.5 opacity-80" />
              </a>
            )}

            {canManage && (
              <Link to="/portal/admin/public-content/resources">
                <Button variant="secondary" size="md" className="gap-2 border-white/20 bg-white/10 hover:bg-white/20 text-white">
                  <PlusCircle className="size-4" />
                  Manage Drive Items
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Search Bar inside Hero */}
        <div className="relative mt-7 max-w-lg">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents, rosters, brand toolkits, or protocols..."
            className="pl-10 h-11.5 rounded-xl bg-white/10 border-white/15 text-white placeholder:text-white/40 focus:border-[#D81B60] focus:ring-1 focus:ring-[#D81B60]"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/50 pointer-events-none" />
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          const label = cat === 'all' ? 'All Resources' : cat;
          const count = cat === 'all' ? allItems.length : allItems.filter((i) => i.category === cat).length;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-accent text-white shadow-md shadow-accent/25 ring-2 ring-accent/30'
                  : 'bg-surface text-fg-2 hover:bg-accent-soft hover:text-accent border border-border'
              }`}
            >
              <span>{label}</span>
              <span
                className={`ml-1 rounded-full px-1.5 py-0.2 text-[10.5px] font-black ${
                  isActive ? 'bg-white/25 text-white' : 'bg-fg-muted/10 text-fg-3'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Resource Cards Grid */}
      {isPending ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} shape="rect" className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center bg-surface/50">
          <EmptyState
            title="No matching resources found"
            body={
              searchQuery
                ? `No files matching "${searchQuery}". Try a different keyword.`
                : 'No files are listed in this category.'
            }
          />
          {searchQuery && (
            <Button variant="secondary" size="sm" onClick={() => setSearchQuery('')} className="mt-4">
              Clear search filter
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map((item) => {
            const hasDrive = Boolean(item.driveUrl);
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 lg:p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
              >
                <div>
                  {/* Top Metadata Row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-bold text-accent-deep">
                      {item.badge || item.category}
                    </span>

                    <div className="flex items-center gap-2">
                      {item.isLocked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-fg-3">
                          <Lock className="size-3" />
                          Restricted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <ShieldCheck className="size-3.5" />
                          Official Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-fg group-hover:text-accent transition-colors m-0 leading-snug">
                    {hasDrive ? (
                      <a
                        href={item.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-inherit"
                      >
                        {item.title}
                      </a>
                    ) : (
                      item.title
                    )}
                  </h3>

                  <p className="mt-2 text-xs lg:text-[13px] text-fg-2 leading-relaxed m-0">
                    {item.description}
                  </p>

                  {/* Nested Subfolders (e.g. Logo printables, strips, theme) */}
                  {item.subfolders && item.subfolders.length > 0 && (
                    <div className="mt-4 rounded-xl border border-border bg-accent-soft/30 p-3.5">
                      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-accent">
                        <Folder className="size-3.5" />
                        <span>Included Subfolders:</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {item.subfolders.map((sf, idx) => (
                          <a
                            key={idx}
                            href={sf.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/sf flex items-start justify-between gap-2 rounded-lg bg-surface px-2.5 py-2 text-xs transition-colors hover:bg-accent hover:text-white border border-border"
                          >
                            <div>
                              <div className="font-bold text-fg group-hover/sf:text-white flex items-center gap-1.5">
                                <FolderOpen className="size-3 shrink-0 text-accent group-hover/sf:text-white" />
                                <span>{sf.name}</span>
                              </div>
                              <div className="text-[11px] text-fg-3 group-hover/sf:text-white/80 mt-0.5">
                                {sf.description}
                              </div>
                            </div>
                            <ExternalLink className="size-3 shrink-0 opacity-60 group-hover/sf:opacity-100 mt-0.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nested Sublinks (e.g. Directories, Points PDF, Letterheads) */}
                  {item.sublinks && item.sublinks.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.sublinks.map((sl, idx) => {
                        const fmt = getFormatBadge(sl.name, sl.type);
                        return (
                          <a
                            key={idx}
                            href={item.driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-[11.5px] font-semibold text-fg-2 hover:border-accent hover:text-accent transition-colors"
                          >
                            <Badge tone={fmt.tone} className="text-[9.5px] px-1.5 py-0">
                              {fmt.label}
                            </Badge>
                            <span>{sl.name}</span>
                            <ExternalLink className="size-2.5 opacity-50" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-fg-3 uppercase tracking-wider">
                    {item.category}
                  </span>

                  <div className="flex items-center gap-2">
                    {hasDrive && (
                      <button
                        onClick={() => handleCopy(item.id, item.driveUrl)}
                        title="Copy Drive Link"
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-fg-2 hover:bg-accent-soft hover:text-accent transition-colors"
                      >
                        {isCopied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}

                    {hasDrive ? (
                      <a
                        href={item.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition-all hover:shadow-md hover:shadow-accent/20"
                      >
                        <span>Open Folder</span>
                        <ExternalLink className="size-3" />
                      </a>
                    ) : item.isLocked ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-fg-3">
                        <Lock className="size-3" />
                        Sign-in Required
                      </span>
                    ) : (
                      <span className="text-xs text-fg-3">Archived</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Container>
  );
}

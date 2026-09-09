import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import {
  FileText,
  ExternalLink,
  Search,
  Lock,
  FolderOpen,
  Sparkles,
  Layers,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  ShieldCheck,
  PlusCircle,
} from 'lucide-react';
import { useDocumentMeta } from '@/lib/meta';
import { useAuth } from '@/app/auth';
import { fetchResources, type Resource } from '@/lib/publicApi/resources';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';

const CATEGORIES = [
  { id: 'all', label: 'All Resources', icon: Layers },
  { id: 'documents', label: 'Documents & Guidelines', icon: FileText },
  { id: 'forms', label: 'Forms & Circulars', icon: FileSpreadsheet },
  { id: 'logos', label: 'Brand & Logos', icon: ImageIcon },
  { id: 'photos', label: 'Media Assets', icon: ImageIcon },
  { id: 'guest_kit', label: 'Guest Kits', icon: FolderOpen },
  { id: 'templates', label: 'Letterheads & Templates', icon: FileCode },
] as const;

function getFileFormat(url: string | null): { label: string; tone: BadgeTone } {
  if (!url) return { label: 'Link', tone: 'neutral' };
  const cleanUrl = url.toLowerCase().split('?')[0];
  if (cleanUrl.endsWith('.pdf')) return { label: 'PDF', tone: 'red' };
  if (cleanUrl.endsWith('.docx') || cleanUrl.endsWith('.doc')) return { label: 'DOCX', tone: 'blue' };
  if (cleanUrl.endsWith('.xlsx') || cleanUrl.endsWith('.xls')) return { label: 'XLSX', tone: 'green' };
  if (cleanUrl.endsWith('.pptx') || cleanUrl.endsWith('.ppt')) return { label: 'PPTX', tone: 'amber' };
  if (cleanUrl.endsWith('.png') || cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.svg') || cleanUrl.endsWith('.webp'))
    return { label: 'IMAGE', tone: 'pink' };
  if (cleanUrl.includes('drive.google.com')) return { label: 'DRIVE', tone: 'green' };
  return { label: 'DOCUMENT', tone: 'neutral' };
}

export function PortalResourcesPage() {
  useDocumentMeta({ title: 'District Resource Center' });
  const { can } = useAuth();
  const canManage = can('public_content:manage');

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['portal-resources'],
    queryFn: fetchResources,
  });

  const allItems = data?.items ?? [];

  const filteredItems = useMemo(() => {
    return allItems.filter((item: Resource) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [allItems, activeCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allItems.length };
    for (const item of allItems) {
      counts[item.category] = (counts[item.category] ?? 0) + 1;
    }
    return counts;
  }, [allItems]);

  return (
    <Container className="py-8" width="default">
      {/* Header Banner */}
      <div className="relative mb-8 overflow-hidden rounded-[20px] border border-white/10 bg-gradient-to-br from-[#181B2A]/90 to-[#10121C]/90 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-light mb-3">
              <Sparkles className="size-3.5" />
              Rotaract District 3011 Central Repository
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white m-0">
              District Resource Center
            </h1>
            <p className="mt-2 text-sm md:text-base text-fg-muted max-w-2xl m-0 leading-relaxed">
              Official circulars, reporting templates, official logos, brand guidelines, and district forms
              for club officers and active Rotaractors.
            </p>
          </div>

          {canManage && (
            <div className="shrink-0">
              <Link to="/portal/admin/public-content/resources">
                <Button variant="primary" size="sm" className="gap-2 shadow-lg shadow-accent/20">
                  <PlusCircle className="size-4" />
                  Manage Resources
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mt-6 max-w-md">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, keyword, or document name..."
            className="pl-10 h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-accent"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40 pointer-events-none" />
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const count = categoryCounts[cat.id] ?? 0;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-accent text-white shadow-lg shadow-accent/25 ring-2 ring-accent/30'
                  : 'bg-white/5 text-fg-muted hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              <Icon className="size-3.5" />
              <span>{cat.label}</span>
              <span
                className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content State Handling */}
      {isPending ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} shape="rect" className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <Card rule="accent" className="p-8 text-center">
          <ErrorState
            title="Couldn't load district resources"
            body="Please check your connection and retry loading the repository."
            onRetry={() => void refetch()}
          />
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card rule="none" className="p-12 text-center border-dashed border-white/10 bg-white/[0.02]">
          <EmptyState
            title="No matching resources found"
            body={
              searchQuery
                ? `No documents matching "${searchQuery}". Try adjusting your query.`
                : 'District administrators have not uploaded files to this category yet. Check back soon.'
            }
          />
          {canManage && (
            <div className="mt-4">
              <Link to="/portal/admin/public-content/resources">
                <Button variant="secondary" size="sm" className="gap-2">
                  <PlusCircle className="size-4" />
                  Add First Resource
                </Button>
              </Link>
            </div>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item: Resource) => {
            const format = getFileFormat(item.url);
            const isLocked = item.isLocked || !item.url;

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-b from-[#161826]/80 to-[#10121C]/90 p-5 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5"
              >
                <div>
                  {/* Top metadata row */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge tone={format.tone} className="text-[10px] font-black tracking-wider uppercase">
                      {format.label}
                    </Badge>
                    {isLocked ? (
                      <Badge tone="neutral" className="gap-1 text-[10px]">
                        <Lock className="size-2.5" />
                        Restricted
                      </Badge>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                        <ShieldCheck className="size-3" />
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-white group-hover:text-accent-light transition-colors line-clamp-2 m-0">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="mt-2 text-xs text-fg-muted line-clamp-3 m-0 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                    {item.category.replace('_', ' ')}
                  </span>

                  {item.comingSoonMonth ? (
                    <Badge tone="amber">Coming {item.comingSoonMonth}</Badge>
                  ) : isLocked ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/40">
                      <Lock className="size-3" />
                      Role Protected
                    </span>
                  ) : (
                    <a
                      href={item.url ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-accent-light transition-all hover:bg-accent hover:text-white"
                    >
                      <span>Access</span>
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Container>
  );
}

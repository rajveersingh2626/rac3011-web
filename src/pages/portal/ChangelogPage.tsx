import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GitCommit, GitBranch, ExternalLink } from 'lucide-react';
import { useDocumentMeta } from '@/lib/meta';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';

interface GitHubCommit {
  sha: string;
  commit: { message: string; author: { name: string; date: string } };
  html_url: string;
  author: { avatar_url: string; login: string } | null;
}

const REPOS = [
  { key: 'web', label: 'Platform (Web)', repo: 'rajveersingh2626/rac3011-web', color: '#123499' },
  { key: 'api', label: 'API (Backend)', repo: 'rajveersingh2626/rac3011-api', color: '#D81B60' },
] as const;
type RepoKey = (typeof REPOS)[number]['key'];

async function fetchCommits(repo: string): Promise<GitHubCommit[]> {
  const res = await fetch(
    `https://api.github.com/repos/${repo}/commits?per_page=25`,
    { headers: { Accept: 'application/vnd.github+json' } },
  );
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  return res.json() as Promise<GitHubCommit[]>;
}

function parseMessage(raw: string) {
  const [first, ...rest] = raw.trim().split('\n');
  const title = first.trim();
  const body = rest.filter(Boolean).join('\n').trim();
  const m = title.match(/^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)(\(.+?\))?[!:]?\s*/i);
  const type = m?.[1]?.toLowerCase() ?? 'update';
  return { title, body, type };
}

function typeTone(type: string): 'green' | 'red' | 'blue' | 'amber' | 'neutral' {
  if (type === 'feat') return 'green';
  if (type === 'fix') return 'red';
  if (['perf', 'refactor'].includes(type)) return 'blue';
  if (['chore', 'build', 'ci'].includes(type)) return 'amber';
  return 'neutral';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function CommitCard({ commit, accentColor }: { commit: GitHubCommit; accentColor: string }) {
  const { title, body, type } = parseMessage(commit.commit.message);
  const sha7 = commit.sha.slice(0, 7);
  const when = timeAgo(commit.commit.author.date);
  return (
    <div
      style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px 18px', borderRadius: '14px', background: '#fff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s ease' }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.09)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
    >
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
        {commit.author?.avatar_url ? (
          <img src={commit.author.avatar_url} alt={commit.author.login} style={{ width: '32px', height: '32px', borderRadius: '50%', border: `2px solid ${accentColor}33` }} />
        ) : (
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${accentColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor }}>
            <GitCommit size={16} />
          </div>
        )}
        <div style={{ width: '2px', flex: 1, background: `${accentColor}22`, minHeight: '8px' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
          <Badge tone={typeTone(type)}>{type.toUpperCase()}</Badge>
          <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#94a3b8', background: '#f1f5f9', padding: '2px 7px', borderRadius: '6px' }}>{sha7}</span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: 'auto' }}>{when}</span>
        </div>
        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', margin: '0 0 4px 0', lineHeight: 1.4, wordBreak: 'break-word' }}>{title}</p>
        {body && <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 6px 0', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>{body}</p>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>by <strong style={{ color: '#475569' }}>{commit.commit.author.name}</strong></span>
          <a href={commit.html_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: accentColor, textDecoration: 'none', fontWeight: 600 }}>
            View on GitHub <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
}

export function ChangelogPage() {
  useDocumentMeta({ title: 'Changelog' });
  const [activeRepo, setActiveRepo] = useState<RepoKey>('web');
  const selected = REPOS.find((r) => r.key === activeRepo)!;
  const query = useQuery({
    queryKey: ['changelog', activeRepo],
    queryFn: () => fetchCommits(selected.repo),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  return (
    <Container width="default">
      <Section
        eyebrow="Portal"
        title="Platform Changelog"
        description="Recent commits, fixes, and feature additions across the platform — straight from GitHub."
      >
        {/* Repo Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {REPOS.map((repo) => {
            const isActive = repo.key === activeRepo;
            return (
              <button
                key={repo.key}
                type="button"
                onClick={() => setActiveRepo(repo.key)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '12px', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease', border: isActive ? 'none' : `1px solid ${repo.color}33`, backgroundColor: isActive ? repo.color : `${repo.color}0D`, color: isActive ? '#fff' : repo.color, boxShadow: isActive ? `0 4px 12px ${repo.color}40` : 'none' }}
              >
                {repo.label}
              </button>
            );
          })}
        </div>

        {/* Repo context line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '18px', fontSize: '0.8rem', color: '#94a3b8' }}>
          <GitBranch size={13} />
          <span>main branch ·</span>
          <a href={`https://github.com/${selected.repo}/commits/main`} target="_blank" rel="noopener noreferrer" style={{ color: selected.color, fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            {selected.repo} <ExternalLink size={11} />
          </a>
        </div>

        {/* Loading */}
        {query.isPending && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} shape="rect" className="h-20 rounded-[14px]" />)}
          </div>
        )}

        {/* Error */}
        {query.isError && (
          <div style={{ textAlign: 'center', padding: '48px 24px', borderRadius: '16px', background: '#fff5f5', border: '1px solid #fecaca' }}>
            <GitCommit size={36} style={{ margin: '0 auto 12px', color: '#f87171' }} />
            <p style={{ fontWeight: 700, color: '#dc2626', marginBottom: '4px' }}>Couldn't load commits</p>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>GitHub API may be rate-limited. Try again shortly.</p>
            <button type="button" onClick={() => void query.refetch()} style={{ marginTop: '14px', padding: '8px 20px', borderRadius: '10px', background: '#dc2626', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>Retry</button>
          </div>
        )}

        {/* Commit list */}
        {query.isSuccess && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {query.data.length === 0 && (
              <p style={{ textAlign: 'center', color: '#94a3b8', padding: '32px' }}>No commits found.</p>
            )}
            {query.data.map((c) => (
              <CommitCard key={c.sha} commit={c} accentColor={selected.color} />
            ))}
          </div>
        )}
      </Section>
    </Container>
  );
}

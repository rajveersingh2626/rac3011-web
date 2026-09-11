import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FolderOpen, ExternalLink, FileText, Folder, Lock } from 'lucide-react';
import { DISTRICT_RESOURCES } from '../../data/districtData';
import type { ResourceSublink, ResourceSubfolder } from '../../data/districtData';
import { fetchResources, categoryLabel } from '@/lib/publicApi/resources';

// Static drive folders and portal-managed resources render through the same card.
interface ResourceCard {
  id: string;
  title: string;
  description: string;
  category: string;
  badge?: string;
  driveUrl?: string;
  isLocked?: boolean;
  sublinks?: ResourceSublink[];
  subfolders?: ResourceSubfolder[];
}

export type DistrictResourcesViewProps = Record<string, never>;

export default function DistrictResourcesView() {
  // GET /public/resources is a flat list (category/title/description/url/isLocked/comingSoonMonth):
  // it cannot express the root drive flag, nested subfolders or sublinks, so the Google Drive
  // folder tree stays local until the API grows a folder model.
  const masterDrive = DISTRICT_RESOURCES.find(r => r.isRoot);
  const staticSubfolders = DISTRICT_RESOURCES.filter(r => !r.isRoot);

  // Portal-managed resources (added by admins via the Resources panel)
  const resourcesQuery = useQuery({
    queryKey: ['public', 'resources'],
    queryFn: fetchResources,
    staleTime: 5 * 60 * 1000,
  });

  const portalResources = useMemo(
    () =>
      (resourcesQuery.data?.items || []).map((r) => ({
        id: `portal-${r.id}`,
        title: r.title,
        description: r.description || (r.comingSoonMonth ? `Coming ${r.comingSoonMonth}` : ''),
        category: categoryLabel(r.category),
        badge: r.isLocked ? 'Portal · Sign-in Required' : 'Portal Resource',
        driveUrl: r.url || undefined,
        isLocked: r.isLocked,
      })),
    [resourcesQuery.data],
  );

  // API wins on title collisions; the local drive folders only fill what it cannot serve.
  const portalTitles = new Set(portalResources.map((r) => r.title.trim().toLowerCase()));
  const subfolders: ResourceCard[] = [
    ...portalResources,
    ...staticSubfolders.filter((r) => !portalTitles.has(r.title.trim().toLowerCase())),
  ];

  return (
    <div style={{ marginTop: '40px' }}>

      {/* Header Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '28px' }}>
        <div>
          <span className="pill-gold" style={{ marginBottom: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <FolderOpen size={14} /> OFFICIAL DISTRICT REPOSITORY (RY 2026-27)
          </span>
          <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-1px' }}>
            District Resources &amp; Document Drive
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.92)', fontSize: '1rem', marginTop: '8px', maxWidth: '780px', lineHeight: 1.5, fontWeight: 500 }}>
            Direct access to the official shared Google Drive repository containing administrative protocols, installation guidelines, contact rosters, points manuals, and brand toolkits.
          </p>
        </div>

        {masterDrive && (
          <a
            href={masterDrive.driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-rotaract"
            style={{
              padding: '14px 28px',
              fontSize: '0.96rem',
              backgroundColor: '#FFFFFF',
              color: '#123499',
              fontWeight: 800,
              border: 'none',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '14px'
            }}
          >
            <FolderOpen size={18} /> Open Master Google Drive <ExternalLink size={16} />
          </a>
        )}
      </div>

      {/* Master Drive Banner */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.86)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderRadius: '20px',
          padding: '24px 28px',
          marginBottom: '32px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255, 255, 255, 0.72)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: '#123499',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(18, 52, 153, 0.32)',
              flexShrink: 0
            }}
          >
            <FolderOpen size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pill-pink" style={{ fontSize: '0.74rem', padding: '3px 10px' }}>Master Drive Archive</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Google Drive Verified</span>
            </div>
            <h3 style={{ fontSize: '1.28rem', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
              Important Documents 2026-27
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Subfolders, directories, official guidelines, certificates, letterheads, and points manual.
            </p>
          </div>
        </div>

        <a
          href={masterDrive?.driveUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: '#123499',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: 800,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          View Full Drive <ExternalLink size={15} />
        </a>
      </div>

      {/* Grid of Subfolders */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Folder size={20} /> Drive Subfolders &amp; Categories
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {subfolders.map((folder) => (
          <div
            key={folder.id}
            className="rotaract-card"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 12px 32px rgba(12, 36, 112, 0.16)',
              border: '1.5px solid rgba(255, 255, 255, 0.75)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 18px 40px rgba(12, 36, 112, 0.24)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(12, 36, 112, 0.16)';
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="pill-pink" style={{ fontSize: '0.74rem', padding: '3px 10px', background: '#EEF1FA', color: '#123499' }}>
                  {folder.badge || folder.category}
                </span>
                {folder.driveUrl ? (
                  <a
                    href={folder.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#123499' }}
                    title="Open in Google Drive"
                  >
                    <ExternalLink size={16} />
                  </a>
                ) : folder.isLocked ? (
                  // lucide-react's prop type omits `title`, but it is spread onto the <svg> at runtime.
                  <Lock size={16} style={{ color: 'var(--text-secondary)' }} {...({ title: 'Sign in on the portal to access' } as { title: string })} />
                ) : null}
              </div>

              <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.25 }}>
                {folder.driveUrl ? (
                  <a
                    href={folder.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    {folder.title}
                  </a>
                ) : (
                  folder.title
                )}
              </h4>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {folder.description}
              </p>

              {/* Nested Subfolders (e.g. Logos) */}
              {folder.subfolders && folder.subfolders.length > 0 && (
                <div style={{ marginTop: '14px', backgroundColor: '#EEF1FA', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#123499', textTransform: 'uppercase' }}>
                    Subfolders Hyperlinked:
                  </span>
                  {folder.subfolders.map((sf, idx) => (
                    <a
                      key={idx}
                      href={sf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#123499',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 0'
                      }}
                    >
                      <span>• {sf.name}</span>
                      <ExternalLink size={12} />
                    </a>
                  ))}
                </div>
              )}

              {/* Sublinks (e.g. Databases / Points) */}
              {folder.sublinks && folder.sublinks.length > 0 && (
                <div style={{ marginTop: '14px', backgroundColor: '#EEF1FA', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#123499', textTransform: 'uppercase' }}>
                    Key Included Files:
                  </span>
                  {folder.sublinks.map((sl, idx) => (
                    <div key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={13} style={{ color: '#123499' }} />
                      <span>{sl.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{folder.category}</span>
              {folder.driveUrl ? (
              <a
                href={folder.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#123499',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Open Google Drive →
              </a>
              ) : folder.isLocked ? (
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={13} /> Sign in on Portal
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

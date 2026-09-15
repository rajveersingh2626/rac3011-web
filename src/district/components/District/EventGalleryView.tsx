import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Image as ImageIcon,
  Search,
  Calendar,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { fetchGalleryItems, type PublicGalleryItem } from '@/lib/publicApi/gallery';

const FALLBACK_GALLERY_ITEMS: PublicGalleryItem[] = [
  {
    id: 'sample-1',
    title: 'District Leadership Training Seminar 2026',
    eventName: 'Aagaaz - DLTS 2026',
    category: 'District Events',
    imageUrl: '/slideshow-team-hall.webp',
    caption: 'Incoming club leaders and district officials gathering for leadership orientation and strategic planning.',
    date: '2026-07-12',
    order: 1,
  },
  {
    id: 'sample-2',
    title: 'Rotaract District Assembly Installation',
    eventName: 'District Installation Ceremony',
    category: 'Installations',
    imageUrl: '/slideshow-yugarambh-sitting.webp',
    caption: 'Official collar transfer and charter presentation celebrating the commencement of Rotary Year 2026-27.',
    date: '2026-07-26',
    order: 2,
  },
  {
    id: 'sample-3',
    title: 'Mahadan 11.0 Mega Blood Donation Drive',
    eventName: 'Mahadan 11.0',
    category: 'Club Projects',
    imageUrl: '/showcase_images/amrit-40-chabeel-seva-c20-1.webp',
    caption: 'Joint community blood donation camp uniting clubs across Delhi and NCR.',
    date: '2026-08-15',
    order: 3,
  },
  {
    id: 'sample-4',
    title: 'District Fellowship Night & Cultural Evening',
    eventName: 'Jalsa Fellowship',
    category: 'Socials',
    imageUrl: '/slideshow-drr-speech.webp',
    caption: 'Rotaractors across zones bonding over music, talent showcases, and cultural performances.',
    date: '2026-08-28',
    order: 4,
  },
  {
    id: 'sample-5',
    title: 'Youth Leadership & Career Conclave',
    eventName: 'Career Conclave 2026',
    category: 'Conferences',
    imageUrl: '/slideshow-dg-speech.webp',
    caption: 'Panel discussions on corporate readiness, tech careers, and entrepreneurship by distinguished Rotarians.',
    date: '2026-09-05',
    order: 5,
  },
  {
    id: 'sample-6',
    title: 'Rotary Day of Service - Environmental Drive',
    eventName: 'Green Delhi Initiative',
    category: 'Club Projects',
    imageUrl: '/showcase_images/apnapan-a-rakhi-initiative-c72-1.webp',
    caption: 'Tree plantation drive and ecological awareness campaign conducted across NCR universities.',
    date: '2026-09-10',
    order: 6,
  },
  {
    id: 'sample-7',
    title: 'District Rotaract Cricket League',
    eventName: 'RCL Season 2026',
    category: 'District Events',
    imageUrl: '/rcl-cricket.webp',
    caption: 'Inter-club sporting fellowship and cricket tournament across Delhi NCR.',
    date: '2026-09-01',
    order: 7,
  },
  {
    id: 'sample-8',
    title: 'District Council Oath Taking',
    eventName: 'DAC Induction 2026-27',
    category: 'Installations',
    imageUrl: '/hero-dac-oath.webp',
    caption: 'District Action Committee taking the pledge to serve Rotary International District 3011.',
    date: '2026-07-20',
    order: 8,
  },
  {
    id: 'sample-9',
    title: 'Yugarambh - District Rotaract Assembly',
    eventName: 'Yugarambh 2026',
    category: 'Installations',
    imageUrl: '/slideshow-yugarambh-standing.webp',
    caption: 'Celebrating the vibrant spirit of youth fellowship at Yugarambh 2026.',
    date: '2026-07-27',
    order: 9,
  },
];

export default function EventGalleryView() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const { data, isError } = useQuery({
    queryKey: ['public', 'gallery'],
    queryFn: fetchGalleryItems,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const allItems: PublicGalleryItem[] = useMemo(() => {
    if (isError) return FALLBACK_GALLERY_ITEMS;
    const items = data?.items;
    if (Array.isArray(items) && items.length > 0) return items;
    // API returned empty array (all items deleted) or still loading — show fallbacks
    if (!data) return []; // still loading, show nothing yet
    return FALLBACK_GALLERY_ITEMS;
  }, [data, isError]);


  const categories = useMemo(() => {
    const cats = new Set<string>(['All']);
    allItems.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats);
  }, [allItems]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.eventName && item.eventName.toLowerCase().includes(q)) ||
        (item.caption && item.caption.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [allItems, selectedCategory, searchQuery]);

  // Lightbox keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0));
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredItems.length]);

  const currentLightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <div style={{ marginTop: '40px', position: 'relative' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '28px' }}>
        <div>
          <span className="pill-gold" style={{ marginBottom: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} /> DISTRICT EVENT GALLERY · RY 2026-27
          </span>
          <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 900, color: '#123499', letterSpacing: '-1px' }}>
            Moments &amp; District Gallery
          </h2>
          <p style={{ color: '#475569', fontSize: '1rem', marginTop: '8px', maxWidth: '780px', lineHeight: 1.5, fontWeight: 500 }}>
            Capturing the spirit of youth leadership, high-impact community projects, district assemblies, installations, and fellowships across Rotaract District 3011.
          </p>
        </div>
      </div>

      {/* Controls Bar: Categories & Search */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '20px',
          padding: '16px 22px',
          marginBottom: '32px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
          border: '1px solid rgba(255, 255, 255, 0.75)',
        }}
      >
        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: isActive ? 'none' : '1px solid rgba(18, 52, 153, 0.15)',
                  backgroundColor: isActive ? '#123499' : 'rgba(255, 255, 255, 0.7)',
                  color: isActive ? '#FFFFFF' : '#123499',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 12px rgba(18, 52, 153, 0.25)' : 'none',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px', maxWidth: '360px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8892b0',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search moments by title, event..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 14px 9px 36px',
              borderRadius: '12px',
              border: '1px solid #d1d5db',
              fontSize: '0.88rem',
              backgroundColor: '#FFFFFF',
              color: '#1e293b',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredItems.length === 0 ? (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(12px)',
            borderRadius: '20px',
            padding: '48px 24px',
            textAlign: 'center',
            color: '#475569',
          }}
        >
          <ImageIcon size={48} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>No photos found</h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '6px' }}>
            Try selecting another category or clearing your search query.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px',
          }}
        >
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setLightboxIndex(idx)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '18px',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.06)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 16px 36px rgba(18, 52, 153, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
              }}
            >
              {/* Image with Aspect Ratio */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: '66.6%',
                  backgroundColor: '#f1f5f9',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.4s ease',
                  }}
                  loading="lazy"
                  onError={(e) => {
                    const img = e.currentTarget;
                    const wrapper = img.parentElement;
                    if (!wrapper) return;
                    img.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.style.cssText = [
                      'position:absolute', 'inset:0',
                      'background:linear-gradient(135deg,#123499 0%,#0C2470 60%,#D81B60 100%)',
                      'display:flex', 'align-items:center', 'justify-content:center',
                      'flex-direction:column', 'gap:8px', 'color:#fff',
                    ].join(';');
                    fallback.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.6"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><span style="font-size:0.72rem;font-weight:700;letter-spacing:0.5px;opacity:0.7">District 3011</span>`;
                    wrapper.appendChild(fallback);
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    display: 'flex',
                    gap: '6px',
                  }}
                >
                  <span
                    style={{
                      backgroundColor: 'rgba(18, 52, 153, 0.88)',
                      backdropFilter: 'blur(8px)',
                      color: '#FFFFFF',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      letterSpacing: '0.3px',
                    }}
                  >
                    {item.category || 'District'}
                  </span>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Maximize2 size={14} />
                </div>
              </div>

              {/* Card Meta */}
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b', marginBottom: '6px' }}>
                  <Calendar size={13} />
                  <span>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  {item.eventName && (
                    <>
                      <span>•</span>
                      <span style={{ fontWeight: 600, color: '#d91b5c' }}>{item.eventName}</span>
                    </>
                  )}
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', lineHeight: 1.35 }}>
                  {item.title}
                </h4>

                {item.caption && (
                  <p
                    style={{
                      fontSize: '0.82rem',
                      color: '#475569',
                      lineHeight: 1.4,
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.caption}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {currentLightboxItem && lightboxIndex !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)')}
          >
            <X size={24} />
          </button>

          {/* Left Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredItems.length - 1));
            }}
            style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
              zIndex: 10,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)')}
          >
            <ChevronLeft size={28} />
          </button>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev !== null && prev < filteredItems.length - 1 ? prev + 1 : 0));
            }}
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
              zIndex: 10,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)')}
          >
            <ChevronRight size={28} />
          </button>

          {/* Modal Content Box */}
          <div
            style={{
              maxWidth: '1000px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#0f172a',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                maxHeight: '65vh',
                backgroundColor: '#020617',
                position: 'relative',
              }}
            >
              <img
                src={currentLightboxItem.imageUrl}
                alt={currentLightboxItem.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '65vh',
                  objectFit: 'contain',
                }}
              />
            </div>

            {/* Lightbox Details */}
            <div style={{ padding: '20px 24px', backgroundColor: '#0f172a', color: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      backgroundColor: '#d91b5c',
                      color: '#FFFFFF',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    {currentLightboxItem.category}
                  </span>
                  {currentLightboxItem.eventName && (
                    <span style={{ fontSize: '0.82rem', color: '#93c5fd', fontWeight: 600 }}>
                      {currentLightboxItem.eventName}
                    </span>
                  )}
                </div>

                <a
                  href={currentLightboxItem.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#94a3b8',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                >
                  <span>Open Full Size</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px 0', color: '#f8fafc' }}>
                {currentLightboxItem.title}
              </h3>

              {currentLightboxItem.caption && (
                <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: 0, lineHeight: 1.5 }}>
                  {currentLightboxItem.caption}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {new Date(currentLightboxItem.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Photo {lightboxIndex + 1} of {filteredItems.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

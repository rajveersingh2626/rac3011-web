import { memo, useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { PAST_DRRS } from '../../data/districtData';
import type { PastDrr } from '../../data/districtData';
import { findPdrrPhoto, resolvePdrrPhotoUrl } from '../../data/pdrrImages';
import { getDrrCollages } from '../../data/drrCollages';
import { fetchPastDrrs } from '@/lib/publicApi/heritage';
import {
  Award,
  Calendar,
  MapPin,
  Search,
  User,
  Shield,
  RotateCw,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Layers,
  Sparkles,
} from 'lucide-react';

interface EraBadgeConfig {
  label: string;
  bg: string;
  border: string;
  textColor: string;
  shadow: string;
  pinColor: string;
}

interface DRRCardProps {
  drr: PastDrr;
  eraConfig: EraBadgeConfig;
  isCurrentDRR: boolean;
  initials: string;
  isMobile?: boolean;
}

const DRRCard = memo(function DRRCard({ drr, eraConfig, isCurrentDRR, initials, isMobile }: DRRCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(drr.photo || null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const collages = useMemo(() => getDrrCollages(drr.id), [drr.id]);
  const hasCollages = collages.length > 0;

  useEffect(() => {
    setCurrentSrc(drr.photo || null);
    setImgFailed(false);
  }, [drr.photo]);

  // Handle keyboard events for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowLeft' && collages.length > 1) {
        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : collages.length - 1));
      } else if (e.key === 'ArrowRight' && collages.length > 1) {
        setActiveImageIndex((prev) => (prev < collages.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isLightboxOpen, collages.length]);

  const handleImageError = () => {
    const localAsset = findPdrrPhoto(drr.name, drr.id);
    if (localAsset && currentSrc !== localAsset) {
      setCurrentSrc(localAsset);
    } else {
      setImgFailed(true);
    }
  };

  const nextImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveImageIndex((prev) => (prev < collages.length - 1 ? prev + 1 : 0));
    },
    [collages.length],
  );

  const prevImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : collages.length - 1));
    },
    [collages.length],
  );

  return (
    <>
      {/* 3D Perspective Card Container */}
      <div
        style={{
          perspective: '1400px',
          width: '100%',
          minHeight: isMobile ? '340px' : '480px',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            borderRadius: isMobile ? '16px' : '20px',
          }}
        >
          {/* ==================== FRONT FACE (DRR Profile) ==================== */}
          <div
            className={`rotaract-card ${isCurrentDRR ? 'current-drr-card' : ''}`}
            style={{
              width: '100%',
              height: '100%',
              padding: '0px',
              borderRadius: isMobile ? '16px' : '20px',
              overflow: 'hidden',
              border: isCurrentDRR
                ? '1.5px solid rgba(216, 27, 96, 0.45)'
                : isHovered
                ? '2px solid var(--rotaract-pink)'
                : '1px solid rgba(0, 0, 0, 0.08)',
              backgroundColor: '#FFFFFF',
              boxShadow: isCurrentDRR
                ? isHovered
                  ? '0 16px 40px rgba(216, 27, 96, 0.22), 0 0 0 1px rgba(216, 27, 96, 0.4)'
                  : '0 8px 28px rgba(216, 27, 96, 0.12), 0 0 0 1px rgba(216, 27, 96, 0.25)'
                : isHovered
                ? '0 20px 45px rgba(0, 0, 0, 0.22)'
                : '0 6px 20px rgba(0, 0, 0, 0.08)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {/* Photo or Themed Fallback Avatar - Clicking flips card to tenure glimpses */}
            <div
              onClick={() => {
                if (hasCollages) setIsFlipped(true);
              }}
              role={hasCollages ? 'button' : undefined}
              tabIndex={hasCollages ? 0 : undefined}
              onKeyDown={(e) => {
                if (hasCollages && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  setIsFlipped(true);
                }
              }}
              aria-label={hasCollages ? `View glimpses from ${drr.name}'s tenure` : undefined}
              title={hasCollages ? 'Click to view glimpses from tenure' : undefined}
              style={{
                width: '100%',
                height: isMobile ? '185px' : '310px',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#1E1E24',
                cursor: hasCollages ? 'pointer' : 'default',
              }}
            >
              {currentSrc && !imgFailed ? (
                <img
                  src={currentSrc}
                  alt={drr.name}
                  loading="lazy"
                  decoding="async"
                  onError={handleImageError}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center 18%',
                    transition: 'transform 0.4s ease',
                    transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background:
                      'linear-gradient(145deg, #1C1917 0%, #2A0818 45%, #880E4F 85%, #D81B60 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    padding: '24px',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      width: isMobile ? '64px' : '94px',
                      height: isMobile ? '64px' : '94px',
                      borderRadius: '50%',
                      background:
                        'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.08) 100%)',
                      border: '2px solid rgba(255, 224, 130, 0.65)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isMobile ? '1.4rem' : '2rem',
                      fontWeight: 900,
                      color: '#FFE082',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
                      marginBottom: isMobile ? '8px' : '14px',
                    }}
                  >
                    {initials}
                  </div>
                  <div
                    style={{
                      fontSize: isMobile ? '0.68rem' : '0.76rem',
                      color: '#FFE082',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                    }}
                  >
                    Archival Record
                  </div>
                </div>
              )}

              {/* Gradient overlay with tags */}
              {!isMobile && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, transparent 45%, rgba(0, 0, 0, 0.85) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '14px',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {isCurrentDRR ? (
                      <span
                        style={{
                          background: 'rgba(15, 23, 42, 0.9)',
                          color: '#FFFFFF',
                          padding: '4px 10px',
                          borderRadius: '100px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          border: '1px solid rgba(216, 27, 96, 0.45)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span className="live-indicator-dot" /> CURRENT DRR
                      </span>
                    ) : (
                      <span
                        style={{
                          background: eraConfig.bg,
                          color: eraConfig.textColor,
                          padding: '4px 10px',
                          borderRadius: '100px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <MapPin size={11} /> {eraConfig.label}
                      </span>
                    )}

                    <span
                      style={{
                        background: 'rgba(0, 0, 0, 0.65)',
                        color: '#F4F4F5',
                        padding: '2px 8px',
                        borderRadius: '100px',
                        fontSize: '0.70rem',
                        fontWeight: 700,
                      }}
                    >
                      #{drr.srNo}
                    </span>
                  </div>

                  <div>
                    <span
                      className="pill-gold"
                      style={{
                        fontSize: '0.75rem',
                        padding: '3px 8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <Calendar size={11} /> {drr.tenure}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Card Information Body */}
            <div
              style={{
                padding: isMobile ? '12px' : '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                justifyContent: 'space-between',
                backgroundColor: '#FFFFFF',
              }}
            >
              <div>
                {isMobile && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        color: isCurrentDRR ? '#D81B60' : eraConfig.pinColor,
                      }}
                    >
                      {eraConfig.label}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        color: '#71717A',
                        background: '#F4F4F5',
                        padding: '1px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      #{drr.srNo}
                    </span>
                  </div>
                )}
                <h3
                  style={{
                    fontSize: isMobile ? '0.96rem' : '1.20rem',
                    fontWeight: 900,
                    color: '#18181B',
                    lineHeight: 1.25,
                    margin: '0 0 3px 0',
                    letterSpacing: '-0.3px',
                  }}
                >
                  {drr.name}
                </h3>

                <div
                  style={{
                    fontSize: isMobile ? '0.72rem' : '0.82rem',
                    color: isCurrentDRR ? '#D81B60' : 'var(--rotaract-pink)',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '2px',
                  }}
                >
                  <Shield size={isMobile ? 12 : 13} />
                  {isMobile ? 'DRR' : 'District Rotaract Representative'}
                </div>

                {drr.homeClub && (
                  <div
                    style={{
                      fontSize: isMobile ? '0.68rem' : '0.76rem',
                      color: '#64748B',
                      fontWeight: 600,
                      marginTop: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {drr.homeClub}
                  </div>
                )}
              </div>

              {/* District & Tenure Footer */}
              <div
                style={{
                  marginTop: '12px',
                  paddingTop: '10px',
                  borderTop: '1px solid #F4F4F5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: isMobile ? '0.70rem' : '0.80rem',
                  color: '#52525B',
                }}
              >
                <span
                  style={{
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    color: isCurrentDRR ? '#D81B60' : eraConfig.pinColor,
                  }}
                >
                  <MapPin size={12} /> RID {drr.district}
                </span>

                <span
                  style={{
                    fontWeight: 800,
                    color: isCurrentDRR ? '#D81B60' : eraConfig.pinColor,
                    background: isCurrentDRR ? '#FFF0F5' : '#FAFAFA',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: isCurrentDRR
                      ? '1px solid rgba(216, 27, 96, 0.25)'
                      : '1px solid #E4E4E7',
                    fontSize: '0.74rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {drr.tenure}
                </span>
              </div>

              {/* Click to Flip Full Card Trigger */}
              {hasCollages && (
                <button
                  type="button"
                  onClick={() => setIsFlipped(true)}
                  style={{
                    marginTop: '10px',
                    width: '100%',
                    padding: '8px 0',
                    background: '#FDF2F7',
                    color: '#D81B60',
                    border: '1px dashed rgba(216, 27, 96, 0.35)',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FCE7F3';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FDF2F7';
                  }}
                >
                  <Sparkles size={12} /> View glimpses from their tenure
                </button>
              )}
            </div>
          </div>

          {/* ==================== BACK FACE (Collage Gallery) ==================== */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              borderRadius: isMobile ? '16px' : '20px',
              overflow: 'hidden',
              backgroundColor: '#111116',
              border: '2px solid rgba(216, 27, 96, 0.5)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            {/* Back Header */}
            <div
              style={{
                padding: '12px 14px',
                background: 'linear-gradient(180deg, #1C1D24 0%, #111116 100%)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ color: '#FFE082', fontSize: '0.72rem', fontWeight: 800 }}>
                  {drr.tenure} GALLERY
                </div>
                <div
                  style={{
                    color: '#FFFFFF',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    maxWidth: '140px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {drr.name}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {hasCollages && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLightboxOpen(true);
                    }}
                    title="Zoom in to cover screen"
                    style={{
                      background: 'rgba(216, 27, 96, 0.85)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 9px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    <Maximize2 size={13} />
                    <span>Zoom</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(false);
                  }}
                  title="Flip back to profile"
                  style={{
                    background: 'rgba(255, 255, 255, 0.14)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)';
                  }}
                >
                  <RotateCw size={13} />
                  <span>Profile</span>
                </button>
              </div>
            </div>

            {/* Collage Display Area */}
            <div
              style={{
                position: 'relative',
                flex: 1,
                minHeight: 0,
                backgroundColor: '#0A0A0D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                cursor: hasCollages ? 'pointer' : 'default',
              }}
              onClick={() => {
                if (hasCollages) setIsLightboxOpen(true);
              }}
            >
              {hasCollages ? (
                <>
                  <img
                    src={collages[activeImageIndex]}
                    alt={`${drr.name} collage ${activeImageIndex + 1}`}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />

                  {/* Left / Right Carousel Chevrons if multi-image */}
                  {collages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={prevImage}
                        title="Previous collage"
                        style={{
                          position: 'absolute',
                          left: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: '#FFFFFF',
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          zIndex: 5,
                        }}
                      >
                        <ChevronLeft size={18} />
                      </button>

                      <button
                        type="button"
                        onClick={nextImage}
                        title="Next collage"
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: '#FFFFFF',
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          zIndex: 5,
                        }}
                      >
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}

                  {/* Zoom indicator hover badge */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      background: 'rgba(0, 0, 0, 0.75)',
                      backdropFilter: 'blur(6px)',
                      color: '#FFFFFF',
                      padding: '4px 10px',
                      borderRadius: '100px',
                      fontSize: '0.70rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <ZoomIn size={12} />
                    <span>
                      {activeImageIndex + 1} / {collages.length} • Tap to Zoom
                    </span>
                  </div>
                </>
              ) : (
                <div
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    color: '#A1A1AA',
                  }}
                >
                  <Layers size={36} style={{ color: '#D81B60', marginBottom: '10px' }} />
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFFFFF' }}>
                    Archival Tenure Record
                  </div>
                  <p style={{ fontSize: '0.75rem', marginTop: '6px', color: '#71717A' }}>
                    Digital photo collages for RY {drr.year} are being digitized and preserved into
                    the heritage vault.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== FULLSCREEN ZOOM LIGHTBOX MODAL ==================== */}
      {isLightboxOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              backgroundColor: 'rgba(5, 5, 8, 0.96)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: isMobile ? '12px' : '24px',
              boxSizing: 'border-box',
              animation: 'fadeIn 0.25s ease-out',
            }}
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Modal Top Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#FFFFFF',
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div style={{ color: '#FFE082', fontSize: '0.85rem', fontWeight: 800 }}>
                  {drr.tenure} • RID {drr.district}
                </div>
                <h2 style={{ fontSize: isMobile ? '1.1rem' : '1.5rem', fontWeight: 900, margin: '2px 0 0 0' }}>
                  {drr.name}
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#F4F4F5',
                    padding: '4px 12px',
                    borderRadius: '100px',
                    fontSize: '0.80rem',
                    fontWeight: 800,
                  }}
                >
                  {activeImageIndex + 1} of {collages.length}
                </span>

                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(false)}
                  title="Close (Esc)"
                  style={{
                    background: 'rgba(216, 27, 96, 0.9)',
                    border: 'none',
                    color: '#FFFFFF',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(216, 27, 96, 0.4)',
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Image Stage */}
            <div
              style={{
                position: 'relative',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '16px 0',
                maxHeight: 'calc(100vh - 160px)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {collages.length > 1 && (
                <button
                  type="button"
                  onClick={prevImage}
                  style={{
                    position: 'absolute',
                    left: isMobile ? '4px' : '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(20, 20, 26, 0.85)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: '50%',
                    width: isMobile ? '40px' : '52px',
                    height: isMobile ? '40px' : '52px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                  }}
                >
                  <ChevronLeft size={isMobile ? 22 : 28} />
                </button>
              )}

              <img
                src={collages[activeImageIndex]}
                alt={`${drr.name} collage ${activeImageIndex + 1}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
                }}
              />

              {collages.length > 1 && (
                <button
                  type="button"
                  onClick={nextImage}
                  style={{
                    position: 'absolute',
                    right: isMobile ? '4px' : '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(20, 20, 26, 0.85)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: '50%',
                    width: isMobile ? '40px' : '52px',
                    height: isMobile ? '40px' : '52px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                  }}
                >
                  <ChevronRight size={isMobile ? 22 : 28} />
                </button>
              )}
            </div>

            {/* Modal Bottom Filmstrip */}
            {collages.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  overflowX: 'auto',
                  padding: '6px 0',
                  maxWidth: '100%',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {collages.map((colUrl, idx) => (
                  <button
                    key={colUrl}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: isMobile ? '38px' : '52px',
                      height: isMobile ? '38px' : '52px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      padding: 0,
                      border:
                        idx === activeImageIndex
                          ? '2px solid #D81B60'
                          : '1px solid rgba(255, 255, 255, 0.2)',
                      opacity: idx === activeImageIndex ? 1 : 0.5,
                      cursor: 'pointer',
                      background: '#000',
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={colUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>,
          document.body,
        )}
    </>
  );
});

export type PastDRRShowcaseProps = Record<string, never>;

export default function PastDRRShowcase() {
  const [selectedEra, setSelectedEra] = useState('all'); // 'all' | '3011' | '3010' | '301'
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pastDrrQuery = useQuery({
    queryKey: ['public', 'past-drrs'],
    queryFn: fetchPastDrrs,
    staleTime: 30 * 1000,
    refetchOnMount: 'always',
  });

  const drrList = useMemo<PastDrr[]>(() => {
    const clean = (s: string) =>
      s.replace(/^(Rtn\.|Rtr\.|PDRR\s*|DRR\s*)+/gi, '').toLowerCase().replace(/[^a-z0-9]/g, '');

    if (!pastDrrQuery.data?.items || pastDrrQuery.data.items.length === 0) {
      return PAST_DRRS.map((drr) => {
        const photo = resolvePdrrPhotoUrl(drr.photo, drr.name, drr.id);
        return {
          ...drr,
          photo: photo || '',
          hasPhoto: Boolean(photo),
        };
      });
    }

    const matchedLiveIds = new Set<string>();
    const mapped = PAST_DRRS.map((localDrr) => {
      const localClean = clean(localDrr.name);
      const live = pastDrrQuery.data.items.find((p) => {
        if (matchedLiveIds.has(p.id)) return false;
        const pClean = clean(p.name);
        const pSlugClean = clean(p.slug || '');
        const nameMatch = (
          p.id === localDrr.id ||
          pClean === localClean ||
          (pSlugClean && pSlugClean === localClean) ||
          p.name.trim().toLowerCase() === localDrr.name.trim().toLowerCase()
        );
        if (!nameMatch) return false;
        // If multiple entries have the same name, prefer the one with matching term/year
        if (p.terms && p.terms.length > 0) {
          return p.terms.includes(localDrr.year) || p.terms[0] === localDrr.year;
        }
        return true;
      }) || pastDrrQuery.data.items.find((p) => {
        if (matchedLiveIds.has(p.id)) return false;
        const pClean = clean(p.name);
        return pClean === localClean || p.name.trim().toLowerCase() === localDrr.name.trim().toLowerCase();
      });

      if (!live) {
        const photo = resolvePdrrPhotoUrl(localDrr.photo, localDrr.name, localDrr.id);
        return {
          ...localDrr,
          photo: photo || '',
          hasPhoto: Boolean(photo),
        };
      }

      matchedLiveIds.add(live.id);
      const photo = resolvePdrrPhotoUrl(live.photoUrl, live.name, live.slug) || resolvePdrrPhotoUrl(localDrr.photo, localDrr.name, localDrr.id);
      const matchedYear = live.terms?.find((t) => t === localDrr.year) || localDrr.year || live.terms?.[0];
      return {
        ...localDrr,
        name: live.name || localDrr.name,
        photo: photo || '',
        hasPhoto: Boolean(photo),
        year: matchedYear,
        tenure: `RY ${matchedYear}`,
      };
    });

    const unmappedLive = pastDrrQuery.data.items.filter((p) => !matchedLiveIds.has(p.id));
    const extraLive: PastDrr[] = unmappedLive.map((live, idx) => {
      const yearStr = live.terms?.[0] || '2026-27';
      const tenureStr = live.terms?.[0] ? `RY ${live.terms[0]}` : 'RY 2026-27';
      const photo = resolvePdrrPhotoUrl(live.photoUrl, live.name, live.slug);
      return {
        id: live.id,
        srNo: PAST_DRRS.length + idx + 1,
        year: yearStr,
        tenure: tenureStr,
        name: live.name,
        district: '3011',
        districtEra: 'District 3011',
        homeClub: 'Rotaract District Organization 3011',
        photo: photo || '',
        hasPhoto: Boolean(photo),
      };
    });

    return [...mapped, ...extraLive];
  }, [pastDrrQuery.data]);

  // Filtered DRRs
  const filteredDRRs = useMemo(() => {
    return drrList.filter(drr => {
      const matchesEra = selectedEra === 'all' || drr.district === selectedEra;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        drr.name.toLowerCase().includes(query) || 
        drr.year.toLowerCase().includes(query) ||
        drr.district.includes(query) ||
        (drr.homeClub && drr.homeClub.toLowerCase().includes(query));
      return matchesEra && matchesSearch;
    });
  }, [drrList, selectedEra, searchQuery]);

  // Era statistics
  const counts = useMemo(() => ({
    all: drrList.length,
    '3011': drrList.filter(d => d.district === '3011').length,
    '3010': drrList.filter(d => d.district === '3010').length,
    '301': drrList.filter(d => d.district === '301').length,
  }), [drrList]);

  // Helpers for styling based on district era
  const getEraBadgeConfig = (district: string): EraBadgeConfig => {
    switch (district) {
      case '3011':
        return {
          label: 'District 3011',
          bg: 'linear-gradient(135deg, #D81B60 0%, #AD1457 100%)',
          border: 'rgba(216, 27, 96, 0.4)',
          textColor: '#FFFFFF',
          shadow: '0 4px 14px rgba(216, 27, 96, 0.35)',
          pinColor: '#D81B60'
        };
      case '3010':
        return {
          label: 'District 3010',
          bg: 'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)',
          border: 'rgba(30, 58, 138, 0.4)',
          textColor: '#FFFFFF',
          shadow: '0 4px 14px rgba(30, 58, 138, 0.35)',
          pinColor: '#1E3A8A'
        };
      case '301':
        return {
          label: 'District 301',
          bg: 'linear-gradient(135deg, #065F46 0%, #064E3B 100%)',
          border: 'rgba(6, 95, 70, 0.4)',
          textColor: '#FFFFFF',
          shadow: '0 4px 14px rgba(6, 95, 70, 0.35)',
          pinColor: '#065F46'
        };
      default:
        return {
          label: `District ${district}`,
          bg: '#D81B60',
          border: '#D81B60',
          textColor: '#FFFFFF',
          shadow: 'none',
          pinColor: '#D81B60'
        };
    }
  };

  const getInitials = (name: string) => {
    const clean = name.replace(/^(Rtn\.|Rtr\.|PDRR|\s+)+/gi, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (clean.slice(0, 2) || 'DR').toUpperCase();
  };

  return (
    <div style={{ marginTop: '10px', color: '#FFFFFF' }}>
      
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: isMobile ? '20px' : '32px' }}>
        <span className="pill-gold" style={{ marginBottom: isMobile ? '8px' : '14px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: isMobile ? '0.74rem' : '0.82rem' }}>
          <Award size={14} /> COUNCIL OF DRRs
        </span>
        <h1 style={{ fontSize: isMobile ? 'clamp(1.8rem, 5vw, 2.5rem)' : '2.8rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px', margin: '4px 0 10px 0' }}>
          Council of DRRs
        </h1>
        <p style={{ color: '#FCE4EC', fontSize: isMobile ? '0.92rem' : '1.1rem', maxWidth: '760px', margin: '0 auto', lineHeight: 1.55 }}>
          Honoring four decades of visionary leadership, selfless service, and transformative impact across our District.
        </p>
      </div>

      {/* Filter Bar & Search */}
      <div 
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: isMobile ? '12px' : '16px',
          marginBottom: isMobile ? '20px' : '32px',
          background: '#FFFFFF',
          padding: isMobile ? '12px 14px' : '14px 20px',
          borderRadius: isMobile ? '16px' : '16px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)'
        }}
      >
        {/* Era Filter Buttons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: isMobile ? 'nowrap' : 'wrap',
          overflowX: isMobile ? 'auto' : 'visible',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: isMobile ? '4px' : '0',
          scrollbarWidth: 'none'
        }}>
          {[
            { id: 'all', label: `Council of DRRs (${counts.all})`, color: 'var(--rotaract-pink)' },
            { id: '3011', label: `District 3011 (${counts['3011']})`, color: '#D81B60' },
            { id: '3010', label: `District 3010 (${counts['3010']})`, color: '#1E3A8A' },
            { id: '301', label: `District 301 (${counts['301']})`, color: '#065F46' }
          ].map(era => {
            const isActive = selectedEra === era.id;
            return (
              <button
                key={era.id}
                onClick={() => setSelectedEra(era.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  minHeight: '44px',
                  padding: isMobile ? '8px 14px' : '8px 16px',
                  borderRadius: '10px',
                  border: isActive ? `2px solid ${era.color}` : '1px solid #E4E4E7',
                  background: isActive ? era.color : '#F4F4F5',
                  color: isActive ? '#FFFFFF' : '#3F3F46',
                  fontSize: isMobile ? '0.78rem' : '0.84rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? `0 4px 14px ${era.color}40` : 'none'
                }}
              >
                <MapPin size={13} style={{ opacity: isActive ? 1 : 0.6 }} />
                {era.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div 
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            minWidth: isMobile ? '100%' : '260px',
            flex: isMobile ? 'none' : '1 1 260px',
            maxWidth: isMobile ? '100%' : '380px'
          }}
        >
          <Search size={16} style={{ position: 'absolute', left: '12px', color: '#71717A' }} />
          <input
            type="text"
            placeholder="Search by DRR name or year..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 14px 9px 38px',
              borderRadius: '10px',
              border: '1.5px solid #E4E4E7',
              fontSize: '0.88rem',
              outline: 'none',
              color: '#18181B',
              fontWeight: 600,
              background: '#FAFAFA',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* DRR Grid */}
      {filteredDRRs.length === 0 ? (
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '60px 20px',
            textAlign: 'center',
            color: '#52525B'
          }}
        >
          <User size={48} style={{ color: 'var(--rotaract-pink)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#18181B' }}>No DRR Records Found</h3>
          <p style={{ fontSize: '0.95rem', color: '#71717A', marginTop: '6px' }}>
            No leader matched your current filter or search criteria.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: isMobile ? '12px' : '26px' }}>
          {filteredDRRs.map((drr) => {
            const isCurrentDRR = drr.year === '2026-27' || drr.name.toLowerCase().includes('archit');
            const eraConfig = getEraBadgeConfig(drr.district);
            return (
              <DRRCard
                key={drr.id}
                drr={drr}
                eraConfig={eraConfig}
                isCurrentDRR={isCurrentDRR}
                initials={getInitials(drr.name)}
                isMobile={isMobile}
              />
            );
          })}
        </div>
      )}

      {/* Bottom Summary Counter */}
      <div 
        style={{
          marginTop: '45px',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.85)',
          fontSize: '0.9rem',
          fontWeight: 600
        }}
      >
        Preserving the 40+ year legacy of leadership across Rotary International Districts 301, 3010, and 3011.
      </div>

    </div>
  );
}

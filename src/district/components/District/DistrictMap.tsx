import { useState, useEffect, useRef, useMemo } from 'react';
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';
import L from 'leaflet';
import type { Map as LeafletMap, Marker as LeafletMarker, LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  User, 
  X, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Search, 
  CheckCircle2, 
  Award,
  Globe,
  Layers,
  Phone,
  Mail,
  UserCheck,
  Map as MapIcon,
  LayoutGrid,
  MapPin,
  Sparkles
} from 'lucide-react';
import { useDistrictClubs, useZoneNames, type DistrictClubLive } from '../../hooks/useDistrictClubs';

type MapClub = DistrictClubLive;

interface RegionalZone {
  id: string;
  name: string;
  hindiName: string;
  zoneNumber: string;
  zrr: string;
  zrs: string;
  color: string;
  fillColor: string;
  center: [number, number];
  polygon: [number, number][];
}

// Not exported: the source exported this const but nothing ever imported it (App.jsx uses the
// districtData copy), and exporting non-component values here trips
// react-refresh/only-export-components. Zone polygons and colours are presentation constants,
// so they stay in code; only the zone names/ids come from the API.
const isRealSecretary = (sec: string | null | undefined): boolean => {
  if (!sec) return false;
  const s = sec.trim().toLowerCase();
  return Boolean(
    s &&
    s !== 'n/a' &&
    s !== 'rtr. club secretary' &&
    s !== 'club secretary' &&
    s !== 'null' &&
    s !== 'undefined' &&
    s !== '-' &&
    s !== 'none'
  );
};

const REGIONAL_ZONES: RegionalZone[] = [
  {
    id: 'zone-prithvi',
    name: 'Zone Prithvi',
    hindiName: 'पृथ्वी',
    zoneNumber: 'Zone 1 & 5',
    zrr: 'Rtn. Rtr. Kanav Sachdeva',
    zrs: 'Rtr. Hitaishi Chawla',
    color: '#10b981',
    fillColor: '#10b981',
    center: [28.5350, 77.2350],
    polygon: [
      [28.6000, 77.1600],
      [28.6000, 77.3800],
      [28.2500, 77.3800],
      [28.2500, 77.0500],
      [28.4500, 77.0500],
      [28.5000, 77.1600]
    ]
  },
  {
    id: 'zone-agni',
    name: 'Zone Agni',
    hindiName: 'अग्नि',
    zoneNumber: 'Zone 2 & 6',
    zrr: 'Rtr. Dhruv Kumar Jha',
    zrs: 'Rtr. Kartik Kumar',
    color: '#E11D48',
    fillColor: '#E11D48',
    center: [28.6250, 77.2150],
    polygon: [
      [28.7200, 77.1500],
      [28.7200, 77.3400],
      [28.5800, 77.3400],
      [28.5800, 77.2200],
      [28.3200, 77.3500],
      [28.3200, 77.1500],
      [28.5500, 77.1500]
    ]
  },
  {
    id: 'zone-vayu',
    name: 'Zone Vayu',
    hindiName: 'वायु',
    zoneNumber: 'Zone 3 & 7',
    zrr: 'Rtr. Tanishaa Sonker',
    zrs: 'Rtr. Pratham Girdhar',
    color: '#0284c7',
    fillColor: '#0284c7',
    center: [28.6850, 77.1650],
    polygon: [
      [28.7800, 77.0000],
      [28.7800, 77.2000],
      [28.6200, 77.2000],
      [28.5800, 77.0500],
      [28.4200, 77.0500],
      [28.4200, 76.9500],
      [28.6500, 76.9500]
    ]
  },
  {
    id: 'zone-akash',
    name: 'Zone Akash',
    hindiName: 'आकाश',
    zoneNumber: 'Zone 4 & 8',
    zrr: 'Rtr. Palak Jain',
    zrs: 'Rtr. Arjun Pratap Singh',
    color: '#4F46E5',
    fillColor: '#4F46E5',
    center: [28.6150, 77.0850],
    polygon: [
      [28.7200, 76.9000],
      [28.7200, 77.1200],
      [28.5800, 77.1200],
      [28.5200, 76.9800],
      [28.3000, 76.9800],
      [28.3000, 76.8500],
      [28.5500, 76.8500]
    ]
  }
];

type LeafletApi = typeof L;

// Bulletproof Leaflet instance resolver across Vite ESM, CommonJS, and window.L
const getLeaflet = (): LeafletApi | null => {
  const globalL = typeof window !== 'undefined'
    ? (window as unknown as { L?: LeafletApi }).L
    : undefined;
  if (globalL && typeof globalL.map === 'function') {
    return globalL;
  }
  if (L && typeof L.map === 'function') {
    return L;
  }
  const interopDefault = (L as unknown as { default?: LeafletApi } | undefined)?.default;
  if (interopDefault && typeof interopDefault.map === 'function') {
    return interopDefault;
  }
  return null;
};

interface DistrictMapProps {
  clubs?: MapClub[];
  selectedClubId?: string | null;
  onSelectClub?: (clubId: string | null) => void;
  onOpenPostInitiativeModal?: (clubId: string) => void;
  // Passed by DistrictAccess but unused by this component (as in the source JSX).
  isLoggedIn?: unknown;
  userRole?: unknown;
  onOpenLoginModal?: unknown;
  onOpenUploadClubModal?: unknown;
}

export default function DistrictMap({ clubs = [], selectedClubId, onSelectClub, onOpenPostInitiativeModal }: DistrictMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);

  // Same query key as `DistrictApp`, so TanStack serves both from one fetch.
  const { clubs: rosterClubs, isLive } = useDistrictClubs();
  const zoneNameById = useZoneNames();
  const activeClubs: MapClub[] = clubs && clubs.length > 0 ? clubs : rosterClubs;

  const getClubZoneString = (c: MapClub | null | undefined): string => {
    if (!c) return '';
    let z: unknown = c.zone ?? c.zoneId ?? c.zoneName ?? '';
    if (typeof z === 'object' && z !== null) {
      const zObj = z as { name?: string; id?: string; title?: string };
      z = zObj.name ?? zObj.id ?? zObj.title ?? '';
    }
    const raw = String(z).trim();
    if (zoneNameById[raw]) {
      return zoneNameById[raw].toLowerCase();
    }
    return raw.toLowerCase();
  };

  const clubMatchesZone = (c: MapClub | null | undefined, zoneId: string | null): boolean => {
    if (!zoneId) return true;
    const z = getClubZoneString(c);
    const zid = c?.zoneId || '';
    if (zoneId === 'zone-prithvi') {
      return z.includes('prithvi') || z.includes('south') || z === '1' || z === 'zone 1' || z === '5' || z === 'zone 5' || zid === 'cmtn8hw19001ill1sl3gxhvjc' || zid === 'cmtn8hw0y001dll1sbp1tvm6i';
    }
    if (zoneId === 'zone-agni') {
      return z.includes('agni') || z.includes('central') || z.includes('faridabad') || z === '2' || z === 'zone 2' || z === '6' || z === 'zone 6' || zid === 'cmtn8hw17001hll1sgpqjgrai' || zid === 'cmtn8hw12001ell1sdyds6zsz';
    }
    if (zoneId === 'zone-vayu') {
      return z.includes('vayu') || z.includes('north') || z.includes('gurugram') || z === '3' || z === 'zone 3' || z === '7' || z === 'zone 7' || zid === 'cmtn8hw1b001jll1sidh151lv' || zid === 'cmtn8hw14001fll1s69dnbafe';
    }
    if (zoneId === 'zone-akash') {
      return z.includes('akash') || z.includes('west') || z === '4' || z === 'zone 4' || z === '8' || z === 'zone 8' || zid === 'cmtn8hw1d001kll1soabcfcmd' || zid === 'cmtn8hw16001gll1sqctt3qv7';
    }
    return true;
  };

  const getClubNeonColor = (club: MapClub): string => {
    const z = getClubZoneString(club);
    if (z.includes('prithvi') || z === 'zone 1' || z === '1' || z.includes('south')) return '#10b981'; // Emerald Green (Prithvi)
    if (z.includes('agni') || z === 'zone 2' || z === '2' || z.includes('central') || z.includes('faridabad')) return '#E11D48'; // Fire Crimson (Agni)
    if (z.includes('vayu') || z === 'zone 3' || z === '3' || z.includes('north') || z.includes('gurugram')) return '#0284c7'; // Sky / Cyan Blue (Vayu)
    if (z.includes('akash') || z === 'zone 4' || z === '4' || z.includes('west')) return '#4F46E5'; // Cosmic Indigo (Akash)
    return '#D81B60';
  };

  const [hoveredClub, setHoveredClub] = useState<MapClub | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number; transform: string }>({ x: 0, y: 0, transform: 'translate(-50%, -100%)' });
  const [activeSlideoutClub, setActiveSlideoutClub] = useState<MapClub | null>(null);
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'cards'>('map');

  const filteredClubs = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return activeClubs.filter((c) => {
      const matchesSearch = !query || 
        (c.name || '').toLowerCase().includes(query) || 
        (c.president || '').toLowerCase().includes(query) ||
        (c.shortName || '').toLowerCase().includes(query) ||
        (c.location || '').toLowerCase().includes(query) ||
        (c.address || '').toLowerCase().includes(query);
      const matchesZone = clubMatchesZone(c, activeZoneId);
      return matchesSearch && matchesZone;
    });
  }, [activeClubs, searchQuery, activeZoneId]);

  const updateTooltipPos = (clientX: number, clientY: number) => {
    const tooltipWidth = 320;
    const padding = 20;
    let x = clientX;
    let y = clientY - 16;
    let transform = 'translate(-50%, -100%)';

    // Horizontal clamping: ensure tooltip never overflows left or right edges of viewport
    if (x - tooltipWidth / 2 < padding) {
      x = padding;
      transform = 'translate(0%, -100%)';
    } else if (x + tooltipWidth / 2 > window.innerWidth - padding) {
      x = window.innerWidth - padding;
      transform = 'translate(-100%, -100%)';
    }

    // Vertical clamping: if cursor is near top of screen (e.g. y < 200px), flip below cursor
    if (clientY < 200) {
      y = clientY + 24;
      transform = transform.replace('-100%)', '0%)');
    }

    setTooltipPos({ x, y, transform });
  };

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    updateTooltipPos(e.clientX, e.clientY);
  };

  useEffect(() => {
    if (selectedClubId) {
      const found = activeClubs.find(c => c.id === selectedClubId);
      if (found) setActiveSlideoutClub(found);
    } else {
      setActiveSlideoutClub(null);
    }
  }, [selectedClubId, activeClubs]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const Leaflet = getLeaflet();
    if (!Leaflet || typeof Leaflet.map !== 'function') return;

    // Safely remove any existing map instance and clear container
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch { /* ignore */ }
      mapInstanceRef.current = null;
    }
    if (mapContainerRef.current) {
      (mapContainerRef.current as HTMLDivElement & { _leaflet_id?: number | null })._leaflet_id = null;
      mapContainerRef.current.innerHTML = '';
    }

    const map = Leaflet.map(mapContainerRef.current, {
      center: [28.6050, 77.1800],
      zoom: 12,
      scrollWheelZoom: true,
      zoomControl: false
    });

    mapInstanceRef.current = map;

    Leaflet.control.zoom({ position: 'topright' }).addTo(map);

    // Highly reliable, globally fast, 100% CSP-compliant OpenStreetMap tiles
    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    renderLeafletMarkers(Leaflet, map, activeClubs);

    // Dynamic resize observer guarantees tiles render without requiring manual window resize
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    const resizeTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      clearTimeout(resizeTimer);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch { /* ignore */ }
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const Leaflet = getLeaflet();
    if (mapInstanceRef.current && Leaflet) {
      renderLeafletMarkers(Leaflet, mapInstanceRef.current, activeClubs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClubs, searchQuery, activeZoneId]);

  const renderLeafletMarkers = (Leaflet: LeafletApi | null, map: LeafletMap | null, clubsList: MapClub[]) => {
    if (!Leaflet || !map || !Array.isArray(clubsList)) return;

    // 1. Clear previous markers
    markersRef.current.forEach(m => {
      try { m.remove(); } catch { /* ignore */ }
    });
    markersRef.current = [];

    const query = (searchQuery || '').toLowerCase().trim();

    // 2. Filter and render club markers (All zone polygon boxes completely removed)
    const filtered = clubsList.filter(c => {
      if (!c) return false;
      const matchesSearch = !query || 
        (c.name || '').toLowerCase().includes(query) || 
        (c.president || '').toLowerCase().includes(query) ||
        (c.shortName || '').toLowerCase().includes(query);
      const matchesZone = clubMatchesZone(c, activeZoneId);
      return matchesSearch && matchesZone;
    });

    const coordCounts: Record<string, number> = {};

    filtered.forEach((club) => {
      let lat = typeof club.lat === 'number' && !isNaN(club.lat) ? club.lat : 28.5800;
      let lng = typeof club.lng === 'number' && !isNaN(club.lng) ? club.lng : 77.1025;

      // Smart coordinate dispersion so close pins don't overlap
      const key = `${lat.toFixed(3)}_${lng.toFixed(3)}`;
      if (coordCounts[key]) {
        const count = coordCounts[key];
        const angle = (count * 60) * (Math.PI / 180);
        const radius = 0.0095 * Math.ceil(count / 4);
        lat += Math.sin(angle) * radius;
        lng += Math.cos(angle) * radius;
        coordCounts[key] = count + 1;
      } else {
        coordCounts[key] = 1;
      }

      // Color-code each pin dynamically based on its official regional zone
      const neonColor = getClubNeonColor(club);

      const displayName = (club.shortName || club.name || 'Club').replace(/^RAC\s+/i, '');
      const isActive = selectedClubId === club.id || activeSlideoutClub?.id === club.id;

      const customIcon = Leaflet.divIcon({
        className: `leaflet-neon-marker ${isActive ? 'active-marker' : ''}`,
        html: `
          <div class="neon-marker-container">
            <div class="neon-marker-core" style="background-color: ${neonColor}; box-shadow: 0 0 14px ${neonColor};"></div>
            <div class="neon-marker-pulse" style="border: 2px solid ${neonColor};"></div>
            <div class="neon-marker-label" style="border: 1.5px solid ${neonColor}; background: #FFFFFF; color: #0F172A; font-weight: 800;">
              ${displayName}
            </div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = Leaflet.marker([lat, lng], { icon: customIcon }).addTo(map);

      marker.on('mouseover', (e: LeafletMouseEvent) => {
        setHoveredClub(club);
        if (e && e.originalEvent) {
          updateTooltipPos(e.originalEvent.clientX, e.originalEvent.clientY);
        }
      });
      marker.on('mousemove', (e: LeafletMouseEvent) => {
        if (e && e.originalEvent) {
          updateTooltipPos(e.originalEvent.clientX, e.originalEvent.clientY);
        }
      });
      marker.on('mouseout', () => setHoveredClub(null));
      marker.on('click', () => {
        setActiveSlideoutClub(club);
        if (onSelectClub) onSelectClub(club.id);
        map.flyTo([lat, lng], 13.5, { duration: 1.2 });
      });

      markersRef.current.push(marker);
    });
  };

  const handleZoneSelect = (zoneId: string | null) => {
    if (activeZoneId === zoneId) {
      setActiveZoneId(null);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([28.6050, 77.1800], 12, { duration: 1.2 });
      }
    } else {
      setActiveZoneId(zoneId);
      const zoneObj = REGIONAL_ZONES.find(z => z.id === zoneId);
      if (zoneObj && mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(zoneObj.center, 12.8, { duration: 1.2 });
      }
    }
  };

  const activeZoneObj = REGIONAL_ZONES.find(z => z.id === activeZoneId);

  return (
    <div 
      id="district-map-section"
      onMouseMove={handleMouseMove}
      style={{
        position: isFullScreen ? 'fixed' : 'relative',
        inset: isFullScreen ? 0 : 'auto',
        zIndex: isFullScreen ? 99999 : 1,
        width: '100%',
        height: isFullScreen ? '100vh' : 'calc(100vh - 72px)',
        minHeight: isFullScreen ? '100vh' : '780px',
        backgroundColor: '#FDF8FA',
        borderRadius: '0px',
        overflow: 'hidden',
        border: 'none',
        boxShadow: 'none',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Top Floating View Mode Switcher */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '24px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '10px',
            padding: '4px',
            border: '1.5px solid rgba(216, 27, 96, 0.25)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}
        >
          <button
            onClick={() => setViewMode('map')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: viewMode === 'map' ? 'var(--rotaract-pink)' : 'transparent',
              color: viewMode === 'map' ? '#FFFFFF' : '#1E1E24',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <MapIcon size={15} /> Map View
          </button>
          <button
            onClick={() => setViewMode('cards')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: viewMode === 'cards' ? 'var(--rotaract-pink)' : 'transparent',
              color: viewMode === 'cards' ? '#FFFFFF' : '#1E1E24',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <LayoutGrid size={15} /> Tile / Cards View
          </button>
        </div>
      </div>

      {/* Map View Canvas */}
      <div 
        ref={mapContainerRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          position: 'absolute', 
          inset: 0, 
          zIndex: 1,
          display: viewMode === 'map' ? 'block' : 'none'
        }}
      />

      {/* Tiles / Cards View Grid */}
      {viewMode === 'cards' && (
        <div 
          style={{ 
            position: 'absolute', 
            inset: 0, 
            zIndex: 1, 
            overflowY: 'auto', 
            padding: '90px 24px 100px 24px',
            backgroundColor: '#FAF5F7'
          }}
        >
          <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1E1E24', margin: '0 0 4px 0' }}>
                  Directory of Rotaract Clubs (District 3011)
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, fontWeight: 600 }}>
                  Showing {filteredClubs.length} verified clubs across Delhi NCR • Click any card for official club details and leadership contact
                </p>
              </div>
            </div>

            {filteredClubs.length === 0 ? (
              <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '60px 24px', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
                <Sparkles size={48} style={{ color: 'var(--rotaract-pink)', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E1E24', marginBottom: '8px' }}>
                  No clubs found matching "{searchQuery}"
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 16px' }}>
                  Try resetting your search query or selecting "All Zones" to view all active clubs.
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveZoneId(null); }}
                  className="btn-rotaract"
                  style={{ padding: '8px 20px', fontSize: '0.84rem' }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                {filteredClubs.map((club: MapClub) => {
                  const neonColor = getClubNeonColor(club);
                  const hasSecretary = isRealSecretary(club.secretary);
                  return (
                    <div
                      key={club.id}
                      onClick={() => {
                        setActiveSlideoutClub(club);
                        if (onSelectClub) onSelectClub(club.id);
                      }}
                      className="rotaract-card"
                      style={{
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        padding: '20px 22px',
                        border: `1.5px solid ${neonColor}35`,
                        boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'all 0.22s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = neonColor;
                        e.currentTarget.style.boxShadow = `0 12px 28px ${neonColor}25`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = `${neonColor}35`;
                        e.currentTarget.style.boxShadow = '0 4px 18px rgba(0,0,0,0.04)';
                      }}
                    >
                      <div>
                        {/* Zone Badge & Rotary ID */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '3px 10px',
                              borderRadius: '100px',
                              background: `${neonColor}15`,
                              border: `1px solid ${neonColor}40`,
                              color: neonColor,
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              textTransform: 'uppercase'
                            }}
                          >
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: neonColor }} />
                            {club.zone || 'District 3011'}
                          </span>

                          {club.rotaryId && club.rotaryId !== 'N/A' && (
                            <span style={{ fontSize: '0.70rem', color: '#71717A', fontWeight: 700, background: '#F4F4F5', padding: '2px 8px', borderRadius: '6px' }}>
                              ID: {club.rotaryId}
                            </span>
                          )}
                        </div>

                        {/* Club Name */}
                        <h4 style={{ fontSize: '1.08rem', fontWeight: 900, color: '#0F172A', margin: '0 0 10px 0', lineHeight: 1.35 }}>
                          {club.name}
                        </h4>

                        {/* Location / Address */}
                        {(club.address || club.location) && (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.78rem', color: '#64748B', marginBottom: '12px', fontWeight: 600 }}>
                            <MapPin size={13} style={{ color: neonColor, flexShrink: 0, marginTop: '2px' }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              {club.address || club.location}
                            </span>
                          </div>
                        )}

                        {/* Leadership */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#334155', fontWeight: 700, background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <User size={13} style={{ color: 'var(--rotaract-pink)', flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              Pres: <strong>{club.president || 'Rtr. Club President'}</strong>
                            </span>
                          </div>

                          {/* Only render secretary if present */}
                          {hasSecretary && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <UserCheck size={13} style={{ color: '#059669', flexShrink: 0 }} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                Sec: <strong>{club.secretary}</strong>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer: Charter year & View Details button */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #F1F5F9', fontSize: '0.76rem' }}>
                        <span style={{ color: '#94A3B8', fontWeight: 700 }}>
                          {club.charterYear ? `Chartered ${club.charterYear}` : 'Verified Club'}
                        </span>
                        <span style={{ color: 'var(--rotaract-pink)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          View Details <ChevronRight size={13} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Active Zone ZRR / ZRS Info Box (Top Left) */}
      {activeZoneObj && (
        <div
          style={{
            position: 'absolute',
            top: '84px',
            left: '24px',
            zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `2px solid ${activeZoneObj.color}`,
            borderRadius: '12px',
            padding: '16px 20px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.14)',
            minWidth: '260px',
            maxWidth: '320px',
            pointerEvents: 'auto'
          } as CSSProperties}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: activeZoneObj.color,
                  boxShadow: `0 0 10px ${activeZoneObj.color}`
                }}
              />
              <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 900, color: '#0F172A', letterSpacing: '0.2px' }}>
                {activeZoneObj.name} ({activeZoneObj.hindiName})
              </h3>
            </div>
            <button
              onClick={() => handleZoneSelect(activeZoneObj.id)}
              style={{
                background: 'rgba(0,0,0,0.05)',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              title="Close Zone Info"
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: '#334155', fontWeight: 700 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={15} style={{ color: activeZoneObj.color, flexShrink: 0 }} />
              <span>ZRR: <strong>{activeZoneObj.zrr}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={15} style={{ color: activeZoneObj.color, flexShrink: 0 }} />
              <span>ZRS: <strong>{activeZoneObj.zrs}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
              <Layers size={15} style={{ color: activeZoneObj.color, flexShrink: 0 }} />
              <span>Active Clubs: <strong>{activeClubs.filter(c => clubMatchesZone(c, activeZoneObj.id)).length} Clubs</strong></span>
            </div>
          </div>
        </div>
      )}



      <div 
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          zIndex: 1000,
          pointerEvents: 'none',
          flexWrap: 'wrap'
        }}
      >
        <div 
          style={{
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(216, 27, 96, 0.2)',
            padding: '12px 24px',
            borderRadius: '8px',
            color: '#1E1E24',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
            pointerEvents: 'auto'
          } as CSSProperties}
        >
          <div 
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: activeZoneObj ? activeZoneObj.color : '#D81B60',
              boxShadow: `0 0 12px ${activeZoneObj ? activeZoneObj.color : '#D81B60'}`,
              animation: 'neonPulse 1.8s infinite ease-in-out'
            }}
          />
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 900, letterSpacing: '0.5px', color: '#1E1E24', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activeZoneObj ? `${activeZoneObj.name.toUpperCase()} (${activeZoneObj.hindiName})` : 'ROTARACT DISTRICT 3011 • DIRECTORY'}
              {isLive && (
                <span className="pill-pink" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                  <CheckCircle2 size={10} /> RY 2026-27 Active
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#4A4A5A', fontWeight: 600 }}>
              {activeZoneObj 
                ? `ZRR: ${activeZoneObj.zrr} • ZRS: ${activeZoneObj.zrs} • ${activeClubs.filter(c => clubMatchesZone(c, activeZoneObj.id)).length} Clubs`
                : `4 Elemental Zones (Prithvi, Agni, Vayu, Akash) • ${activeClubs.length} Active Clubs`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'auto', flexWrap: 'wrap' }}>
          {/* Segmented View Mode Control: Map View vs Cards/Tiles View */}
          <div
            style={{
              display: 'inline-flex',
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(16px)',
              borderRadius: '8px',
              padding: '3px',
              border: '1.5px solid rgba(216, 27, 96, 0.25)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
            }}
          >
            <button
              onClick={() => setViewMode('map')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'map' ? 'var(--rotaract-pink)' : 'transparent',
                color: viewMode === 'map' ? '#FFFFFF' : '#1E1E24',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <MapIcon size={14} /> Map View
            </button>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'cards' ? 'var(--rotaract-pink)' : 'transparent',
                color: viewMode === 'cards' ? '#FFFFFF' : '#1E1E24',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <LayoutGrid size={14} /> Cards / Tiles View
            </button>
          </div>

          <div 
            style={{
              position: 'relative',
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(216, 27, 96, 0.2)',
              borderRadius: '8px',
              padding: '6px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
            }}
          >
            <Search size={16} style={{ color: 'var(--rotaract-pink)' }} />
            <input
              type="text"
              placeholder="Search full club name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#1E1E24',
                fontSize: '0.84rem',
                fontWeight: 600,
                width: '170px'
              }}
            />
            {searchQuery && (
              <X size={14} style={{ color: '#71717A', cursor: 'pointer' }} onClick={() => setSearchQuery('')} />
            )}
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleZoneSelect(null)}
              style={{
                background: !activeZoneId ? '#FFFFFF' : '#0E0E0E',
                backdropFilter: 'blur(12px)',
                color: !activeZoneId ? '#0E0E0E' : '#FFFFFF',
                border: !activeZoneId ? '2px solid #0E0E0E' : '1px solid #0E0E0E',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: !activeZoneId ? '0 4px 14px rgba(0,0,0,0.18)' : 'none'
              }}
            >
              All Zones ({activeClubs.length})
            </button>
            {REGIONAL_ZONES.map(z => (
              <button
                key={z.id}
                onClick={() => handleZoneSelect(z.id)}
                style={{
                  background: activeZoneId === z.id ? 'rgba(255, 255, 255, 0.96)' : z.color,
                  backdropFilter: 'blur(12px)',
                  color: activeZoneId === z.id ? z.color : '#FFFFFF',
                  border: activeZoneId === z.id ? `2px solid ${z.color}` : `1px solid ${z.color}`,
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: activeZoneId === z.id ? `0 4px 14px ${z.color}45` : '0 2px 8px rgba(0,0,0,0.12)'
                }}
              >
                {z.name} <span style={{ opacity: 0.85, fontSize: '0.72rem' }}>({z.hindiName})</span>
              </button>
            ))}
          </div>



          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            style={{
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(216, 27, 96, 0.25)',
              color: 'var(--rotaract-pink)',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
            }}
            title={isFullScreen ? "Exit Fullscreen" : "Full Screen Mode"}
          >
            {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {hoveredClub && (
        <div 
          className="glass-hover-tooltip"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: tooltipPos.transform || 'translate(-50%, -100%)',
            zIndex: 10000
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <div 
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: getClubNeonColor(hoveredClub),
                boxShadow: `0 0 8px ${getClubNeonColor(hoveredClub)}`
              }} 
            />
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: getClubNeonColor(hoveredClub), textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {hoveredClub.zone || 'District 3011'}
            </span>
          </div>

          <h4 style={{ fontSize: '1.02rem', fontWeight: 900, color: '#1E1E24', margin: '2px 0 8px 0', lineHeight: 1.35, wordBreak: 'break-word' }}>
            {hoveredClub.name}
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.85rem', color: '#4A4A5A', fontWeight: 700 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} style={{ color: 'var(--rotaract-pink)', flexShrink: 0 }} />
              <span style={{ wordBreak: 'break-word' }}>President: {hoveredClub.president || 'Rtr. Club President'}</span>
            </div>
            {isRealSecretary(hoveredClub.secretary) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserCheck size={14} style={{ color: '#0284c7' }} />
                <span>Secretary: {hoveredClub.secretary}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#166534' }}>
              <CheckCircle2 size={12} style={{ color: '#10b981' }} />
              <span>Verified Directory Club</span>
            </div>
            {hoveredClub.isDirector && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                <Globe size={13} style={{ color: '#123499' }} />
                <span>ISD: {hoveredClub.isDirector}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {(() => {
        const currentSlideoutClub = activeSlideoutClub 
          ? (activeClubs.find(c => c.id === activeSlideoutClub.id) || activeSlideoutClub)
          : null;

        return (
          <>
            <div 
              className={`frosted-slideout-overlay ${currentSlideoutClub ? 'open' : ''}`}
              onClick={() => {
                setActiveSlideoutClub(null);
                if (onSelectClub) onSelectClub(null);
              }}
              style={{ zIndex: 99998 }}
            />

            <aside className={`frosted-slideout-panel ${currentSlideoutClub ? 'open' : ''}`}>
              {currentSlideoutClub && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '85px 30px 40px 30px', boxSizing: 'border-box' }}>
                  
                  <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ flex: 1, paddingRight: '12px' }}>
                        <span 
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            background: `${getClubNeonColor(currentSlideoutClub)}18`,
                            border: `1.5px solid ${getClubNeonColor(currentSlideoutClub)}45`,
                            color: getClubNeonColor(currentSlideoutClub),
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            marginBottom: '8px'
                          }}
                        >
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: getClubNeonColor(currentSlideoutClub) }} />
                          {currentSlideoutClub.zone || 'District 3011'}
                        </span>
                        
                        <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#1E1E24', lineHeight: 1.2, margin: 0 }}>
                          {currentSlideoutClub.name}
                        </h2>
                      </div>

                <button
                  onClick={() => {
                    setActiveSlideoutClub(null);
                    if (onSelectClub) onSelectClub(null);
                  }}
                  style={{
                    background: '#FDF0F5',
                    border: '1px solid rgba(216, 27, 96, 0.25)',
                    color: '#D81B60',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#D81B60'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#FDF0F5'}
                  title="Close Sidebar"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Leadership & Personal Data from Database */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '22px' }}>
                
                {/* Club President Card */}
                <div 
                  style={{
                    background: '#FFF8FA',
                    border: '1.5px solid rgba(216, 27, 96, 0.2)',
                    borderRadius: '16px',
                    padding: '16px 18px',
                    boxShadow: '0 4px 14px rgba(216, 27, 96, 0.05)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#D81B60', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <User size={13} /> Club President (RY 2026-27)
                    </span>
                    {currentSlideoutClub.rotaryId && (
                      <span style={{ fontSize: '0.68rem', color: '#71717A', background: '#FFFFFF', border: '1px solid #E4E4E7', padding: '2px 8px', borderRadius: '100px', fontWeight: 700 }}>
                        Rotary ID: {currentSlideoutClub.rotaryId}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '1.08rem', fontWeight: 900, color: '#18181B' }}>
                    {currentSlideoutClub.president || 'Rtr. Club President'}
                  </div>

                  {/* President Contact Actions */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                    <a
                      href="/portal/directory"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 12px',
                        borderRadius: '8px',
                        background: '#FFF1F2',
                        border: '1px solid #FECDD3',
                        color: '#D81B60',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <Phone size={12} /> Get President's Contact
                    </a>

                    {currentSlideoutClub.email && (
                      <a
                        href={`mailto:${currentSlideoutClub.email}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 11px',
                          borderRadius: '8px',
                          background: '#FFFFFF',
                          border: '1px solid #E4E4E7',
                          color: '#D81B60',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <Mail size={12} /> {currentSlideoutClub.email}
                      </a>
                    )}
                  </div>
                </div>

                {/* Club Secretary Card - omitted if empty or placeholder */}
                {isRealSecretary(currentSlideoutClub.secretary) && (
                  <div 
                    style={{
                      background: '#F0FDF4',
                      border: '1.5px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: '16px',
                      padding: '16px 18px',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.05)'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
                      <UserCheck size={13} /> Club Secretary (RY 2026-27)
                    </div>

                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#18181B' }}>
                      {currentSlideoutClub.secretary}
                    </div>

                    {/* Secretary Contact Actions */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                      <a
                        href="/portal/directory"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 12px',
                          borderRadius: '8px',
                          background: '#F0FDF4',
                          border: '1px solid #BBF7D0',
                          color: '#059669',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <Phone size={12} /> Get Secretary's Contact
                      </a>

                      {currentSlideoutClub.secretaryEmail && (
                        <a
                          href={`mailto:${currentSlideoutClub.secretaryEmail}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 11px',
                            borderRadius: '8px',
                            background: '#FFFFFF',
                            border: '1px solid #D1FAE5',
                            color: '#059669',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <Mail size={12} /> {currentSlideoutClub.secretaryEmail}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* ISD & Charter Year Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  {currentSlideoutClub.isDirector && (
                    <div style={{ background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '14px', padding: '12px 14px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#1E40AF', fontWeight: 800, textTransform: 'uppercase' }}>
                        IS Director
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1E3A8A', marginTop: '3px' }}>
                        {currentSlideoutClub.isDirector}
                      </div>
                    </div>
                  )}

                  {currentSlideoutClub.charterYear && (
                    <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: '14px', padding: '12px 14px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#92400E', fontWeight: 800, textTransform: 'uppercase' }}>
                        Charter Year
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#B45309', marginTop: '3px' }}>
                        {currentSlideoutClub.charterYear}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              <div style={{ marginBottom: '24px' }}>
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px'
                  }}
                >
                  <div 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#FFFBEB',
                      border: '1px solid rgba(216, 27, 96, 0.2)',
                      padding: '4px 14px',
                      borderRadius: '6px'
                    }}
                  >
                    <span 
                      style={{
                        color: 'var(--skyline-gold-dark)',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        letterSpacing: '1px',
                        textTransform: 'uppercase'
                      }}
                    >
                      CLUB KPIS & INITIATIVES
                    </span>
                  </div>

                  {onOpenPostInitiativeModal && (
                    <button
                      onClick={() => onOpenPostInitiativeModal(currentSlideoutClub.id)}
                      style={{
                        background: '#D81B60',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'transform 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      + Publish
                    </button>
                  )}
                </div>

                {(currentSlideoutClub.initiatives && currentSlideoutClub.initiatives.length > 0) ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {(currentSlideoutClub.initiatives || []).map((init, idx) => (
                      <div 
                        key={idx}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #F3E5EB',
                          borderRadius: '16px',
                          padding: '18px 20px',
                          boxShadow: '0 4px 14px rgba(216, 27, 96, 0.04)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '6px' }}>
                          <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--rotaract-pink)', lineHeight: 1.25, margin: 0 }}>
                            {init.title}
                          </h4>
                          <span className="pill-pink" style={{ fontSize: '0.72rem', padding: '2px 8px', flexShrink: 0 }}>
                            {init.category}
                          </span>
                        </div>

                        <p style={{ color: '#4A4A5A', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '10px', fontWeight: 500 }}>
                          {init.description}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', color: 'var(--skyline-gold-dark)', fontWeight: 800, borderTop: '1px solid #F3E5EB', paddingTop: '10px' }}>
                          <span>Impact: {init.impact}</span>
                          {init.date && <span style={{ color: '#71717A', fontWeight: 600 }}>{init.date}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div 
                    style={{
                      background: '#FFFFFF',
                      border: '1px dashed #E4E4E7',
                      borderRadius: '14px',
                      padding: '20px',
                      textAlign: 'center',
                      color: '#71717A',
                      fontSize: '0.88rem',
                      fontWeight: 500
                    }}
                  >
                    <p style={{ margin: '0 0 10px 0' }}>No monthly report KPIs uploaded yet for this club.</p>
                    {onOpenPostInitiativeModal && (
                      <button
                        onClick={() => onOpenPostInitiativeModal(currentSlideoutClub.id)}
                        style={{
                          background: '#FFF1F2',
                          color: '#D81B60',
                          border: '1px solid #FECDD3',
                          padding: '7px 15px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        + Publish First Initiative
                      </button>
                    )}
                  </div>
                )}
              </div>

            </div>

            <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
              <a
                href={`mailto:${currentSlideoutClub.email || currentSlideoutClub.presidentEmail || ''}?subject=${encodeURIComponent(`Connecting with ${currentSlideoutClub.name} (RY 2026-27)`)}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: '#FFFFFF',
                  background: 'linear-gradient(135deg, #D81B60 0%, #AD1457 100%)',
                  textDecoration: 'none',
                  boxShadow: '0 8px 24px rgba(216, 27, 96, 0.25)',
                  transition: 'transform 0.2s ease'
                }}
              >
                Connect via Email <ChevronRight size={18} />
              </a>
            </div>

          </div>
        )}
      </aside>
    </>
  );
})()}

    </div>
  );
}

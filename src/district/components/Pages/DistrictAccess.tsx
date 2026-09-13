import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import DistrictMap from '../District/DistrictMap';
import ClubInitiativesList from '../District/ClubInitiativesList';
import PastDRRShowcase from '../District/PastDRRShowcase';
import DistrictResourcesView from '../District/DistrictResourcesView';
import DistrictCalendarView from '../District/DistrictCalendarView';
import { DISTRICT_LEADERSHIP } from '../../data/districtData';
import type { DistrictClub } from '../../data/districtData';
import { findLeaderPhoto } from '../../data/leadershipImages';
import { fetchDistrictTeam } from '@/lib/publicApi/leadership';
import { Mail, Phone, Copy, Check, Search } from 'lucide-react';

// Superset of DistrictLeader: the API-backed branch adds `club` and drops `order`.
interface LeadershipEntry {
  id: string;
  name: string;
  role: string;
  category: string;
  email: string;
  phone: string;
  photo: string;
  club?: string;
  order?: number;
}

export interface DistrictAccessProps {
  clubs: DistrictClub[];
  activeDistrictTab: string | null;
  isLoggedIn: boolean;
  userRole?: string;
  onOpenLoginModal: () => void;
  onOpenUploadClubModal: () => void;
  onOpenPostInitiativeModal?: () => void;
}

export default function DistrictAccess({
  clubs,
  activeDistrictTab,
  isLoggedIn,
  userRole,
  onOpenLoginModal,
  onOpenUploadClubModal,
  onOpenPostInitiativeModal
}: DistrictAccessProps) {
  const [leadershipCategory, setLeadershipCategory] = useState('All');
  const [leadershipSearch, setLeadershipSearch] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const teamQuery = useQuery({
    queryKey: ['public', 'district-team'],
    queryFn: fetchDistrictTeam,
    staleTime: 30 * 1000,
    refetchOnMount: 'always',
  });

  const leadersList = useMemo<LeadershipEntry[]>(() => {
    if (!teamQuery.data?.items || teamQuery.data.items.length === 0) {
      return DISTRICT_LEADERSHIP.map(l => ({
        ...l,
        photo: l.photo || findLeaderPhoto(l.name, l.email, l.id) || ''
      }));
    }
    return teamQuery.data.items.map((member) => {
      const clean = (s: string) => s.replace(/^(Rtn\.?\s*|Rtr\.?\s*|PHF\.?\s*|Dr\.?\s*)+/gi, '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const mClean = clean(member.name);
      const local = DISTRICT_LEADERSHIP.find(
        (l) =>
          l.id === member.id ||
          (l.email && member.email && l.email.trim().toLowerCase() === member.email.trim().toLowerCase()) ||
          clean(l.name) === mClean ||
          l.name.toLowerCase() === member.name.toLowerCase() ||
          (l.role && member.designation && l.role.toLowerCase() === member.designation.toLowerCase()),
      );

      let category = local?.category;
      if (!category) {
        const des = (member.designation || '').toLowerCase();
        if (member.kind === 'core' || des.includes('drr') || des.includes('representative') || des.includes('facilitator')) {
          category = 'Executive Council';
        } else if (des.includes('zonal') || des.includes('zrr') || des.includes('zrs') || des.includes('zone')) {
          category = 'Zonal Team';
        } else {
          category = 'District Chairs';
        }
      }

      const photo = member.photoUrl || local?.photo || findLeaderPhoto(member.name, member.email, member.id) || '';

      return {
        id: member.id,
        name: member.name,
        role: member.designation,
        category,
        email: member.email || local?.email || '',
        phone: member.phone || local?.phone || '',
        photo,
        club: 'Rotaract District 3011',
      };
    });
  }, [teamQuery.data]);

  const handleCopyEmail = (email: string) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const filteredLeaders = useMemo(() => {
    return leadersList.filter((leader) => {
      const matchesCategory = leadershipCategory === 'All' || leader.category === leadershipCategory;
      const q = leadershipSearch.trim().toLowerCase();
      const matchesSearch = !q || 
        leader.name.toLowerCase().includes(q) || 
        leader.role.toLowerCase().includes(q) || 
        (leader.email && leader.email.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [leadersList, leadershipCategory, leadershipSearch]);

  const districtTabBackground =
    activeDistrictTab === 'map-clubs' || !activeDistrictTab
      ? '#FDF8FA'
      : activeDistrictTab === 'resources'
        ? 'linear-gradient(180deg, #123499 0%, #0C2470 100%)'
        : activeDistrictTab === 'leadership'
          ? 'linear-gradient(180deg, #123499 0%, #0C2470 100%)'
          : activeDistrictTab === 'heritage'
            ? 'linear-gradient(180deg, #D81B60 0%, #880E4F 100%)'
            : '#FFFFFF';

  return (
    <div style={{ background: districtTabBackground, minHeight: '100vh', padding: (activeDistrictTab === 'map-clubs' || !activeDistrictTab) ? '0px' : '40px 24px 80px 24px', color: 'var(--text-primary)' }}>
      {(!activeDistrictTab || activeDistrictTab === 'map-clubs') ? (
        <div style={{ width: '100%', minHeight: 'calc(100vh - 70px)' }}>
          <DistrictMap
            clubs={clubs}
            isLoggedIn={isLoggedIn}
            userRole={userRole}
            onOpenLoginModal={onOpenLoginModal}
            onOpenUploadClubModal={onOpenUploadClubModal}
            onOpenPostInitiativeModal={onOpenPostInitiativeModal}
          />
        </div>
      ) : (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {activeDistrictTab === 'heritage' && (
          <PastDRRShowcase />
        )}

        {(activeDistrictTab === 'initiatives' || activeDistrictTab === 'showcase') && (
          <ClubInitiativesList
            clubs={clubs}
            isLoggedIn={isLoggedIn}
            userRole={userRole}
            onOpenLoginModal={onOpenLoginModal}
            onOpenPostInitiativeModal={onOpenPostInitiativeModal}
          />
        )}

        {activeDistrictTab === 'resources' && (
          <DistrictResourcesView />
        )}

        {activeDistrictTab === 'calendar' && (
          <DistrictCalendarView
            isLoggedIn={isLoggedIn}
            userRole={userRole}
            onOpenLoginModal={onOpenLoginModal}
            clubs={clubs}
          />
        )}

        {activeDistrictTab === 'leadership' && (
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', color: '#FFFFFF', marginBottom: '32px' }}>
              <span className="pill-gold" style={{ fontSize: '0.82rem', marginBottom: '12px' }}>
                DISTRICT ACTION COMMITTEE RY 2026-27
              </span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.5px', marginTop: '8px' }}>
                District Secretariat & Leadership
              </h2>
              <p style={{ opacity: 0.9, fontSize: '1.05rem', maxWidth: '680px', margin: '8px auto 0 auto' }}>
                Guided by passion, fellowship, and visionary leadership — 50 dedicated leaders steering Rotaract District Organization 3011.
              </p>
            </div>

            {/* Controls Bar: Category Pills & Search */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              gap: '16px', 
              marginBottom: '32px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              padding: '16px 20px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              {/* Category Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  { key: 'All', label: 'All Leaders', count: leadersList.length },
                  { key: 'Executive Council', label: 'Executive Council', count: leadersList.filter(l => l.category === 'Executive Council').length },
                  { key: 'Zonal Team', label: 'Zonal Team', count: leadersList.filter(l => l.category === 'Zonal Team').length },
                  { key: 'District Chairs', label: 'District Chairs', count: leadersList.filter(l => l.category === 'District Chairs').length }
                ].map((cat) => {
                  const isActive = leadershipCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setLeadershipCategory(cat.key)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '100px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        transition: 'all 0.2s ease',
                        background: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.15)',
                        color: isActive ? '#D81B60' : '#FFFFFF',
                        boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'
                      }}
                    >
                      {cat.label} ({cat.count})
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <div style={{ position: 'relative', minWidth: '260px', flex: '1', maxWidth: '360px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="text"
                  placeholder="Search leader by name, role, email..."
                  value={leadershipSearch}
                  onChange={(e) => setLeadershipSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '100px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    background: '#FFFFFF',
                    color: '#0F172A',
                    fontSize: '0.85rem',
                    outline: 'none',
                    fontWeight: 500
                  }}
                />
              </div>
            </div>

            {/* Leaders Grid */}
            {filteredLeaders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#FFFFFF', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '24px' }}>
                <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>No leaders match your search or filter</p>
                <button 
                  onClick={() => { setLeadershipCategory('All'); setLeadershipSearch(''); }}
                  style={{ marginTop: '12px', padding: '8px 20px', borderRadius: '100px', background: '#FFFFFF', color: '#D81B60', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '22px' }}>
                {filteredLeaders.map((leader) => (
                  <div 
                    key={leader.id} 
                    className="rotaract-card" 
                    style={{ 
                      padding: '24px 20px', 
                      textAlign: 'center', 
                      backgroundColor: '#FFFFFF', 
                      borderRadius: '20px',
                      border: '1.5px solid rgba(216, 27, 96, 0.12)',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      {/* Avatar with fallback */}
                      <div style={{ position: 'relative', width: '96px', height: '96px', margin: '0 auto 16px auto' }}>
                        {leader.photo ? (
                          <img
                            src={leader.photo}
                            alt={leader.name}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback');
                              if (fallback instanceof HTMLElement) fallback.style.display = 'flex';
                            }}
                            style={{
                              width: '96px',
                              height: '96px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              objectPosition: '50% 20%',
                              border: '3px solid #D81B60',
                              boxShadow: '0 8px 20px rgba(216, 27, 96, 0.25)'
                            }}
                          />
                        ) : null}
                        <div
                          className="avatar-fallback"
                          style={{
                            display: leader.photo ? 'none' : 'flex',
                            width: '96px',
                            height: '96px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #D81B60 0%, #880E4F 100%)',
                            color: '#FFFFFF',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.6rem',
                            fontWeight: 900,
                            boxShadow: '0 8px 20px rgba(216, 27, 96, 0.25)'
                          }}
                        >
                          {leader.name.replace(/^(Rtn\.?\s*|Rtr\.?\s*|PHF\.?\s*)+/i, '').split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                      </div>

                      {/* Category Pill */}
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ 
                          fontSize: '0.68rem', 
                          fontWeight: 800, 
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                          padding: '3px 10px', 
                          borderRadius: '100px',
                          background: leader.category === 'Executive Council' ? '#FDF2F4' : leader.category === 'Zonal Team' ? '#E0F2FE' : '#F3E8FF',
                          color: leader.category === 'Executive Council' ? '#D81B60' : leader.category === 'Zonal Team' ? '#0284C7' : '#7E22CE'
                        }}>
                          {leader.category}
                        </span>
                      </div>

                      {/* Name */}
                      <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px', lineHeight: 1.25 }}>
                        {leader.name}
                      </h3>

                      {/* Role */}
                      <div style={{ color: '#D81B60', fontWeight: 700, fontSize: '0.86rem', minHeight: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {leader.role}
                      </div>
                    </div>

                    {/* Email Card & Contact Information */}
                    <div style={{ marginTop: '16px' }}>
                      {leader.email && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '6px',
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '10px',
                          padding: '7px 10px',
                          fontSize: '0.78rem'
                        }}>
                          <a 
                            href={`mailto:${leader.email}`}
                            title={`Send email to ${leader.name}`}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px', 
                              color: '#1E293B', 
                              textDecoration: 'none',
                              fontWeight: 600,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              flex: 1
                            }}
                          >
                            <Mail size={14} style={{ color: '#D81B60', flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {leader.email}
                            </span>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopyEmail(leader.email)}
                            title="Copy email address"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: copiedEmail === leader.email ? '#10B981' : '#64748B',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '2px',
                              borderRadius: '4px',
                              flexShrink: 0
                            }}
                          >
                            {copiedEmail === leader.email ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      )}

                      {leader.phone && (
                        <div style={{ marginTop: '8px' }}>
                          <a 
                            href={`tel:${leader.phone}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              color: '#64748B',
                              textDecoration: 'none',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}
                          >
                            <Phone size={12} style={{ color: '#0284C7' }} />
                            +91 {leader.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        </div>
      )}
    </div>
  );
}

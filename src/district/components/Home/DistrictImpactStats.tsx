import { useState, useEffect, type FC } from 'react';
import { ArrowUp, TrendingUp } from 'lucide-react';
import type { ImpactMetric } from '../../data/districtData';

interface DistrictImpactStatsProps {
  metrics: ImpactMetric[];
}

export const DistrictImpactStats: FC<DistrictImpactStatsProps> = ({ metrics }) => {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use either dynamic metrics or rich verified defaults
  const cards = [
    {
      value: metrics[0]?.value || '49',
      suffix: metrics[0]?.suffix || 'Clubs',
      badgeText: 'Active',
      badgeType: 'arrow-up',
      title: 'Active Verified Clubs',
      description: 'Campus and community-based clubs leading high-impact grassroots initiatives across Delhi and Haryana.',
      accent: '#123499',
      subAccent: '#EEF1FA'
    },
    {
      value: metrics[1]?.value || '4',
      suffix: metrics[1]?.suffix || 'Zones',
      badgeText: 'Regional',
      badgeType: 'arrow-down',
      title: 'Zonal Demarcations',
      description: 'Zone Prithvi, Agni, Vayu, and Akash driving localized, decentralized governance and direct club support.',
      accent: '#0C2470',
      subAccent: '#F1F5F9'
    },
    {
      value: metrics[2]?.value || '100%',
      suffix: metrics[2]?.suffix || 'Compliance',
      badgeText: '+100%',
      badgeType: 'pill-growth',
      title: 'Governance & Expansion',
      description: '100% attendance at DOLS, official charter expansions, and comprehensive leadership seminar slates.',
      accent: '#0284C7',
      subAccent: '#F0F9FF'
    }
  ];

  return (
    <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 4px' : '0' }}>
      
      {/* Header Block matching Image 2 */}
      <div style={{ marginBottom: isMobile ? '24px' : '40px', maxWidth: '780px' }}>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 3.2rem)', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px', margin: 0, lineHeight: 1.18 }}>
          Measurable change across Delhi &amp; NCR
        </h2>
        
        <div style={{ width: '54px', height: '4px', backgroundColor: '#123499', borderRadius: '2px', margin: isMobile ? '10px 0 12px' : '14px 0 16px' }} />
        
        <p style={{ color: '#475569', fontSize: isMobile ? '0.92rem' : '1.05rem', lineHeight: 1.6, margin: 0 }}>
          Real, verified grassroots metrics driven by 49 recognized Rotaract clubs and thousands of dedicated youth leaders throughout Rotary Year 2026–27.
        </p>
      </div>

      {/* 3 Modern Metric Cards matching Image 2 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: isMobile ? '16px' : '24px'
      }}>
        {cards.map((card, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: isMobile ? '18px' : '24px',
              padding: isMobile ? '24px 20px' : '36px 30px',
              position: 'relative',
              boxShadow: '0 12px 35px rgba(18, 52, 153, 0.06)',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: isMobile ? '220px' : '270px',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 45px rgba(18, 52, 153, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(18, 52, 153, 0.06)';
            }}
          >
            {/* Top Right Badge */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              {card.badgeType === 'arrow-up' && (
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#EEF2FF',
                  color: '#123499',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900
                }}>
                  <ArrowUp size={18} />
                </div>
              )}

              {card.badgeType === 'arrow-down' && (
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#F1F5F9',
                  color: '#0C2470',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900
                }}>
                  <TrendingUp size={18} />
                </div>
              )}

              {card.badgeType === 'pill-growth' && (
                <div style={{
                  padding: '6px 14px',
                  borderRadius: '100px',
                  backgroundColor: '#F0FDF4',
                  color: '#16A34A',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  border: '1px solid rgba(22, 163, 74, 0.2)'
                }}>
                  {card.badgeText}
                </div>
              )}
            </div>

            {/* Giant Number */}
            <div>
              <div style={{
                fontSize: 'clamp(3rem, 5.5vw, 4.6rem)',
                fontWeight: 900,
                color: '#0F172A',
                letterSpacing: '-2px',
                lineHeight: 0.95,
                marginBottom: '14px'
              }}>
                {card.value}
              </div>

              {/* Title & Description */}
              <h3 style={{
                fontSize: '1.24rem',
                fontWeight: 800,
                color: '#1E293B',
                margin: '0 0 8px 0',
                lineHeight: 1.3
              }}>
                {card.title}
              </h3>

              <p style={{
                fontSize: '0.92rem',
                color: '#64748B',
                lineHeight: 1.55,
                margin: 0
              }}>
                {card.description}
              </p>
            </div>

            {/* Subtle Bottom Accent Shelf */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: '24px',
              right: '24px',
              height: '4px',
              backgroundColor: card.accent,
              borderRadius: '4px 4px 0 0',
              opacity: 0.85
            }} />

          </div>
        ))}
      </div>

    </div>
  );
};

export default DistrictImpactStats;

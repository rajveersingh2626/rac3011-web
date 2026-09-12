import { FC } from 'react';
import { Award, CheckCircle2, Users, GraduationCap, Sparkles, Star, Flag, Zap } from 'lucide-react';
import type { Achievement } from '../../data/districtData';

interface DistrictRoadmapProps {
  achievements: Achievement[];
}

const ICONS = [Award, CheckCircle2, Users, GraduationCap, Sparkles, Star, Flag, Zap];
const ACCENTS = ['#123499', '#0284C7', '#4F46E5', '#0C2470', '#D81B60', '#059669', '#7C3AED', '#EA580C'];

export const DistrictRoadmap: FC<DistrictRoadmapProps> = ({ achievements = [] }) => {
  // Map all achievements dynamically
  const dynamicSteps = (achievements.length > 0 ? achievements : [
    {
      id: '1',
      title: 'Charter Expansion Across NCR',
      metric: 'New Clubs Chartered',
      description: 'New community and campus Rotaract clubs chartered during the year, expanding youth leadership and service reach across Delhi NCR.',
      badge: 'Charter Expansion',
      highlight: 'Active Charters',
      color: '#123499'
    },
    {
      id: '2',
      title: '100% Attendance at DOLS',
      metric: 'Leadership Milestone',
      description: 'Full attendance achieved at the District Officers Leadership Seminar, demonstrating unwavering governance across all teams.',
      badge: 'Leadership Milestone',
      highlight: '100% Attendance at DOLS',
      color: '#0284C7'
    },
    {
      id: '3',
      title: '500+ District Installation Participation',
      metric: 'District Fellowship',
      description: 'Over 500+ delegates united at the District Installation Ceremony to inaugurate RY 2026–27 across all 4 zones.',
      badge: 'District Fellowship',
      highlight: '500+ Delegates',
      color: '#4F46E5'
    },
    {
      id: '4',
      title: 'CLLS & PLS/SLS Leadership Seminars',
      metric: 'Training Excellence',
      description: 'Comprehensive President, Secretary, and Club Leaders Leadership Seminars conducted with full slate curriculum.',
      badge: 'Training Excellence',
      highlight: 'Full Slate Conducted',
      color: '#0C2470'
    }
  ]).map((ach, idx) => {
    const Icon = ICONS[idx % ICONS.length];
    const accent = ach.color || ACCENTS[idx % ACCENTS.length];
    return {
      num: String(idx + 1).padStart(2, '0'),
      tag: `PILLAR ${String(idx + 1).padStart(2, '0')}`,
      title: ach.title || `Milestone ${idx + 1}`,
      metric: ach.metric || ach.badge || 'District Achievement',
      desc: ach.description || '',
      badge: ach.badge || 'District Achievement',
      highlight: ach.highlight || ach.title,
      icon: Icon,
      accent,
      glow: `${accent}55`,
    };
  });

  const coreSteps = dynamicSteps.slice(0, 4);
  const extraSteps = dynamicSteps.slice(4);

  return (
    <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* Header aligned with Image 1 style */}
      <div style={{ marginBottom: '40px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px' }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ width: '28px', height: '3px', backgroundColor: '#123499', borderRadius: '2px' }} />
            <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#123499', letterSpacing: '1px', textTransform: 'uppercase' }}>
              DISTRICT 3011 ROADMAP
            </span>
          </div>
          <h2 style={{ fontSize: 'clamp(2.2rem, 4.2vw, 3.4rem)', fontWeight: 900, color: '#0F172A', letterSpacing: '-1px', lineHeight: 1.15, margin: 0 }}>
            Strategic <span style={{ color: '#123499' }}>process</span> for district excellence.
          </h2>
          <p style={{ color: '#64748B', fontSize: '1.05rem', marginTop: '14px', lineHeight: 1.6, margin: '14px 0 0 0' }}>
            A milestone-driven journey of club expansion, leadership governance, and fellowship uniting clubs across Delhi NCR.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '8px 16px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(18, 52, 153, 0.15)',
              boxShadow: '0 8px 24px rgba(18, 52, 153, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img
              src="/district-logo.png"
              alt="Rotaract District Organization 3011"
              style={{
                height: '38px',
                width: 'auto',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>
      </div>

      {/* Desktop & Tablet Winding Road Layout (>= 860px) */}
      <div className="hidden md:block" style={{ position: 'relative', width: '100%', minHeight: '920px', margin: '20px 0 40px' }}>
        
        {/* Background Curving Road SVG */}
        <svg
          viewBox="0 0 1000 900"
          style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, overflow: 'visible', filter: 'drop-shadow(0 14px 28px rgba(15, 23, 42, 0.12))' }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="50%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <filter id="roadGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Road Asphalt Track */}
          <path
            d="M 120 40 
               C 380 40, 480 180, 480 230 
               C 480 340, 680 360, 720 440 
               C 760 540, 360 560, 380 670 
               C 400 780, 720 800, 840 880"
            fill="none"
            stroke="url(#roadGradient)"
            strokeWidth="48"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Road Center Dashed Line */}
          <path
            d="M 120 40 
               C 380 40, 480 180, 480 230 
               C 480 340, 680 360, 720 440 
               C 760 540, 360 560, 380 670 
               C 400 780, 720 800, 840 880"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeDasharray="10 10"
            strokeLinecap="round"
            opacity="0.9"
          />
        </svg>

        {/* Milestone Node 1 (Top Left) */}
        {coreSteps[0] && (
          <>
            <div style={{ position: 'absolute', top: '50px', left: '40px', width: '380px' }}>
              <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '22px 24px', boxShadow: '0 12px 35px rgba(18, 52, 153, 0.12)', border: '1px solid rgba(18, 52, 153, 0.16)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.80rem', fontWeight: 900, color: '#123499', letterSpacing: '0.8px' }}>{coreSteps[0].tag}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284C7', backgroundColor: '#EEF2FF', padding: '2px 8px', borderRadius: '6px' }}>
                    {coreSteps[0].metric}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0' }}>{coreSteps[0].title}</h3>
                <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>{coreSteps[0].desc}</p>
              </div>
            </div>
            <div style={{ position: 'absolute', top: '198px', left: '445px', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #123499 0%, #1D4ED8 100%)',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 0 30px rgba(18, 52, 153, 0.55), 0 8px 20px rgba(0,0,0,0.25)',
                border: '3px solid #FFFFFF'
              }}>
                <Award size={28} />
              </div>
            </div>
          </>
        )}

        {/* Milestone Node 2 (Upper Right) */}
        {coreSteps[1] && (
          <>
            <div style={{ position: 'absolute', top: '270px', right: '40px', width: '380px' }}>
              <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '22px 24px', boxShadow: '0 12px 35px rgba(2, 132, 199, 0.12)', border: '1px solid rgba(2, 132, 199, 0.16)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.80rem', fontWeight: 900, color: '#0284C7', letterSpacing: '0.8px' }}>{coreSteps[1].tag}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284C7', backgroundColor: '#F0F9FF', padding: '2px 8px', borderRadius: '6px' }}>
                    {coreSteps[1].metric}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0' }}>{coreSteps[1].title}</h3>
                <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>{coreSteps[1].desc}</p>
              </div>
            </div>
            <div style={{ position: 'absolute', top: '422px', left: '710px', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 0 30px rgba(2, 132, 199, 0.55), 0 8px 20px rgba(0,0,0,0.25)',
                border: '3px solid #FFFFFF'
              }}>
                <CheckCircle2 size={28} />
              </div>
            </div>
          </>
        )}

        {/* Milestone Node 3 (Lower Left) */}
        {coreSteps[2] && (
          <>
            <div style={{ position: 'absolute', top: '510px', left: '40px', width: '380px' }}>
              <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '22px 24px', boxShadow: '0 12px 35px rgba(79, 70, 229, 0.12)', border: '1px solid rgba(79, 70, 229, 0.16)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.80rem', fontWeight: 900, color: '#4F46E5', letterSpacing: '0.8px' }}>{coreSteps[2].tag}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#4F46E5', backgroundColor: '#EEF2FF', padding: '2px 8px', borderRadius: '6px' }}>
                    {coreSteps[2].metric}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0' }}>{coreSteps[2].title}</h3>
                <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>{coreSteps[2].desc}</p>
              </div>
            </div>
            <div style={{ position: 'absolute', top: '652px', left: '388px', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 0 30px rgba(79, 70, 229, 0.55), 0 8px 20px rgba(0,0,0,0.25)',
                border: '3px solid #FFFFFF'
              }}>
                <Users size={28} />
              </div>
            </div>
          </>
        )}

        {/* Milestone Node 4 (Bottom Right) */}
        {coreSteps[3] && (
          <>
            <div style={{ position: 'absolute', bottom: '20px', right: '40px', width: '380px' }}>
              <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '22px 24px', boxShadow: '0 12px 35px rgba(12, 36, 112, 0.12)', border: '1px solid rgba(12, 36, 112, 0.16)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.80rem', fontWeight: 900, color: '#0C2470', letterSpacing: '0.8px' }}>{coreSteps[3].tag}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0C2470', backgroundColor: '#EEF2FF', padding: '2px 8px', borderRadius: '6px' }}>
                    {coreSteps[3].metric}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0' }}>{coreSteps[3].title}</h3>
                <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>{coreSteps[3].desc}</p>
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: '15px', left: '810px', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #0C2470 0%, #1E3A8A 100%)',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 0 30px rgba(12, 36, 112, 0.55), 0 8px 20px rgba(0,0,0,0.25)',
                border: '3px solid #FFFFFF'
              }}>
                <GraduationCap size={28} />
              </div>
            </div>
          </>
        )}

      </div>

      {/* Extra Milestones for Desktop if > 4 */}
      {extraSteps.length > 0 && (
        <div className="hidden md:grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '30px' }}>
          {extraSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '22px 24px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                  border: `1px solid ${step.accent}30`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: step.accent, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} />
                    </div>
                    <span style={{ fontSize: '0.80rem', fontWeight: 900, color: step.accent }}>{step.tag}</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: step.accent, backgroundColor: `${step.accent}15`, padding: '3px 10px', borderRadius: '6px' }}>
                    {step.metric}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0' }}>{step.title}</h3>
                <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>{step.desc}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Mobile Vertical Timeline Road (< 860px) */}
      <div className="block md:hidden" style={{ position: 'relative', paddingLeft: '32px', margin: '20px 0 32px' }}>
        
        {/* Vertical Track */}
        <div style={{
          position: 'absolute',
          top: '20px',
          bottom: '20px',
          left: '12px',
          width: '12px',
          backgroundColor: '#0F172A',
          borderRadius: '10px'
        }}>
          {/* Dashed center */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderLeft: '2px dashed #FFFFFF',
            marginLeft: '5px',
            opacity: 0.8
          }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {dynamicSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} style={{ position: 'relative', paddingLeft: '24px' }}>
                {/* Glowing Node */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '-28px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: step.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: `0 0 16px ${step.glow}`,
                  border: '2px solid #FFFFFF',
                  zIndex: 2
                }}>
                  <Icon size={18} />
                </div>

                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '18px 20px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                  border: `1px solid ${step.accent}25`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 900, color: step.accent }}>DATA {step.num}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: step.accent, backgroundColor: `${step.accent}12`, padding: '2px 6px', borderRadius: '4px' }}>
                      {step.metric}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0' }}>{step.title}</h4>
                  <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: 1.45, margin: 0 }}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default DistrictRoadmap;

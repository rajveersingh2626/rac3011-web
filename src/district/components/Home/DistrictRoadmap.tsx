import { FC } from 'react';
import { Award, CheckCircle2, Users, GraduationCap } from 'lucide-react';
import type { Achievement } from '../../data/districtData';

interface DistrictRoadmapProps {
  achievements: Achievement[];
}

export const DistrictRoadmap: FC<DistrictRoadmapProps> = ({ achievements }) => {
  // 4 Core Milestones mapping to the Pillars
  const steps = [
    {
      num: '01',
      tag: 'PILLAR 01',
      title: achievements[0]?.title || 'Charter Expansion Across NCR',
      metric: achievements[0]?.metric || 'New Clubs Chartered',
      desc: achievements[0]?.description || 'New community and campus Rotaract clubs chartered during the year, expanding youth leadership and service reach across Delhi NCR.',
      badge: achievements[0]?.badge || 'Charter Expansion',
      highlight: achievements[0]?.highlight || 'Active Charters',
      icon: Award,
      accent: '#123499',
      glow: 'rgba(18, 52, 153, 0.35)',
      posDesktop: { top: '8%', left: '16%' },
      nodeDesktop: { top: '16%', left: '38%' }
    },
    {
      num: '02',
      tag: 'PILLAR 02',
      title: achievements[1]?.title || '100% Attendance at DOLS',
      metric: achievements[1]?.metric || 'Leadership Milestone',
      desc: achievements[1]?.description || 'Full attendance achieved at the District Officers Leadership Seminar, demonstrating unwavering governance across all teams.',
      badge: achievements[1]?.badge || 'Leadership Milestone',
      highlight: achievements[1]?.highlight || '100% Attendance at DOLS',
      icon: CheckCircle2,
      accent: '#0284C7',
      glow: 'rgba(2, 132, 199, 0.35)',
      posDesktop: { top: '34%', right: '14%' },
      nodeDesktop: { top: '42%', right: '36%' }
    },
    {
      num: '03',
      tag: 'PILLAR 03',
      title: achievements[2]?.title || '500+ District Installation Participation',
      metric: achievements[2]?.metric || 'District Fellowship',
      desc: achievements[2]?.description || 'Over 500+ delegates united at the District Installation Ceremony to inaugurate RY 2026–27 across all 4 zones.',
      badge: achievements[2]?.badge || 'District Fellowship',
      highlight: achievements[2]?.highlight || '500+ Delegates',
      icon: Users,
      accent: '#4F46E5',
      glow: 'rgba(79, 70, 229, 0.35)',
      posDesktop: { top: '60%', left: '16%' },
      nodeDesktop: { top: '68%', left: '38%' }
    },
    {
      num: '04',
      tag: 'PILLAR 04',
      title: achievements[3]?.title || 'CLLS & PLS/SLS Leadership Seminars',
      metric: achievements[3]?.metric || 'Training Excellence',
      desc: achievements[3]?.description || 'Comprehensive President, Secretary, and Club Leaders Leadership Seminars conducted with full slate curriculum.',
      badge: achievements[3]?.badge || 'Training Excellence',
      highlight: achievements[3]?.highlight || 'Full Slate Conducted',
      icon: GraduationCap,
      accent: '#0C2470',
      glow: 'rgba(12, 36, 112, 0.35)',
      posDesktop: { top: '82%', right: '14%' },
      nodeDesktop: { top: '90%', right: '36%' }
    }
  ];

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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '3rem', fontWeight: 900, color: '#E2E8F0', letterSpacing: '-2px', userSelect: 'none' }}>
            3011
          </span>
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
        <div style={{ position: 'absolute', top: '50px', left: '40px', width: '380px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '22px 24px', boxShadow: '0 12px 35px rgba(18, 52, 153, 0.12)', border: '1px solid rgba(18, 52, 153, 0.16)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.80rem', fontWeight: 900, color: '#123499', letterSpacing: '0.8px' }}>DATA 01</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284C7', backgroundColor: '#EEF2FF', padding: '2px 8px', borderRadius: '6px' }}>
                {steps[0].metric}
              </span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0' }}>{steps[0].title}</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>{steps[0].desc}</p>
          </div>
        </div>
        {/* Hexagon 1 on Road */}
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

        {/* Milestone Node 2 (Upper Right) */}
        <div style={{ position: 'absolute', top: '270px', right: '40px', width: '380px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '22px 24px', boxShadow: '0 12px 35px rgba(2, 132, 199, 0.12)', border: '1px solid rgba(2, 132, 199, 0.16)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.80rem', fontWeight: 900, color: '#0284C7', letterSpacing: '0.8px' }}>DATA 02</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284C7', backgroundColor: '#F0F9FF', padding: '2px 8px', borderRadius: '6px' }}>
                {steps[1].metric}
              </span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0' }}>{steps[1].title}</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>{steps[1].desc}</p>
          </div>
        </div>
        {/* Hexagon 2 on Road */}
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

        {/* Milestone Node 3 (Lower Left) */}
        <div style={{ position: 'absolute', top: '510px', left: '40px', width: '380px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '22px 24px', boxShadow: '0 12px 35px rgba(79, 70, 229, 0.12)', border: '1px solid rgba(79, 70, 229, 0.16)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.80rem', fontWeight: 900, color: '#4F46E5', letterSpacing: '0.8px' }}>DATA 03</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#4F46E5', backgroundColor: '#EEF2FF', padding: '2px 8px', borderRadius: '6px' }}>
                {steps[2].metric}
              </span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0' }}>{steps[2].title}</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>{steps[2].desc}</p>
          </div>
        </div>
        {/* Hexagon 3 on Road */}
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

        {/* Milestone Node 4 (Bottom Right) */}
        <div style={{ position: 'absolute', bottom: '20px', right: '40px', width: '380px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '22px 24px', boxShadow: '0 12px 35px rgba(12, 36, 112, 0.12)', border: '1px solid rgba(12, 36, 112, 0.16)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.80rem', fontWeight: 900, color: '#0C2470', letterSpacing: '0.8px' }}>DATA 04</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0C2470', backgroundColor: '#EEF2FF', padding: '2px 8px', borderRadius: '6px' }}>
                {steps[3].metric}
              </span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0' }}>{steps[3].title}</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>{steps[3].desc}</p>
          </div>
        </div>
        {/* Hexagon 4 on Road */}
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

      </div>

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
          {steps.map((step, idx) => {
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

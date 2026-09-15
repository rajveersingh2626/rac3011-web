import { useState } from 'react';
import { Calendar, Users, MapPin, Sparkles, Award } from 'lucide-react';

interface Edition {
  year: string;
  theme: string;
  tagline: string;
  logo: string;
  dates: string;
  stats: {
    delegates: number;
    districts: number;
    clubs: number;
  };
  summary: string;
  highlights: string[];
  accentColor: string;
}

const EDITIONS: Edition[] = [
  {
    year: '2024',
    theme: 'Dastaan-e-Delhi',
    tagline: 'Where Heritage Meets Harmony',
    logo: '/ride/logos/2024.png',
    dates: 'March 2024',
    stats: { delegates: 42, districts: 14, clubs: 28 },
    summary:
      'The pioneer chapter that sparked the national youth exchange tradition across Rotary District 3011. delegates explored the timeless monuments of Old Delhi, relished Paranthe Wali Gali, and bonded over heritage storytelling sessions.',
    highlights: ['Humayun Tomb Sunset Walk', 'Old Delhi Cycle Tour & Food Safari', 'Cultural Gala Night at India Habitat Centre'],
    accentColor: '#19539D',
  },
  {
    year: '2025',
    theme: 'Dekho Dilli',
    tagline: 'Through The Eyes of a Dilliwala',
    logo: '/ride/logos/2025.png',
    dates: 'February 2025',
    stats: { delegates: 68, districts: 21, clubs: 45 },
    summary:
      'A sprawling celebration taking exchange beyond textbook sightseeing into lived Delhi culture - pottery workshops at Kumhar Gram, evening sufi sessions at Nizamuddin, and high-energy diplomacy workshops.',
    highlights: ['Nizamuddin Qawwali Night', 'Dilli Haat Crafts Carnival', 'Rotary Youth Leadership Conclave'],
    accentColor: '#59A835',
  },
  {
    year: '2026',
    theme: 'Delhi Meri Jaan',
    tagline: 'The Heartbeat of Rotaract Exchange',
    logo: '/ride/logos/2026_logo_coloured.png',
    dates: 'Coming Soon • RID 3011',
    stats: { delegates: 100, districts: 30, clubs: 60 },
    summary:
      'The flagship, grandest edition yet! Uniting over 100 delegates across India and international districts for 4 unforgettable days of immersive heritage, food trails, homestay warmth, and diplomatic fellowship.',
    highlights: ['Connaught Place Heritage Hunt', 'DMRC Line-to-Heart Commute Challenge', 'Chandni Chowk Midnight Food Trail', 'The Royal Farewell Ball'],
    accentColor: '#C72425',
  },
];

export function EditionHistory() {
  const [selectedYear, setSelectedYear] = useState<'2024' | '2025' | '2026'>('2026');
  const active = EDITIONS.find((e) => e.year === selectedYear) || EDITIONS[2];

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Year Pill Selectors */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8">
        {EDITIONS.map((ed) => {
          const isCurrent = ed.year === selectedYear;
          return (
            <button
              key={ed.year}
              type="button"
              onClick={() => setSelectedYear(ed.year as '2024' | '2025' | '2026')}
              className={`px-5 py-2.5 rounded-2xl border-2 border-[#171515] font-extrabold text-sm sm:text-base tracking-wide transition-all ${
                isCurrent
                  ? 'bg-[#EA6623] text-white ride-pop scale-105'
                  : 'bg-white text-[#171515] hover:bg-amber-50 ride-pop-sm'
              }`}
            >
              <span>{ed.year} • {ed.theme}</span>
            </button>
          );
        })}
      </div>

      {/* Main Showcase Card */}
      <div className="rounded-3xl border-3 border-[#171515] bg-white p-6 sm:p-10 ride-pop-lg relative overflow-hidden">
        <div
          className="absolute -right-16 -top-16 w-56 h-56 rounded-full opacity-10 pointer-events-none"
          style={{ backgroundColor: active.accentColor }}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Logo Showcase with animated pop */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-[#FDFBF7] rounded-2xl border-2 border-[#171515] ride-pop-sm">
            <img
              src={active.logo}
              alt={`${active.theme} Official Logo`}
              className="max-h-48 w-auto object-contain transition-transform duration-300 hover:scale-105"
            />
            <span
              className="mt-4 px-3 py-1 rounded-full text-xs font-bold border border-[#171515] text-white"
              style={{ backgroundColor: active.accentColor }}
            >
              {active.year} Official Emblem
            </span>
          </div>

          {/* Details */}
          <div className="md:col-span-8 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-neutral-500">Edition Showcase</span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#171515] tracking-tight">{active.theme}</h3>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 border-[#171515] bg-[#F7F3E9] text-xs font-bold text-[#171515]">
                <Calendar size={14} />
                <span>{active.dates}</span>
              </div>
            </div>

            <p className="text-sm font-semibold italic text-[#EA6623]">"{active.tagline}"</p>
            <p className="text-sm text-neutral-700 leading-relaxed">{active.summary}</p>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl border-2 border-[#171515] bg-[#FDFBF7] text-center ride-pop-sm">
                <div className="flex items-center justify-center text-[#19539D] mb-1">
                  <Users size={18} />
                </div>
                <div className="text-xl font-black text-[#171515]">{active.stats.delegates}+</div>
                <div className="text-[11px] font-bold text-neutral-600 uppercase">Delegates</div>
              </div>
              <div className="p-3 rounded-xl border-2 border-[#171515] bg-[#FDFBF7] text-center ride-pop-sm">
                <div className="flex items-center justify-center text-[#59A835] mb-1">
                  <MapPin size={18} />
                </div>
                <div className="text-xl font-black text-[#171515]">{active.stats.districts}+</div>
                <div className="text-[11px] font-bold text-neutral-600 uppercase">Districts</div>
              </div>
              <div className="p-3 rounded-xl border-2 border-[#171515] bg-[#FDFBF7] text-center ride-pop-sm">
                <div className="flex items-center justify-center text-[#EA6623] mb-1">
                  <Award size={18} />
                </div>
                <div className="text-xl font-black text-[#171515]">{active.stats.clubs}+</div>
                <div className="text-[11px] font-bold text-neutral-600 uppercase">Host Clubs</div>
              </div>
            </div>

            {/* Curated Highlights */}
            <div className="pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2 flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#EA6623]" />
                Key Highlights
              </div>
              <div className="flex flex-wrap gap-2">
                {active.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg border border-[#171515] bg-neutral-50 text-xs font-semibold text-[#171515]"
                  >
                    • {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

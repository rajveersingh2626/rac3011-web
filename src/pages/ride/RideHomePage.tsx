import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Sparkles, MapPin, HeartHandshake, Award, Menu, X } from 'lucide-react';
import {
  AutoRickshawBadge,
  ChaiKulhadBadge,
  DilliDilwalonKiBadge,
  DMRCTokenBadge,
  ChandniChowkBadge,
  ParantheWaliGaliBadge,
  MajnuKaTillaMomosBadge,
  SarojiniNagarBadge,
  ConnaughtPlaceBadge,
  KhariBaoliBadge,
  ChholeBhatureBadge,
  LotusTempleBadge,
  RedFortBadge,
  IndiaGateIceCreamBadge,
} from './components/DelhiStickers';
import { DelhiSnapGallery } from './components/DelhiSnapGallery';
import { RideTeamSection } from './components/RideTeamSection';
import { PersistentVerticalSpine } from './components/PersistentVerticalSpine';

export function RideHomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.title = 'RIDE: Delhi Meri Jaan | Rotaract District 3011';
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#171515] selection:bg-[#EA6623] selection:text-white relative [overflow-x:clip] overflow-x-clip font-ride-sans">
      {/* 0. CONTINUOUS YELLOW HORIZONTAL TICKER */}
      <div className="w-full w-screen bg-[#FBC02D] border-b-3 border-[#171515] overflow-hidden select-none shadow-md relative z-30 py-3 sm:py-4 md:py-5">
        <div className="animate-ride-marquee-giant whitespace-nowrap font-black text-2xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-[#171515] uppercase flex gap-8 sm:gap-12 items-center">
          <span>DELHI MERI JAAN • RID 3011</span>
          <span className="text-[#C72425]">•</span>
          <span>PARANTHE WALI GALI SAFARI</span>
          <span className="text-[#19539D]">•</span>
          <span>INDIA GATE AT SUNSET</span>
          <span className="text-[#59A835]">•</span>
          <span>ROTARY FELLOWSHIP EXCHANGE</span>
          <span className="text-[#C72425]">•</span>
          <span>DMRC YELLOW LINE TO HEART</span>
          <span className="text-[#19539D]">•</span>
          <span>DELHI MERI JAAN • RID 3011</span>
          <span className="text-[#C72425]">•</span>
          <span>PARANTHE WALI GALI SAFARI</span>
          <span className="text-[#19539D]">•</span>
          <span>INDIA GATE AT SUNSET</span>
          <span className="text-[#59A835]">•</span>
          <span>ROTARY FELLOWSHIP EXCHANGE</span>
          <span className="text-[#C72425]">•</span>
          <span>DMRC YELLOW LINE TO HEART</span>
        </div>
      </div>

      {/* 1. Persistent Vertical Scroll Spine (Delhi Metro Route Schematic) */}
      <PersistentVerticalSpine />

      {/* 2. Top Navigation Bar */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b-2 border-[#171515]/15 shadow-sm transition-all">
        <div className="w-full px-4 sm:px-8 lg:px-14 py-3 flex items-center justify-between">
          {/* Brand Emblem & Text */}
          <button
            type="button"
            onClick={() => scrollToSection('hero')}
            className="flex items-center gap-3 group focus:outline-none cursor-pointer"
          >
            <img
              src="/ride/logos/2026_logo_coloured.png?v=2"
              alt="Delhi Meri Jaan Emblem"
              className="h-9 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span className="font-black text-sm sm:text-base tracking-tight uppercase text-[#171515] hidden sm:inline-block">
              THE RIDE • RID 3011
            </span>
          </button>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm lg:text-base font-bold text-neutral-700">
            <button
              type="button"
              onClick={() => scrollToSection('four-pillars')}
              className="hover:text-[#EA6623] transition-colors cursor-pointer"
            >
              Experience
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('gallery')}
              className="hover:text-[#EA6623] transition-colors cursor-pointer"
            >
              Delhi Through Our Lens
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('our-team')}
              className="hover:text-[#EA6623] transition-colors cursor-pointer"
            >
              Our Team
            </button>
            <Link
              to="/dashboard"
              className="text-[#19539D] font-extrabold hover:text-blue-800 transition-colors inline-flex items-center gap-1.5"
            >
              <span>Participant Portal</span>
            </Link>
          </nav>

          {/* Right Action Button -> Directly to /dashboard & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/dashboard"
              className="px-3.5 sm:px-6 py-2 rounded-xl border-2 sm:border-3 border-[#171515] bg-[#EA6623] text-white font-black text-xs sm:text-sm uppercase tracking-wider ride-pop-sm hover:bg-orange-600 transition-all inline-flex items-center gap-1.5"
            >
              <span>Join The Ride</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border-2 border-[#171515] bg-white text-[#171515] hover:bg-neutral-100 transition-colors cursor-pointer flex items-center justify-center min-h-[40px] min-w-[40px]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t-2 border-[#171515]/10 bg-[#FDFBF7] px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <button
              type="button"
              onClick={() => {
                scrollToSection('four-pillars');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-lg font-bold text-neutral-800 hover:bg-[#EA6623]/10 hover:text-[#EA6623] transition-colors text-sm cursor-pointer"
            >
              Experience
            </button>
            <button
              type="button"
              onClick={() => {
                scrollToSection('gallery');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-lg font-bold text-neutral-800 hover:bg-[#EA6623]/10 hover:text-[#EA6623] transition-colors text-sm cursor-pointer"
            >
              Delhi Through Our Lens
            </button>
            <button
              type="button"
              onClick={() => {
                scrollToSection('our-team');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-lg font-bold text-neutral-800 hover:bg-[#EA6623]/10 hover:text-[#EA6623] transition-colors text-sm cursor-pointer"
            >
              Our Team
            </button>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-lg font-extrabold text-[#19539D] hover:bg-blue-50 transition-colors text-sm"
            >
              <span>Participant Portal</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </header>

      {/* Reduced-density Floating Badges (strictly placed in extreme margins with low z-index) */}
      <div className="absolute top-[380px] left-2 xl:left-6 hidden 2xl:block animate-ride-float-1 z-10 pointer-events-none opacity-80">
        <ChandniChowkBadge />
      </div>
      <div className="absolute top-[420px] right-2 xl:right-6 hidden 2xl:block animate-ride-float-2 z-10 pointer-events-none opacity-80">
        <ParantheWaliGaliBadge />
      </div>
      <div className="absolute top-[1350px] left-2 xl:left-6 hidden 2xl:block animate-ride-float-3 z-10 pointer-events-none opacity-80">
        <DMRCTokenBadge />
      </div>
      <div className="absolute top-[1450px] right-2 xl:right-6 hidden 2xl:block animate-ride-float-4 z-10 pointer-events-none opacity-80">
        <ConnaughtPlaceBadge />
      </div>

      {/* SECTION 1: HERO */}
      <section
        id="hero"
        className="relative min-h-[85vh] sm:min-h-[90vh] w-full flex flex-col justify-center items-center text-center pt-12 pb-16 px-4 sm:px-8 lg:px-20 overflow-hidden"
      >
        {/* Heritage Delhi Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#171515_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Top Badges & Edition Pill */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 z-10">
          <AutoRickshawBadge className="scale-85 sm:scale-95 -rotate-2" />
          <DilliDilwalonKiBadge className="rotate-1" />
          <div className="px-3.5 py-1 rounded-full border-2 border-[#171515] bg-white text-xs sm:text-sm font-black uppercase tracking-wider ride-pop-sm">
            Rotary International District 3011
          </div>
          <div className="px-3 py-1 rounded-xl border-2 border-[#171515] bg-[#EA6623] text-white text-xs sm:text-sm font-black uppercase tracking-wider ride-pop-sm">
            Edition 2026
          </div>
          <ChaiKulhadBadge className="scale-85 sm:scale-95 rotate-2" />
        </div>

        {/* Centered Transparent Official Logo */}
        <div className="relative my-3 sm:my-6 w-full max-w-xl sm:max-w-3xl lg:max-w-4xl px-4 flex justify-center items-center mx-auto text-center z-10">
          <img
            src="/ride/logos/2026_logo_coloured.png?v=3"
            alt="Delhi Meri Jaan Official 2026 Emblem"
            className="w-full h-auto max-h-[240px] sm:max-h-[340px] md:max-h-[420px] lg:max-h-[460px] object-contain mx-auto drop-shadow-xl transition-transform duration-500 hover:scale-[1.02]"
          />
        </div>

        {/* Grand Headline */}
        <h1 className="text-2xl sm:text-5xl md:text-7xl lg:text-[6.5rem] font-black tracking-tighter text-[#171515] leading-[0.94] uppercase mt-2 sm:mt-4 mb-4 sm:mb-6 max-w-6xl z-10 break-words">
          THE RIDE <span className="text-[#C72425]">•</span> DELHI MERI JAAN
        </h1>

        <p className="text-base sm:text-xl md:text-2xl font-extrabold text-neutral-800 max-w-4xl leading-relaxed mb-8 px-4 z-10">
          The flagship Rotaract Youth & National District Exchange. 4 days of timeless monument trails, authentic culinary safaris, host family warmth, and lifelong global fellowship.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 z-10 w-full max-w-md sm:max-w-none">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-10 py-3 sm:py-4 rounded-2xl border-3 border-[#171515] bg-[#EA6623] text-white text-sm sm:text-lg font-black uppercase tracking-wider ride-pop-lg hover:bg-orange-600 transition-all ride-pop-active cursor-pointer min-w-[170px]"
          >
            <span>Join The Ride</span>
            <ArrowRight size={18} />
          </Link>

          <button
            type="button"
            onClick={() => scrollToSection('four-pillars')}
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-10 py-3 sm:py-4 rounded-2xl border-3 border-[#171515] bg-white text-[#171515] text-sm sm:text-lg font-black uppercase tracking-wider ride-pop-lg hover:bg-neutral-100 transition-all ride-pop-active cursor-pointer min-w-[170px]"
          >
            <span>Explore Experience</span>
          </button>
        </div>
      </section>

      {/* SECTION 2: 4 PILLARS OF EXPERIENCE (Scaled Down & Balanced) */}
      <section id="four-pillars" className="py-16 sm:py-24 px-4 sm:px-8 lg:px-16 xl:px-24 w-full">
        <div className="text-center mb-10 sm:mb-14">
          <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#EA6623]">
            What To Expect
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#171515] tracking-tight mt-1.5 uppercase">
            The 4 Pillars of Delhi Meri Jaan
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-neutral-600 max-w-3xl mx-auto mt-2.5 font-semibold">
            Every moment curated for cultural depth, culinary delight, and diplomatic international youth camaraderie.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          <div className="p-6 sm:p-7 rounded-2xl border-2 sm:border-3 border-[#171515] bg-white ride-pop-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl border-2 border-[#171515] bg-[#C72425] text-white flex items-center justify-center mb-4 ride-pop-sm">
                <MapPin size={24} />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#171515]">Heritage Odyssey</h3>
              <p className="text-sm sm:text-base text-neutral-600 mt-2.5 leading-relaxed font-medium">
                Step into the sandstone poetry of Lal Qila, Humayun’s Tomb, and Jama Masjid guided by certified Delhi historians.
              </p>
            </div>
            <span className="mt-5 text-xs font-black text-[#C72425] uppercase tracking-wider">
              Mughal & Lutyens Splendor
            </span>
          </div>

          <div className="p-6 sm:p-7 rounded-2xl border-2 sm:border-3 border-[#171515] bg-white ride-pop-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl border-2 border-[#171515] bg-[#EA6623] text-white flex items-center justify-center mb-4 ride-pop-sm">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#171515]">Culinary Safari</h3>
              <p className="text-sm sm:text-base text-neutral-600 mt-2.5 leading-relaxed font-medium">
                Taste the world-famous street delicacies - butter paranthas, piping hot jalebis, momos, and cutting chai at vintage tapris.
              </p>
            </div>
            <span className="mt-5 text-xs font-black text-[#EA6623] uppercase tracking-wider">
              Chandni Chowk to Khan Market
            </span>
          </div>

          <div className="p-6 sm:p-7 rounded-2xl border-2 sm:border-3 border-[#171515] bg-white ride-pop-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl border-2 border-[#171515] bg-[#19539D] text-white flex items-center justify-center mb-4 ride-pop-sm">
                <HeartHandshake size={24} />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#171515]">Homestay Warmth</h3>
              <p className="text-sm sm:text-base text-neutral-600 mt-2.5 leading-relaxed font-medium">
                Experience authentic Dilli hospitality residing with vetted host families of Rotaract District 3011.
              </p>
            </div>
            <span className="mt-5 text-xs font-black text-[#19539D] uppercase tracking-wider">
              A Home Away From Home
            </span>
          </div>

          <div className="p-6 sm:p-7 rounded-2xl border-2 sm:border-3 border-[#171515] bg-white ride-pop-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl border-2 border-[#171515] bg-[#59A835] text-white flex items-center justify-center mb-4 ride-pop-sm">
                <Award size={24} />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#171515]">Exchange Summit</h3>
              <p className="text-sm sm:text-base text-neutral-600 mt-2.5 leading-relaxed font-medium">
                Inter-district leadership panels, diplomatic flag exchanges, collaborative community projects, and the Grand Gala Ball.
              </p>
            </div>
            <span className="mt-5 text-xs font-black text-[#59A835] uppercase tracking-wider">
              Diplomacy & Lifelong Bonds
            </span>
          </div>
        </div>
      </section>

      {/* CONTINUOUS AUTO-SCROLLING SOUVENIR MARQUEE STRIP */}
      <section className="py-6 bg-[#FBC02D] border-y-3 border-[#171515] select-none relative z-20 overflow-hidden">
        <div className="px-4 mb-3 text-center">
          <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#171515] bg-white px-4 py-1.5 rounded-full border-2 border-[#171515] ride-pop-sm inline-block">
            Delhi Cultural Souvenir Strip
          </span>
        </div>
        <div className="animate-ride-marquee flex items-center gap-6 sm:gap-8 py-2">
          {/* First loop of souvenir badges */}
          <div className="flex items-center gap-6 sm:gap-8 shrink-0">
            <AutoRickshawBadge />
            <ChaiKulhadBadge />
            <MajnuKaTillaMomosBadge />
            <SarojiniNagarBadge />
            <DMRCTokenBadge />
            <ChandniChowkBadge />
            <ParantheWaliGaliBadge />
            <ConnaughtPlaceBadge />
            <KhariBaoliBadge />
            <ChholeBhatureBadge />
            <LotusTempleBadge />
            <RedFortBadge />
            <IndiaGateIceCreamBadge />
          </div>
          {/* Duplicated loop for infinite seamless scroll */}
          <div className="flex items-center gap-6 sm:gap-8 shrink-0" aria-hidden="true">
            <AutoRickshawBadge />
            <ChaiKulhadBadge />
            <MajnuKaTillaMomosBadge />
            <SarojiniNagarBadge />
            <DMRCTokenBadge />
            <ChandniChowkBadge />
            <ParantheWaliGaliBadge />
            <ConnaughtPlaceBadge />
            <KhariBaoliBadge />
            <ChholeBhatureBadge />
            <LotusTempleBadge />
            <RedFortBadge />
            <IndiaGateIceCreamBadge />
          </div>
        </div>
      </section>

      {/* SECTION 3: DELHI THROUGH OUR LENS — NATIVECONTENT FULL-BLEED SNAP-SCROLL */}
      <DelhiSnapGallery />

      {/* SECTION 4: OUR TEAM SECTION */}
      <section id="our-team" className="py-16 sm:py-24 px-4 sm:px-8 lg:px-16 xl:px-24 w-full">
        <RideTeamSection />
      </section>

      {/* FOOTER */}
      <footer className="border-t-3 border-[#171515] bg-white py-12 px-6 sm:px-12 lg:px-20">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <img
              src="/ride/logos/2026_logo_not_coloured.png"
              alt="Delhi Meri Jaan Monochrome"
              className="h-12 sm:h-14 w-auto object-contain"
            />
            <div>
              <div className="font-black text-sm sm:text-base text-[#171515]">THE RIDE: DELHI MERI JAAN 2026</div>
              <div className="text-xs text-neutral-500 font-bold">Rotary International District 3011</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-bold text-neutral-700">
            <button type="button" onClick={() => scrollToSection('four-pillars')} className="hover:text-[#EA6623] cursor-pointer">
              Experience
            </button>
            <button type="button" onClick={() => scrollToSection('gallery')} className="hover:text-[#EA6623] cursor-pointer">
              Delhi Through Our Lens
            </button>
            <button type="button" onClick={() => scrollToSection('our-team')} className="hover:text-[#EA6623] cursor-pointer">
              Our Team
            </button>
            <Link to="/dashboard" className="text-[#19539D] font-extrabold hover:underline">
              Participant Portal
            </Link>
            <Link to="/admin" className="text-neutral-500 hover:text-neutral-900 font-bold">
              Admin Portal
            </Link>
          </div>

          <div className="text-xs text-neutral-500 font-semibold text-center md:text-right">
            Crafted for RID 3011 with Pride and Fellowship.
          </div>
        </div>
      </footer>
    </div>
  );
}

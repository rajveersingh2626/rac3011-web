import { useEffect } from 'react';
import { ArrowRight, Sparkles, MapPin, HeartHandshake, Compass, Camera, Award } from 'lucide-react';
import {
  AutoRickshawBadge,
  ChaiKulhadBadge,
  MetroCardBadge,
  IndiaGateBadge,
  DilliDilwalonKiBadge,
  DMRCTokenBadge,
  ChandniChowkBadge,
  ParantheWaliGaliBadge,
  QutubMinarBadge,
  HauzKhasBadge,
  MajnuKaTillaMomosBadge,
  SarojiniNagarBadge,
  ConnaughtPlaceBadge,
  KhariBaoliBadge,
  LodhiArtBadge,
  ChholeBhatureBadge,
  LotusTempleBadge,
  RedFortBadge,
  IndiaGateIceCreamBadge,
  CycleRickshawBadge,
  DilliMeriJaanHeartBadge,
} from './components/DelhiStickers';
import { EditionHistory } from './components/EditionHistory';
import { RideItinerary } from './components/RideItinerary';
import { SnapGalleryReel } from './components/SnapGalleryReel';
import { DelegateRegistrationWizard } from './components/DelegateRegistrationWizard';
import { PersistentVerticalSpine } from './components/PersistentVerticalSpine';

export function RideHomePage() {
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
    <div className="min-h-screen bg-[#FDFBF7] text-[#171515] selection:bg-[#EA6623] selection:text-white relative overflow-x-hidden font-ride-sans">
      {/* 0. CONTINUOUS YELLOW HORIZONTAL ELEMENT (Very First Element, 100vw, Zero Margins, Highest Z-Index, -10.5% size) */}
      <div className="w-full w-screen bg-[#FBC02D] border-b-3 border-[#171515] overflow-hidden select-none shadow-md relative z-50 py-3 sm:py-4 md:py-5">
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

      {/* 1. Persistent Vertical Scroll Spine (Left Flank - Delhi Metro Route Line) */}
      <PersistentVerticalSpine />

      {/* 2. Top Navigation Bar */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b-2 border-[#171515]/15 transition-all">
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

          {/* Center Navigation Links (Exact items from user reference snippet) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-10 text-base lg:text-lg font-bold text-neutral-700">
            <button
              type="button"
              onClick={() => scrollToSection('itinerary')}
              className="hover:text-[#EA6623] transition-colors cursor-pointer"
            >
              Itinerary
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('gallery')}
              className="hover:text-[#EA6623] transition-colors cursor-pointer"
            >
              Snap Gallery
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('editions')}
              className="hover:text-[#EA6623] transition-colors cursor-pointer"
            >
              Editions
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('register')}
              className="hover:text-[#EA6623] transition-colors cursor-pointer"
            >
              Register
            </button>
            <a
              href="/admin"
              className="text-[#19539D] font-extrabold hover:text-blue-800 transition-colors inline-flex items-center gap-1.5"
            >
              <span>Admin Portal</span>
            </a>
          </nav>

          {/* Right Action Button */}
          <button
            type="button"
            onClick={() => scrollToSection('register')}
            className="px-4 sm:px-6 py-2 rounded-xl border-2 sm:border-3 border-[#171515] bg-[#EA6623] text-white font-black text-xs sm:text-sm uppercase tracking-wider ride-pop-sm hover:bg-orange-600 transition-all cursor-pointer"
          >
            Join The Ride
          </button>
        </div>
      </header>

      {/* Floating DesignBomb Cultural Badges (Scattered organically across canvas with interactive tooltips) */}
      <div className="absolute top-28 left-6 lg:left-12 xl:left-20 hidden md:block animate-ride-float-1 z-30">
        <ChandniChowkBadge />
      </div>
      <div className="absolute top-36 right-6 lg:right-12 xl:right-20 hidden md:block animate-ride-float-2 z-30">
        <ParantheWaliGaliBadge />
      </div>
      <div className="absolute top-[460px] left-6 xl:left-16 hidden lg:block animate-ride-float-3 z-30">
        <MajnuKaTillaMomosBadge />
      </div>
      <div className="absolute top-[520px] right-6 xl:right-16 hidden lg:block animate-ride-float-4 z-30">
        <SarojiniNagarBadge />
      </div>
      <div className="absolute top-[690px] left-8 xl:left-20 hidden xl:block animate-ride-float-1 z-30">
        <DMRCTokenBadge />
      </div>
      <div className="absolute top-[780px] right-8 xl:right-20 hidden xl:block animate-ride-float-2 z-30">
        <HauzKhasBadge />
      </div>
      <div className="absolute top-[960px] left-10 xl:left-24 hidden xl:block animate-ride-float-3 z-30">
        <ConnaughtPlaceBadge />
      </div>
      <div className="absolute top-[1080px] right-10 xl:right-24 hidden xl:block animate-ride-float-4 z-30">
        <DilliMeriJaanHeartBadge />
      </div>

      {/* Section 2 Flanks */}
      <div className="absolute top-[1380px] left-6 xl:left-16 hidden xl:block animate-ride-float-1 z-30">
        <KhariBaoliBadge />
      </div>
      <div className="absolute top-[1560px] right-6 xl:right-16 hidden xl:block animate-ride-float-2 z-30">
        <ChholeBhatureBadge />
      </div>
      <div className="absolute top-[1780px] left-8 xl:left-20 hidden xl:block animate-ride-float-3 z-30">
        <CycleRickshawBadge />
      </div>

      {/* Section 3 Itinerary Flanks */}
      <div className="absolute top-[2200px] right-6 xl:right-16 hidden xl:block animate-ride-float-4 z-30">
        <QutubMinarBadge />
      </div>
      <div className="absolute top-[2520px] left-6 xl:left-16 hidden xl:block animate-ride-float-1 z-30">
        <MetroCardBadge />
      </div>
      <div className="absolute top-[2880px] right-8 xl:right-20 hidden xl:block animate-ride-float-2 z-30">
        <LotusTempleBadge />
      </div>
      <div className="absolute top-[3220px] left-8 xl:left-20 hidden xl:block animate-ride-float-3 z-30">
        <LodhiArtBadge />
      </div>

      {/* Section 4 & 5 Flanks */}
      <div className="absolute top-[3650px] right-6 xl:right-16 hidden xl:block animate-ride-float-4 z-30">
        <IndiaGateIceCreamBadge />
      </div>
      <div className="absolute top-[4020px] left-8 xl:left-20 hidden xl:block animate-ride-float-1 z-30">
        <IndiaGateBadge />
      </div>
      <div className="absolute top-[4480px] right-8 xl:right-20 hidden xl:block animate-ride-float-2 z-30">
        <RedFortBadge />
      </div>

      {/* Section 6 Registration Flanks */}
      <div className="absolute top-[4900px] left-6 xl:left-16 hidden xl:block animate-ride-float-3 z-30">
        <DilliDilwalonKiBadge />
      </div>
      <div className="absolute top-[5320px] right-8 xl:right-16 hidden xl:block animate-ride-float-4 z-30">
        <AutoRickshawBadge />
      </div>
      <div className="absolute top-[5680px] left-8 xl:left-20 hidden xl:block animate-ride-float-1 z-30">
        <ChaiKulhadBadge />
      </div>

      {/* SECTION 1: HERO (NativeContent Full-Viewport Layout & Scaled Transparent Logo) */}
      <section
        id="hero"
        className="relative min-h-[90vh] sm:min-h-screen w-full flex flex-col justify-center items-center text-center pt-16 pb-16 px-4 sm:px-8 lg:px-20 overflow-hidden"
      >
        {/* Subtle Heritage Delhi Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#171515_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Top Badges & Edition Pill (Matching user screenshot with Auto & Kulhad Chai) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mb-4 sm:mb-6 z-10">
          <AutoRickshawBadge className="scale-90 sm:scale-100 -rotate-2" />
          <DilliDilwalonKiBadge className="rotate-1" />
          <div className="px-4 py-1.5 rounded-full border-2 sm:border-3 border-[#171515] bg-white text-xs sm:text-sm font-black uppercase tracking-wider ride-pop-sm">
            Rotary International District 3011
          </div>
          <div className="px-3.5 py-1.5 rounded-xl border-2 sm:border-3 border-[#171515] bg-[#EA6623] text-white text-xs sm:text-sm font-black uppercase tracking-wider ride-pop-sm">
            Edition 2026
          </div>
          <ChaiKulhadBadge className="scale-90 sm:scale-100 rotate-2" />
        </div>

        {/* Transparent & Significantly Larger Official Logo */}
        <div className="relative my-2 sm:my-6 w-full max-w-2xl sm:max-w-4xl lg:max-w-5xl px-4 z-10">
          <img
            src="/ride/logos/2026_logo_coloured.png?v=2"
            alt="Delhi Meri Jaan Official 2026 Emblem"
            className="w-full h-auto max-h-[260px] sm:max-h-[380px] md:max-h-[460px] lg:max-h-[520px] object-contain mx-auto drop-shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
          />
        </div>

        {/* Grand Headline & Drastically Enlarged Bold Typography */}
        <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[7.5rem] xl:text-[8.5rem] font-black tracking-tighter text-[#171515] leading-[0.92] uppercase mt-2 sm:mt-4 mb-4 sm:mb-6 max-w-7xl z-10">
          THE RIDE <span className="text-[#C72425]">•</span> DELHI MERI JAAN
        </h1>

        <p className="text-lg sm:text-2xl md:text-3xl font-extrabold text-neutral-800 max-w-5xl leading-snug sm:leading-relaxed mb-8 sm:mb-10 px-4 z-10">
          The flagship Rotaract Youth & National District Exchange. 4 days of timeless monument trails, authentic culinary safaris, host family warmth, and lifelong global fellowship.
        </p>

        {/* Magnetic Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 z-10">
          <button
            type="button"
            onClick={() => scrollToSection('register')}
            className="inline-flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-5 rounded-2xl border-3 border-[#171515] bg-[#EA6623] text-white text-base sm:text-xl font-black uppercase tracking-wider ride-pop-lg hover:bg-orange-600 transition-all ride-pop-active cursor-pointer"
          >
            <span>Register as Delegate</span>
            <ArrowRight size={22} />
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('itinerary')}
            className="inline-flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-5 rounded-2xl border-3 border-[#171515] bg-white text-[#171515] text-base sm:text-xl font-black uppercase tracking-wider ride-pop-lg hover:bg-neutral-100 transition-all ride-pop-active cursor-pointer"
          >
            <Compass size={22} className="text-[#19539D]" />
            <span>Explore 4-Day Trail</span>
          </button>
        </div>

        {/* Playful Floating Souvenirs Callout */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 mt-8 rounded-2xl border-2 sm:border-3 border-[#171515] bg-[#FDFBF7] text-[#171515] text-xs sm:text-sm font-black uppercase tracking-wider ride-pop-sm z-10">
          <Sparkles size={16} className="text-[#EA6623]" />
          <span>Tap any floating Delhi souvenir badge to reveal authentic local one-liners</span>
        </div>

        {/* Full-Width Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mt-10 sm:mt-14 w-full max-w-6xl z-10">
          <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl border-3 border-[#171515] bg-[#19539D] text-white text-center ride-pop-sm">
            <div className="text-3xl sm:text-5xl font-black">100+</div>
            <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-100 mt-1">Delegates</div>
          </div>
          <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl border-3 border-[#171515] bg-[#C72425] text-white text-center ride-pop-sm">
            <div className="text-3xl sm:text-5xl font-black">30+</div>
            <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-red-100 mt-1">Districts</div>
          </div>
          <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl border-3 border-[#171515] bg-[#59A835] text-white text-center ride-pop-sm">
            <div className="text-3xl sm:text-5xl font-black">4 Days</div>
            <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-green-100 mt-1">Heritage Trail</div>
          </div>
          <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl border-3 border-[#171515] bg-[#0084B4] text-white text-center ride-pop-sm">
            <div className="text-3xl sm:text-5xl font-black">100%</div>
            <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-100 mt-1">Dilli Dilwalon Ki</div>
          </div>
        </div>
      </section>

      {/* SECTION 2: 4 PILLARS OF EXPERIENCE (Full-Width Responsive Layout) */}
      <section className="py-20 sm:py-28 px-4 sm:px-10 lg:px-20 xl:px-28 w-full">
        <div className="text-center mb-14 sm:mb-20">
          <span className="text-sm sm:text-base font-black uppercase tracking-widest text-[#EA6623]">
            What To Expect
          </span>
          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#171515] tracking-tight mt-2 uppercase">
            The 4 Pillars of Delhi Meri Jaan
          </h2>
          <p className="text-base sm:text-xl md:text-2xl text-neutral-600 max-w-4xl mx-auto mt-4 font-semibold">
            Every moment curated for cultural depth, culinary delight, and diplomatic international youth camaraderie.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="p-8 sm:p-10 rounded-3xl border-3 border-[#171515] bg-white ride-pop-hover flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 rounded-2xl border-3 border-[#171515] bg-[#C72425] text-white flex items-center justify-center mb-6 ride-pop-sm">
                <MapPin size={32} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#171515]">Heritage Odyssey</h3>
              <p className="text-base sm:text-lg text-neutral-600 mt-3 leading-relaxed font-medium">
                Step into the sandstone poetry of Lal Qila, Humayun’s Tomb, and Jama Masjid guided by certified Delhi historians.
              </p>
            </div>
            <span className="mt-6 text-xs sm:text-sm font-black text-[#C72425] uppercase tracking-wider">
              Mughal & Lutyens Splendor
            </span>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl border-3 border-[#171515] bg-white ride-pop-hover flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 rounded-2xl border-3 border-[#171515] bg-[#EA6623] text-white flex items-center justify-center mb-6 ride-pop-sm">
                <Sparkles size={32} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#171515]">Culinary Safari</h3>
              <p className="text-base sm:text-lg text-neutral-600 mt-3 leading-relaxed font-medium">
                Taste the world-famous street delicacies - butter paranthas, piping hot jalebis, momos, and cutting chai at vintage tapris.
              </p>
            </div>
            <span className="mt-6 text-xs sm:text-sm font-black text-[#EA6623] uppercase tracking-wider">
              Chandni Chowk to Khan Market
            </span>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl border-3 border-[#171515] bg-white ride-pop-hover flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 rounded-2xl border-3 border-[#171515] bg-[#19539D] text-white flex items-center justify-center mb-6 ride-pop-sm">
                <HeartHandshake size={32} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#171515]">Homestay Warmth</h3>
              <p className="text-base sm:text-lg text-neutral-600 mt-3 leading-relaxed font-medium">
                Experience authentic Dilli hospitality residing with vetted host families of Rotaract District 3011.
              </p>
            </div>
            <span className="mt-6 text-xs sm:text-sm font-black text-[#19539D] uppercase tracking-wider">
              A Home Away From Home
            </span>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl border-3 border-[#171515] bg-white ride-pop-hover flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 rounded-2xl border-3 border-[#171515] bg-[#59A835] text-white flex items-center justify-center mb-6 ride-pop-sm">
                <Award size={32} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#171515]">Exchange Summit</h3>
              <p className="text-base sm:text-lg text-neutral-600 mt-3 leading-relaxed font-medium">
                Inter-district leadership panels, diplomatic flag exchanges, collaborative community projects, and the Grand Gala Ball.
              </p>
            </div>
            <span className="mt-6 text-xs sm:text-sm font-black text-[#59A835] uppercase tracking-wider">
              Diplomacy & Lifelong Bonds
            </span>
          </div>
        </div>
      </section>

      {/* DELHI SOUVENIR COLLECTOR STRIP (Interactive across Mobile, Tablet, & Desktop) */}
      <section className="py-7 bg-[#FBC02D] border-y-3 border-[#171515] overflow-hidden select-none relative z-20">
        <div className="px-4 mb-4 text-center">
          <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#171515] bg-white px-4 py-1.5 rounded-full border-2 border-[#171515] ride-pop-sm inline-block">
            Delhi Cultural Souvenir Strip • Tap Any Badge For Local Quotes
          </span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-3 px-6 sm:px-12 items-center justify-start xl:justify-center scroll-smooth">
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
      </section>

      {/* SECTION 3: ITINERARY (Full-Width, Removed Horizontal Dividing Lines) */}
      <section id="itinerary" className="py-20 sm:py-28 px-4 sm:px-10 lg:px-20 xl:px-28 w-full bg-[#F7F3E9]/80">
        <div className="w-full">
          <div className="text-center mb-14 sm:mb-20">
            <span className="text-sm sm:text-base font-black uppercase tracking-widest text-[#19539D]">
              Curated Schedule
            </span>
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#171515] tracking-tight mt-2 uppercase">
              4 Days of Delhi Unveiled
            </h2>
            <p className="text-base sm:text-xl md:text-2xl text-neutral-600 max-w-4xl mx-auto mt-4 font-semibold">
              Every hour planned to ensure maximum cultural immersion, safety, and unforgettable memories across the capital.
            </p>
          </div>
          <RideItinerary />
        </div>
      </section>

      {/* SECTION 4: NATIVECONTENT SNAP REEL GALLERY */}
      <section id="gallery" className="py-20 sm:py-28 px-4 sm:px-10 lg:px-20 xl:px-28 w-full">
        <div className="text-center mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 sm:border-3 border-[#171515] bg-[#C72425] text-white text-xs sm:text-sm font-bold uppercase mb-3">
            <Camera size={16} />
            <span>Native Reel Scroll</span>
          </div>
          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#171515] tracking-tight uppercase">
            Delhi Through Our Lens
          </h2>
          <p className="text-base sm:text-xl md:text-2xl text-neutral-600 max-w-4xl mx-auto mt-4 font-semibold">
            Scroll down the vertical snap feed to witness raw, vibrant glimpses of previous exchange editions and Delhi monuments.
          </p>
        </div>
        <SnapGalleryReel />
      </section>

      {/* SECTION 5: EDITION HISTORY (2024, 2025, 2026) */}
      <section id="editions" className="py-20 sm:py-28 px-4 sm:px-10 lg:px-20 xl:px-28 w-full bg-[#F7F3E9]/80">
        <div className="w-full">
          <div className="text-center mb-14 sm:mb-20">
            <span className="text-sm sm:text-base font-black uppercase tracking-widest text-[#EA6623]">
              Legacy & Growth
            </span>
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#171515] tracking-tight mt-2 uppercase">
              The Evolution of The RIDE
            </h2>
            <p className="text-base sm:text-xl md:text-2xl text-neutral-600 max-w-4xl mx-auto mt-4 font-semibold">
              From Dastaan-e-Delhi to Dekho Dilli, explore how RID 3011 pioneered India's most celebrated Rotaract exchange tradition.
            </p>
          </div>
          <EditionHistory />
        </div>
      </section>

      {/* SECTION 6: DELEGATE REGISTRATION WIZARD HUB */}
      <section id="register" className="py-20 sm:py-28 px-4 sm:px-10 lg:px-20 xl:px-28 w-full">
        <div className="text-center mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 sm:border-3 border-[#171515] bg-[#EA6623] text-white text-xs sm:text-sm font-black uppercase mb-3">
            <Sparkles size={16} />
            <span>Limited Delegate Quota</span>
          </div>
          <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#171515] tracking-tight uppercase">
            Reserve Your Delegate Pass
          </h2>
          <p className="text-base sm:text-xl md:text-2xl text-neutral-600 max-w-4xl mx-auto mt-4 font-semibold">
            Open to all Rotaractors across India and worldwide. Complete your registration dossier to secure your homestay and welcome kit.
          </p>
        </div>
        <DelegateRegistrationWizard />
      </section>

      {/* FOOTER */}
      <footer className="border-t-3 border-[#171515] bg-white py-14 px-6 sm:px-12 lg:px-20">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <img
              src="/ride/logos/2026_logo_not_coloured.png"
              alt="Delhi Meri Jaan Monochrome"
              className="h-14 sm:h-16 w-auto object-contain"
            />
            <div>
              <div className="font-black text-base sm:text-lg text-[#171515]">THE RIDE: DELHI MERI JAAN 2026</div>
              <div className="text-xs sm:text-sm text-neutral-500 font-bold">Rotary International District 3011</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm sm:text-base font-bold text-neutral-700">
            <button type="button" onClick={() => scrollToSection('itinerary')} className="hover:text-[#EA6623] cursor-pointer">
              Itinerary
            </button>
            <button type="button" onClick={() => scrollToSection('gallery')} className="hover:text-[#EA6623] cursor-pointer">
              Snap Gallery
            </button>
            <button type="button" onClick={() => scrollToSection('editions')} className="hover:text-[#EA6623] cursor-pointer">
              Editions
            </button>
            <button type="button" onClick={() => scrollToSection('register')} className="hover:text-[#EA6623] cursor-pointer">
              Register
            </button>
            <a href="/admin" className="text-[#19539D] font-extrabold hover:underline">
              Admin Portal
            </a>
          </div>

          <div className="text-xs sm:text-sm text-neutral-500 font-semibold text-center md:text-right">
            Crafted for RID 3011 with Pride and Fellowship.
          </div>
        </div>
      </footer>
    </div>
  );
}

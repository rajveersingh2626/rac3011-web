import { useEffect } from 'react';
import { ArrowRight, Sparkles, MapPin, HeartHandshake, Compass, Camera, Award } from 'lucide-react';
import {
  AutoRickshawBadge,
  ChaiKulhadBadge,
  MetroCardBadge,
  IndiaGateBadge,
  DilliDilwalonKiBadge,
} from './components/DelhiStickers';
import { EditionHistory } from './components/EditionHistory';
import { RideItinerary } from './components/RideItinerary';
import { SnapGalleryReel } from './components/SnapGalleryReel';
import { DelegateRegistrationWizard } from './components/DelegateRegistrationWizard';

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
    <div className="min-h-screen bg-[#FDFBF7] text-[#171515] selection:bg-[#EA6623] selection:text-white relative overflow-hidden font-ride-sans">
      {/* DesignBomb-Style Background Floating Elements */}
      <div className="absolute top-20 left-6 sm:left-12 pointer-events-none hidden md:block animate-ride-float-1">
        <AutoRickshawBadge />
      </div>
      <div className="absolute top-36 right-8 sm:right-16 pointer-events-none hidden md:block animate-ride-float-2">
        <ChaiKulhadBadge />
      </div>
      <div className="absolute top-[680px] left-10 pointer-events-none hidden lg:block animate-ride-float-2">
        <MetroCardBadge />
      </div>
      <div className="absolute top-[780px] right-12 pointer-events-none hidden lg:block animate-ride-float-1">
        <IndiaGateBadge />
      </div>

      {/* Hero Section: DesignBomb cloned energy & layout */}
      <section className="relative pt-10 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Top Tag & Motto */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <DilliDilwalonKiBadge />
          <div className="px-3.5 py-1.5 rounded-full border-2 border-[#171515] bg-white text-xs font-black uppercase tracking-wider ride-pop-sm">
            Rotary International District 3011
          </div>
        </div>

        {/* Official Delhi Meri Jaan Logo with animated Pop frame */}
        <div className="relative my-4 group cursor-pointer">
          <div className="p-4 sm:p-6 rounded-3xl border-3 border-[#171515] bg-white ride-pop-lg transition-transform duration-300 group-hover:scale-105 inline-block">
            <img
              src="/ride/logos/2026_logo_coloured.png"
              alt="Delhi Meri Jaan Official 2026 Logo"
              className="h-32 sm:h-44 md:h-52 w-auto object-contain drop-shadow-sm"
            />
          </div>
          <div className="absolute -bottom-3 right-2 sm:-right-4 rotate-6 group-hover:rotate-12 transition-transform">
            <span className="px-3 py-1 rounded-xl border-2 border-[#171515] bg-[#EA6623] text-white font-black text-xs ride-pop-sm uppercase">
              Edition 2026
            </span>
          </div>
        </div>

        {/* Big Brutalist Heading */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#171515] max-w-4xl mt-6 leading-none">
          THE RIDE <span className="text-[#C72425]">•</span> DELHI MERI JAAN
        </h1>

        <p className="mt-4 text-base sm:text-xl font-bold text-neutral-700 max-w-2xl leading-relaxed">
          The flagship Rotaract Youth & National District Exchange. 4 days of timeless monument trails, authentic culinary safaris, host family warmth, and lifelong global fellowship.
        </p>

        {/* Call to Actions (DesignBomb Magnetic Buttons) */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <button
            type="button"
            onClick={() => scrollToSection('register')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-3 border-[#171515] bg-[#EA6623] text-white text-sm sm:text-base font-black uppercase tracking-wider ride-pop-lg hover:bg-orange-600 ride-pop-active"
          >
            <span>Register as Delegate</span>
            <ArrowRight size={18} />
          </button>

          <button
            type="button"
            onClick={() => scrollToSection('itinerary')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-3 border-[#171515] bg-white text-[#171515] text-sm sm:text-base font-black uppercase tracking-wider ride-pop-lg hover:bg-neutral-100 ride-pop-active"
          >
            <Compass size={18} className="text-[#19539D]" />
            <span>Explore 4-Day Trail</span>
          </button>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-12 w-full max-w-4xl">
          <div className="p-4 rounded-2xl border-2 border-[#171515] bg-[#19539D] text-white text-center ride-pop-sm">
            <div className="text-2xl sm:text-3xl font-black">100+</div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-100">Delegates</div>
          </div>
          <div className="p-4 rounded-2xl border-2 border-[#171515] bg-[#C72425] text-white text-center ride-pop-sm">
            <div className="text-2xl sm:text-3xl font-black">30+</div>
            <div className="text-xs font-bold uppercase tracking-wider text-red-100">Districts</div>
          </div>
          <div className="p-4 rounded-2xl border-2 border-[#171515] bg-[#59A835] text-white text-center ride-pop-sm">
            <div className="text-2xl sm:text-3xl font-black">4 Days</div>
            <div className="text-xs font-bold uppercase tracking-wider text-green-100">Heritage Trail</div>
          </div>
          <div className="p-4 rounded-2xl border-2 border-[#171515] bg-[#0084B4] text-white text-center ride-pop-sm">
            <div className="text-2xl sm:text-3xl font-black">100%</div>
            <div className="text-xs font-bold uppercase tracking-wider text-cyan-100">Dilli Dilwalon Ki</div>
          </div>
        </div>
      </section>

      {/* Infinite Marquee Ribbon */}
      <div className="border-y-3 border-[#171515] bg-[#FBC02D] py-3.5 overflow-hidden select-none">
        <div className="animate-ride-marquee whitespace-nowrap font-black text-sm sm:text-base tracking-widest text-[#171515] uppercase flex gap-8 items-center">
          <span>DELHI MERI JAAN • RID 3011</span>
          <span>•</span>
          <span>OLD DELHI PARANTHE WALI GALI</span>
          <span>•</span>
          <span>INDIA GATE AT SUNSET</span>
          <span>•</span>
          <span>ROTARY FELLOWSHIP EXCHANGE</span>
          <span>•</span>
          <span>DMRC LINE TO HEART</span>
          <span>•</span>
          <span>DELHI MERI JAAN • RID 3011</span>
          <span>•</span>
          <span>OLD DELHI PARANTHE WALI GALI</span>
          <span>•</span>
          <span>INDIA GATE AT SUNSET</span>
          <span>•</span>
          <span>ROTARY FELLOWSHIP EXCHANGE</span>
          <span>•</span>
          <span>DMRC LINE TO HEART</span>
        </div>
      </div>

      {/* 4 Pillars of the Delhi Experience */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-[#EA6623]">What To Expect</span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#171515] tracking-tight mt-1">
            The 4 Pillars of Delhi Meri Jaan
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl border-3 border-[#171515] bg-white ride-pop-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl border-2 border-[#171515] bg-[#C72425] text-white flex items-center justify-center mb-4 ride-pop-sm">
                <MapPin size={24} />
              </div>
              <h3 className="text-xl font-black text-[#171515]">Heritage Odyssey</h3>
              <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                Step into the sandstone poetry of Lal Qila, Humayun’s Tomb, and Jama Masjid guided by certified Delhi historians.
              </p>
            </div>
            <span className="mt-4 text-xs font-black text-[#C72425] uppercase tracking-wider">Mughal & Lutyens Splendor</span>
          </div>

          <div className="p-6 rounded-3xl border-3 border-[#171515] bg-white ride-pop-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl border-2 border-[#171515] bg-[#EA6623] text-white flex items-center justify-center mb-4 ride-pop-sm">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-black text-[#171515]">Culinary Safari</h3>
              <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                Taste the world-famous street delicacies - butter paranthas, piping hot jalebis, momos, and cutting chai at vintage tapris.
              </p>
            </div>
            <span className="mt-4 text-xs font-black text-[#EA6623] uppercase tracking-wider">Chandni Chowk to Khan Market</span>
          </div>

          <div className="p-6 rounded-3xl border-3 border-[#171515] bg-white ride-pop-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl border-2 border-[#171515] bg-[#19539D] text-white flex items-center justify-center mb-4 ride-pop-sm">
                <HeartHandshake size={24} />
              </div>
              <h3 className="text-xl font-black text-[#171515]">Homestay Warmth</h3>
              <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                Experience authentic Dilli hospitality residing with vetted host families of Rotaract District 3011.
              </p>
            </div>
            <span className="mt-4 text-xs font-black text-[#19539D] uppercase tracking-wider">A Home Away From Home</span>
          </div>

          <div className="p-6 rounded-3xl border-3 border-[#171515] bg-white ride-pop-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl border-2 border-[#171515] bg-[#59A835] text-white flex items-center justify-center mb-4 ride-pop-sm">
                <Award size={24} />
              </div>
              <h3 className="text-xl font-black text-[#171515]">Exchange Summit</h3>
              <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                Inter-district leadership panels, diplomatic flag exchanges, collaborative community projects, and the Grand Gala Ball.
              </p>
            </div>
            <span className="mt-4 text-xs font-black text-[#59A835] uppercase tracking-wider">Diplomacy & Lifelong Bonds</span>
          </div>
        </div>
      </section>

      {/* Itinerary Section */}
      <section id="itinerary" className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F7F3E9] border-y-3 border-[#171515]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#19539D]">Curated Schedule</span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#171515] tracking-tight mt-1">
              4 Days of Delhi Unveiled
            </h2>
            <p className="text-sm text-neutral-600 max-w-xl mx-auto mt-2">
              Every hour planned to ensure maximum cultural immersion, safety, and unforgettable memories across the capital.
            </p>
          </div>
          <RideItinerary />
        </div>
      </section>

      {/* Secondary Reference: NativeContent Snap Gallery Reel */}
      <section id="gallery" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-[#171515] bg-[#C72425] text-white text-xs font-bold uppercase mb-2">
            <Camera size={14} />
            <span>Native Reel Scroll</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#171515] tracking-tight">
            Delhi Through Our Lens
          </h2>
          <p className="text-sm text-neutral-600 max-w-xl mx-auto mt-2">
            Scroll down the vertical snap feed to witness raw, vibrant glimpses of previous exchange editions and Delhi monuments.
          </p>
        </div>
        <SnapGalleryReel />
      </section>

      {/* Edition History: 2024, 2025, 2026 */}
      <section id="editions" className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F7F3E9] border-y-3 border-[#171515]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#EA6623]">Legacy & Growth</span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#171515] tracking-tight mt-1">
              The Evolution of The RIDE
            </h2>
            <p className="text-sm text-neutral-600 max-w-xl mx-auto mt-2">
              From Dastaan-e-Delhi to Dekho Dilli, explore how RID 3011 pioneered India's most celebrated Rotaract exchange tradition.
            </p>
          </div>
          <EditionHistory />
        </div>
      </section>

      {/* Delegate Registration Wizard Hub */}
      <section id="register" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 border-[#171515] bg-[#EA6623] text-white text-xs font-black uppercase mb-2">
            <Sparkles size={14} />
            <span>Limited Delegate Quota</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#171515] tracking-tight">
            Reserve Your Delegate Pass
          </h2>
          <p className="text-sm text-neutral-600 max-w-xl mx-auto mt-2">
            Open to all Rotaractors across India and worldwide. Fill out your registration dossier below to secure your homestay and welcome kit.
          </p>
        </div>
        <DelegateRegistrationWizard />
      </section>

      {/* Footer */}
      <footer className="border-t-3 border-[#171515] bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/ride/logos/2026_logo_not_coloured.png"
              alt="Delhi Meri Jaan Monochrome"
              className="h-12 w-auto object-contain"
            />
            <div>
              <div className="font-black text-sm text-[#171515]">THE RIDE: DELHI MERI JAAN 2026</div>
              <div className="text-xs text-neutral-500 font-semibold">Rotary International District 3011</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-neutral-600">
            <button type="button" onClick={() => scrollToSection('itinerary')} className="hover:text-[#EA6623]">Itinerary</button>
            <button type="button" onClick={() => scrollToSection('gallery')} className="hover:text-[#EA6623]">Snap Gallery</button>
            <button type="button" onClick={() => scrollToSection('editions')} className="hover:text-[#EA6623]">Editions</button>
            <button type="button" onClick={() => scrollToSection('register')} className="hover:text-[#EA6623]">Register</button>
            <a href="/admin" className="text-[#19539D] hover:underline">Admin Portal</a>
          </div>

          <div className="text-xs text-neutral-500 font-medium text-center sm:text-right">
            Crafted for RID 3011 with Pride and Fellowship.
          </div>
        </div>
      </footer>
    </div>
  );
}

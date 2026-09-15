import React, { useState } from 'react';

interface StickerProps {
  className?: string;
  style?: React.CSSProperties;
  quote?: string;
}

function StickerContainer({
  children,
  quote,
  className = '',
  style,
}: {
  children: React.ReactNode;
  quote: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [showQuote, setShowQuote] = useState(false);

  return (
    <div
      style={style}
      className={`relative group inline-block cursor-pointer select-none transition-transform duration-200 hover:scale-105 active:scale-95 ${className}`}
      onMouseEnter={() => setShowQuote(true)}
      onMouseLeave={() => setShowQuote(false)}
      onClick={() => setShowQuote((prev) => !prev)}
      role="button"
      tabIndex={0}
    >
      {children}
      {/* Playful Delhi Speech Bubble */}
      <div
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg border-2 border-[#171515] bg-[#FDFBF7] text-[#171515] text-[11px] font-black whitespace-nowrap ride-pop-sm pointer-events-none transition-all duration-200 z-50 ${
          showQuote ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-90'
        }`}
      >
        <span>{quote}</span>
        {/* Pointer arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-solid border-t-[#171515] border-t-4 border-x-transparent border-x-4 border-b-0 w-0 h-0" />
      </div>
    </div>
  );
}

export function AutoRickshawBadge({ className = '', style, quote = 'Bhaiya meter se chaloge kya?' }: StickerProps) {
  return (
    <StickerContainer quote={quote} className={className} style={style}>
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 sm:border-3 border-[#171515] bg-[#59A835] text-white font-bold text-xs uppercase tracking-wider ride-pop-sm">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.1 2 11.5 2 12v4c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <path d="M9 17h6" />
          <circle cx="17" cy="17" r="2" />
        </svg>
        <span>CNG AUTO • METER SE</span>
      </div>
    </StickerContainer>
  );
}

export function ChaiKulhadBadge({ className = '', style, quote = 'Ek cutting chai adrak maar ke!' }: StickerProps) {
  return (
    <StickerContainer quote={quote} className={className} style={style}>
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 sm:border-3 border-[#171515] bg-[#EA6623] text-white font-bold text-xs uppercase tracking-wider ride-pop-sm">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
          <line x1="6" y1="2" x2="6" y2="4" />
          <line x1="10" y1="2" x2="10" y2="4" />
          <line x1="14" y1="2" x2="14" y2="4" />
        </svg>
        <span>KULHAD CHAI • TAPRI 3011</span>
      </div>
    </StickerContainer>
  );
}

export function MetroCardBadge({ className = '', style, quote = 'DMRC card recharge done!' }: StickerProps) {
  return (
    <StickerContainer quote={quote} className={className} style={style}>
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 sm:border-3 border-[#171515] bg-[#0084B4] text-white font-bold text-xs uppercase tracking-wider ride-pop-sm">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="13" x="3" y="4" rx="2" />
          <path d="M3 9h18" />
          <circle cx="7" cy="14" r="1" />
          <circle cx="17" cy="14" r="1" />
        </svg>
        <span>DMRC METRO PASS</span>
      </div>
    </StickerContainer>
  );
}

export function IndiaGateBadge({ className = '', style, quote = 'Raat ke 12 baje India Gate vibes!' }: StickerProps) {
  return (
    <StickerContainer quote={quote} className={className} style={style}>
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 sm:border-3 border-[#171515] bg-[#C72425] text-white font-bold text-xs uppercase tracking-wider ride-pop-sm">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18" />
          <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
          <path d="M9 21v-7a3 3 0 0 1 6 0v7" />
          <line x1="3" y1="7" x2="21" y2="7" />
        </svg>
        <span>INDIA GATE • 1931</span>
      </div>
    </StickerContainer>
  );
}

export function DilliDilwalonKiBadge({ className = '', style, quote = 'Dilli hai dilwalon ki!' }: StickerProps) {
  return (
    <StickerContainer quote={quote} className={className} style={style}>
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 sm:border-3 border-[#171515] bg-[#19539D] text-white font-bold text-xs tracking-wider ride-pop-sm">
        <span className="w-2.5 h-2.5 rounded-full bg-[#EA6623] animate-ping" />
        <span className="font-amita font-bold text-sm">दिल्ली दिलवालों की</span>
      </div>
    </StickerContainer>
  );
}

export function DMRCTokenBadge({ className = '', style, quote = 'Please stand clear of the closing doors!' }: StickerProps) {
  return (
    <StickerContainer quote={quote} className={className} style={style}>
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 sm:border-3 border-[#171515] bg-[#0084B4] text-white font-black text-xs uppercase tracking-wider ride-pop-sm">
        <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center text-[9px] font-bold">M</div>
        <span>DMRC TOKEN • UNLIMITED</span>
      </div>
    </StickerContainer>
  );
}

export function ChandniChowkBadge({ className = '', style, quote = 'Garma-garam jalebi aur rabri!' }: StickerProps) {
  return (
    <StickerContainer quote={quote} className={className} style={style}>
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 sm:border-3 border-[#171515] bg-[#FBC02D] text-[#171515] font-black text-xs uppercase tracking-wider ride-pop-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="m10 15 5-3-5-3v6Z" />
        </svg>
        <span>CHANDNI CHOWK • JALEBI</span>
      </div>
    </StickerContainer>
  );
}

export function ParantheWaliGaliBadge({ className = '', style, quote = 'Kaju parantha ya rabri parantha?' }: StickerProps) {
  return (
    <StickerContainer quote={quote} className={className} style={style}>
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 sm:border-3 border-[#171515] bg-[#EA6623] text-white font-black text-xs uppercase tracking-wider ride-pop-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
        <span>PARANTHE WALI GALI</span>
      </div>
    </StickerContainer>
  );
}

export function QutubMinarBadge({ className = '', style, quote = '73-meter minaret towering over Delhi!' }: StickerProps) {
  return (
    <StickerContainer quote={quote} className={className} style={style}>
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 sm:border-3 border-[#171515] bg-[#C72425] text-white font-black text-xs uppercase tracking-wider ride-pop-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="22" x2="16" y2="22" />
          <line x1="9" y1="18" x2="15" y2="18" />
          <line x1="10" y1="14" x2="14" y2="14" />
          <line x1="11" y1="10" x2="13" y2="10" />
          <polygon points="12 2 10 22 14 22" />
        </svg>
        <span>QUTUB MINAR • 1192 AD</span>
      </div>
    </StickerContainer>
  );
}

export function HauzKhasBadge({ className = '', style, quote = 'Sunset by the deer park & medieval ruins!' }: StickerProps) {
  return (
    <StickerContainer quote={quote} className={className} style={style}>
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 sm:border-3 border-[#171515] bg-[#19539D] text-white font-black text-xs uppercase tracking-wider ride-pop-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 22h16" />
          <path d="M4 18h16" />
          <path d="M9 14v4" />
          <path d="M15 14v4" />
          <path d="M4 14h16V6l-8-4-8 4v8z" />
        </svg>
        <span>HAUZ KHAS • SUNSET</span>
      </div>
    </StickerContainer>
  );
}

export function MajnuKaTillaMomosBadge({ className = '', style, quote = 'Bhaiya extra spicy red chutney dena!' }: StickerProps) {
  return (
    <StickerContainer quote={quote} className={className} style={style}>
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 sm:border-3 border-[#171515] bg-[#D9381E] text-white font-black text-xs uppercase tracking-wider ride-pop-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3c-4.97 0-9 3.13-9 7 0 2.38 1.5 4.47 3.8 5.75L6 21l5.5-2.5h.5c4.97 0 9-3.13 9-7s-4.03-7-9-7z" />
          <circle cx="9" cy="10" r="1.5" fill="currentColor" />
          <circle cx="15" cy="10" r="1.5" fill="currentColor" />
        </svg>
        <span>MKT • STEAMED MOMOS</span>
      </div>
    </StickerContainer>
  );
}

export function SarojiniNagarBadge({ className = '', style, quote = '100 rupaye mein 2 de do bhaiya!' }: StickerProps) {
  return (
    <StickerContainer quote={quote} className={className} style={style}>
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 sm:border-3 border-[#171515] bg-[#FEE440] text-[#171515] font-black text-xs uppercase tracking-wider ride-pop-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
        <span>SAROJINI NAGAR • ₹100/-</span>
      </div>
    </StickerContainer>
  );
}

export function ConnaughtPlaceBadge({ className = '', style, quote = 'Inner circle mein gol-gol ghoomte reh gaye!' }: StickerProps) {
  return (
    <StickerContainer quote={quote} className={className} style={style}>
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 sm:border-3 border-[#171515] bg-[#1F3A60] text-white font-black text-xs uppercase tracking-wider ride-pop-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1" />
        </svg>
        <span>CONNAUGHT PLACE • CP</span>
      </div>
    </StickerContainer>
  );
}

export function KhariBaoliBadge({ className = '', style, quote = "Asia's largest spice hub since 17th century!" }: StickerProps) {
  return (
    <StickerContainer quote={quote} className={className} style={style}>
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 sm:border-3 border-[#171515] bg-[#E27D60] text-white font-black text-xs uppercase tracking-wider ride-pop-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4" />
          <path d="M4 10h16" />
          <path d="M6 10v7a6 6 0 0 0 12 0v-7" />
        </svg>
        <span>KHARI BAOLI • SPICE BAZAAR</span>
      </div>
    </StickerContainer>
  );
}

export function LodhiArtBadge({ className = '', style, quote = 'Open-air street art gallery!' }: StickerProps) {
  return (
    <StickerContainer quote={quote} className={className} style={style}>
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 sm:border-3 border-[#171515] bg-[#845EC2] text-white font-black text-xs uppercase tracking-wider ride-pop-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 19 7-7 3 3-7 7-3-3z" />
          <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <path d="m2 2 7.586 7.586" />
          <circle cx="11" cy="11" r="2" />
        </svg>
        <span>LODHI ART • GRAFFITI</span>
      </div>
    </StickerContainer>
  );
}

export function ChholeBhatureBadge({ className = '', style, quote = 'Sunday morning breakfast done right!' }: StickerProps) {
  return (
    <StickerContainer quote={quote} className={className} style={style}>
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 sm:border-3 border-[#171515] bg-[#E3A857] text-[#171515] font-black text-xs uppercase tracking-wider ride-pop-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="13" rx="9" ry="6" />
          <path d="M12 3a4 4 0 0 0-4 4" />
          <path d="M16 4a4 4 0 0 0-4 3" />
        </svg>
        <span>CHHOLE BHATURE • ONION</span>
      </div>
    </StickerContainer>
  );
}

export function LotusTempleBadge({ className = '', style, quote = 'Total calm and peace in the city.' }: StickerProps) {
  return (
    <StickerContainer quote={quote} className={className} style={style}>
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 sm:border-3 border-[#171515] bg-[#4D8076] text-white font-black text-xs uppercase tracking-wider ride-pop-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3c-1.5 3-4 6-8 8 3 2 6 2 8 0 2 2 5 2 8 0-4-2-6.5-5-8-8z" />
          <path d="M12 21v-8" />
        </svg>
        <span>LOTUS TEMPLE • SHANTI</span>
      </div>
    </StickerContainer>
  );
}

export function RedFortBadge({ className = '', style, quote = 'Shehar-e-Dilli ki shaan!' }: StickerProps) {
  return (
    <StickerContainer quote={quote} className={className} style={style}>
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 sm:border-3 border-[#171515] bg-[#A91D22] text-white font-black text-xs uppercase tracking-wider ride-pop-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 20h20" />
          <path d="M4 20V8l2-2 2 2v12" />
          <path d="M16 20V8l2-2 2 2v12" />
          <path d="M8 20V6l4-3 4 3v14" />
          <path d="M10 14h4v6h-4z" />
        </svg>
        <span>LAL QILA • LAHORI GATE</span>
      </div>
    </StickerContainer>
  );
}

export function IndiaGateIceCreamBadge({ className = '', style, quote = 'Post-midnight Choc-bar with fellowship!' }: StickerProps) {
  return (
    <StickerContainer quote={quote} className={className} style={style}>
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 sm:border-3 border-[#171515] bg-[#3B2F2F] text-[#FDFBF7] font-black text-xs uppercase tracking-wider ride-pop-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="7" y="3" width="10" height="12" rx="5" />
          <line x1="12" y1="15" x2="12" y2="21" />
        </svg>
        <span>INDIA GATE • MIDNIGHT ICE CREAM</span>
      </div>
    </StickerContainer>
  );
}

export function CycleRickshawBadge({ className = '', style, quote = 'Chandni chowk ki tang galiyan!' }: StickerProps) {
  return (
    <StickerContainer quote={quote} className={className} style={style}>
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 sm:border-3 border-[#171515] bg-[#00818A] text-white font-black text-xs uppercase tracking-wider ride-pop-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="5.5" cy="17.5" r="3.5" />
          <circle cx="18.5" cy="17.5" r="3.5" />
          <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h4" />
        </svg>
        <span>PURANI DILLI • CYCLE RICKSHAW</span>
      </div>
    </StickerContainer>
  );
}

export function DilliMeriJaanHeartBadge({ className = '', style, quote = 'Rotaract District 3011 welcoming the nation!' }: StickerProps) {
  return (
    <StickerContainer quote={quote} className={className} style={style}>
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 sm:border-3 border-[#171515] bg-[#FF007F] text-white font-black text-xs uppercase tracking-wider ride-pop-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <span>DILLI MERI JAAN • RID 3011</span>
      </div>
    </StickerContainer>
  );
}

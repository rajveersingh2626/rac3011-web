import React from 'react';

export function AutoRickshawBadge({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      style={style}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-[#171515] bg-[#59A835] text-white font-bold text-xs uppercase tracking-wider ride-pop-sm select-none ${className}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.1 2 11.5 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <path d="M9 17h6" />
        <circle cx="17" cy="17" r="2" />
      </svg>
      <span>CNG AUTO • METER SE</span>
    </div>
  );
}

export function ChaiKulhadBadge({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      style={style}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-[#171515] bg-[#EA6623] text-white font-bold text-xs uppercase tracking-wider ride-pop-sm select-none ${className}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
        <line x1="6" y1="2" x2="6" y2="4" />
        <line x1="10" y1="2" x2="10" y2="4" />
        <line x1="14" y1="2" x2="14" y2="4" />
      </svg>
      <span>KULHAD CHAI • TAPRI 3011</span>
    </div>
  );
}

export function MetroCardBadge({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      style={style}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-[#171515] bg-[#0084B4] text-white font-bold text-xs uppercase tracking-wider ride-pop-sm select-none ${className}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="13" x="3" y="4" rx="2" />
        <path d="M3 9h18" />
        <circle cx="7" cy="14" r="1" />
        <circle cx="17" cy="14" r="1" />
      </svg>
      <span>DMRC METRO PASS</span>
    </div>
  );
}

export function IndiaGateBadge({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      style={style}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-[#171515] bg-[#C72425] text-white font-bold text-xs uppercase tracking-wider ride-pop-sm select-none ${className}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
        <path d="M9 21v-7a3 3 0 0 1 6 0v7" />
        <line x1="3" y1="7" x2="21" y2="7" />
      </svg>
      <span>INDIA GATE • 1931</span>
    </div>
  );
}

export function DilliDilwalonKiBadge({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      style={style}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 border-[#171515] bg-[#19539D] text-white font-bold text-xs tracking-wider ride-pop-sm select-none ${className}`}
    >
      <span className="w-2.5 h-2.5 rounded-full bg-[#EA6623] animate-ping" />
      <span className="font-amita font-bold text-sm">दिल्ली दिलवालों की</span>
    </div>
  );
}

export function DMRCTokenBadge({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      style={style}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 sm:border-3 border-[#171515] bg-[#0084B4] text-white font-black text-xs uppercase tracking-wider ride-pop-sm select-none hover:scale-105 transition-transform duration-200 cursor-default ${className}`}
    >
      <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center text-[9px] font-bold">M</div>
      <span>DMRC TOKEN • UNLIMITED</span>
    </div>
  );
}

export function ChandniChowkBadge({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      style={style}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 sm:border-3 border-[#171515] bg-[#FBC02D] text-[#171515] font-black text-xs uppercase tracking-wider ride-pop-sm select-none hover:scale-105 transition-transform duration-200 cursor-default ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m10 15 5-3-5-3v6Z" />
      </svg>
      <span>CHANDNI CHOWK • JALEBI</span>
    </div>
  );
}

export function ParantheWaliGaliBadge({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      style={style}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 sm:border-3 border-[#171515] bg-[#EA6623] text-white font-black text-xs uppercase tracking-wider ride-pop-sm select-none hover:scale-105 transition-transform duration-200 cursor-default ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
      <span>PARANTHE WALI GALI</span>
    </div>
  );
}

export function QutubMinarBadge({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      style={style}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 sm:border-3 border-[#171515] bg-[#C72425] text-white font-black text-xs uppercase tracking-wider ride-pop-sm select-none hover:scale-105 transition-transform duration-200 cursor-default ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="22" x2="16" y2="22" />
        <line x1="9" y1="18" x2="15" y2="18" />
        <line x1="10" y1="14" x2="14" y2="14" />
        <line x1="11" y1="10" x2="13" y2="10" />
        <polygon points="12 2 10 22 14 22" />
      </svg>
      <span>QUTUB MINAR • 1192 AD</span>
    </div>
  );
}

export function HauzKhasBadge({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      style={style}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 sm:border-3 border-[#171515] bg-[#19539D] text-white font-black text-xs uppercase tracking-wider ride-pop-sm select-none hover:scale-105 transition-transform duration-200 cursor-default ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h16" />
        <path d="M4 18h16" />
        <path d="M9 14v4" />
        <path d="M15 14v4" />
        <path d="M4 14h16V6l-8-4-8 4v8z" />
      </svg>
      <span>HAUZ KHAS • SUNSET</span>
    </div>
  );
}


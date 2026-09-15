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

import { FC } from 'react';
import { Sparkles, ArrowLeft, ShieldCheck, HeartHandshake } from 'lucide-react';

export interface UpcomingSubdomainPageProps {
  title: string;
  category: string;
  tagline: string;
  description: string;
  accentColor?: string;
  badge?: string;
}

export const UpcomingSubdomainPage: FC<UpcomingSubdomainPageProps> = ({
  title,
  category,
  tagline,
  description,
  accentColor = '#123499',
  badge = 'UPCOMING RY 2026-27 INITIATIVE',
}) => {
  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">
      {/* Dynamic ambient background glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
        style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 right-10 w-[450px] h-[450px] rounded-full opacity-15 blur-[100px]"
        style={{ background: 'radial-gradient(circle, #E11D74 0%, transparent 70%)' }}
      />

      <div className="relative z-10 mx-auto max-w-2xl flex flex-col items-center">
        {/* District Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-line-accent bg-surface/80 px-4 py-1.5 backdrop-blur-md shadow-sm mb-6">
          <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[11.5px] font-extrabold uppercase tracking-[1.5px] text-accent">
            {badge}
          </span>
        </div>

        {/* Category */}
        <p className="m-0 text-[13px] font-bold uppercase tracking-[2px] text-fg-3 mb-2">
          {category}
        </p>

        {/* Large Bold Title */}
        <h1 className="m-0 text-4xl sm:text-6xl font-black tracking-tight text-fg leading-tight">
          {title}
        </h1>

        {/* Tagline */}
        <p className="mt-4 text-lg sm:text-xl font-semibold text-accent max-w-xl">
          {tagline}
        </p>

        {/* Description */}
        <p className="mt-4 text-[14.5px] sm:text-[15.5px] text-fg-2 leading-relaxed max-w-lg">
          {description}
        </p>

        {/* Feature Highlights Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
          <div className="rounded-[16px] border border-line-accent bg-surface/60 p-5 backdrop-blur-sm shadow-sm flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="m-0 text-[13.5px] font-bold text-fg">District Flagship Launch</p>
              <p className="m-0 mt-1 text-[12px] text-fg-3">
                Full portal interface and real-time trackers arriving with the 2026–27 District Calendar.
              </p>
            </div>
          </div>

          <div className="rounded-[16px] border border-line-accent bg-surface/60 p-5 backdrop-blur-sm shadow-sm flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <HeartHandshake size={20} />
            </div>
            <div>
              <p className="m-0 text-[13.5px] font-bold text-fg">Club Participation</p>
              <p className="m-0 mt-1 text-[12px] text-fg-3">
                Project guidelines, bidding rubrics, and participation tools will open for all 3011 clubs.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-[12px] bg-accent px-5 py-3 text-[13.5px] font-bold text-white shadow-sm transition hover:opacity-95"
          >
            <ArrowLeft size={16} /> Return to Main District Website
          </a>
          <a
            href="/portal"
            className="inline-flex items-center gap-2 rounded-[12px] border border-line-accent bg-surface px-5 py-3 text-[13.5px] font-bold text-fg shadow-sm transition hover:bg-page"
          >
            <ShieldCheck size={16} /> Access Member Portal
          </a>
        </div>
      </div>
    </div>
  );
};

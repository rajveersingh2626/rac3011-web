import { useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ShieldCheck, Calendar, MapPin, CheckCircle2, 
  ExternalLink, AlertTriangle, ArrowLeft, Sparkles, User, Building
} from 'lucide-react';
import { fetchPublicPass } from '@/lib/events/checkinApi';

export function PublicEventPassPage() {
  const { token } = useParams<{ token: string }>();

  const { data: pass, isLoading, error, refetch } = useQuery({
    queryKey: ['public-pass', token],
    queryFn: () => fetchPublicPass(token!),
    enabled: Boolean(token),
    retry: 1,
  });

  useEffect(() => {
    if (pass?.event?.title) {
      document.title = `Event Pass: ${pass.event.title} • Rotaract District 3011`;
    } else {
      document.title = 'Event Entry Pass • Rotaract District 3011';
    }
  }, [pass]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-3xl border-2 border-[#171515] bg-white p-8 shadow-md text-center space-y-4">
          <div className="size-16 rounded-full border-4 border-t-[#EA6623] border-neutral-200 animate-spin mx-auto" />
          <h3 className="text-base font-black text-[#171515] uppercase tracking-wide">
            Verifying Cryptographic Pass
          </h3>
          <p className="text-xs text-neutral-500">
            Validating single-use signature against District 3011 key registry…
          </p>
        </div>
      </div>
    );
  }

  if (error || !pass) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-3xl border-3 border-[#171515] bg-white p-8 shadow-[6px_6px_0px_#171515] text-center space-y-4">
          <div className="size-14 rounded-2xl bg-red-100 border-2 border-red-400 flex items-center justify-center mx-auto text-red-600">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-lg font-black uppercase text-[#171515]">
            Invalid or Expired Pass
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            This digital entry pass could not be authenticated. The link may have expired or was formatted incorrectly.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => void refetch()}
              className="w-full py-2.5 rounded-xl border-2 border-[#171515] bg-[#19539D] text-white text-xs font-black uppercase hover:bg-blue-800 transition-colors"
            >
              Retry Verification
            </button>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900"
            >
              <ArrowLeft size={14} />
              <span>Return to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { event, attendee, isCheckedIn, checkedInAt, googleWalletUrl } = pass;
  const eventDate = new Date(event.startsAt).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#171515] flex flex-col items-center justify-center py-8 px-4 sm:px-6">
      {/* Container simulating a physical boarding pass */}
      <div className="w-full max-w-md rounded-3xl border-3 border-[#171515] bg-white shadow-[8px_8px_0px_#171515] overflow-hidden">
        
        {/* Pass Top Branding Bar */}
        <div className="bg-[#FBC02D] border-b-3 border-[#171515] px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/ride/logos/2026_logo_coloured.png"
              alt="Logo"
              className="h-7 w-auto object-contain"
              onError={(e) => {
                // Fallback to district logo
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="text-[11px] font-black uppercase tracking-wider text-[#171515]">
              ROTARACT DISTRICT 3011
            </span>
          </div>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-[#171515] bg-white">
            Official Pass
          </span>
        </div>

        {/* Verification Status Header */}
        <div className="px-6 pt-5 pb-3 border-b-2 border-neutral-100 flex items-center justify-between">
          {isCheckedIn ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-emerald-600 bg-emerald-50 text-emerald-800 text-xs font-black">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Attended &bull; {checkedInAt ? new Date(checkedInAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Verified'}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-blue-600 bg-blue-50 text-blue-800 text-xs font-black">
              <Sparkles size={14} className="text-blue-600" />
              <span>Valid Gate Pass</span>
            </div>
          )}

          <div className="text-[11px] font-mono font-bold text-neutral-400">
            SECURE #{pass.token.slice(-6).toUpperCase()}
          </div>
        </div>

        {/* Event Title & Details */}
        <div className="px-6 py-4">
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#171515] leading-tight">
            {event.title}
          </h1>

          <div className="mt-4 space-y-2 text-xs font-bold text-neutral-700">
            <div className="flex items-center gap-2.5">
              <Calendar size={15} className="text-[#EA6623] shrink-0" />
              <span>{eventDate} IST</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2.5">
                <MapPin size={15} className="text-[#C72425] shrink-0" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* High-Contrast QR Code Verification Matrix */}
        <div className="relative mx-6 my-2 rounded-2xl border-2 border-[#171515] bg-[#FDFBF7] p-6 flex flex-col items-center justify-center shadow-inner">
          <div className="rounded-xl border-2 border-[#171515] bg-white p-3 shadow-md">
            <QRCodeSVG
              value={pass.token}
              size={200}
              level="M"
              includeMargin={false}
            />
          </div>

          <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mt-3 text-center">
            Scan at entry terminal for instant check-in
          </p>
        </div>

        {/* Attendee Credentials Card */}
        <div className="px-6 py-4 border-t-2 border-dashed border-neutral-200 bg-neutral-50/50">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-0.5">
                Attendee Name
              </span>
              <div className="flex items-center gap-1.5 font-black text-neutral-900 truncate">
                <User size={13} className="text-neutral-500 shrink-0" />
                <span className="truncate">{attendee.fullName}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-0.5">
                Affiliation / Club
              </span>
              <div className="flex items-center gap-1.5 font-bold text-neutral-800 truncate">
                <Building size={13} className="text-neutral-500 shrink-0" />
                <span className="truncate">{attendee.clubName || `District ${attendee.district || '3011'}`}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons & Google Wallet Link */}
        <div className="p-6 border-t-3 border-[#171515] bg-white space-y-3">
          {googleWalletUrl && (
            <a
              href={googleWalletUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-black bg-black text-white text-xs font-black uppercase tracking-wider shadow hover:bg-neutral-800 transition-colors"
            >
              <ExternalLink size={14} />
              <span>Add to Google Wallet</span>
            </a>
          )}

          {/* Fast track instruction */}
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-2.5 text-center text-[11px] font-bold text-amber-900 leading-snug">
            💡 <strong>Fast-Track Tip:</strong> Turn your screen brightness to maximum before approaching the entry scanner.
          </div>
        </div>

        {/* Cryptographic Footer */}
        <div className="bg-[#171515] text-white px-6 py-2.5 text-center flex items-center justify-center gap-2 text-[10px] font-bold tracking-wider uppercase">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>Single-use anti-replay cryptographic ticket</span>
        </div>
      </div>

      <p className="mt-4 text-[11px] font-semibold text-neutral-400 text-center">
        Rotaract District 3011 &bull; Delhi Meri Jaan Youth Exchange
      </p>
    </div>
  );
}

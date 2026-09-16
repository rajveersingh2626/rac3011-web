import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { ArrowLeft, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '@/app/auth';
import { apiFetch, ApiError } from '@/lib/api';
import { useDocumentMeta } from '@/lib/meta';
import { Button } from '@/components/ui/Button';

export function RideParticipantLoginPage() {
  useDocumentMeta({ title: 'Participant Sign In • Delhi Meri Jaan 2026' });
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { status, refresh } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (status === 'authenticated') {
      const next = params.get('next') || '/dashboard';
      navigate(next, { replace: true });
    }
  }, [status, navigate, params]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      let emailToUse = email.trim();
      if (!emailToUse.includes('@')) {
        try {
          const resolved = await apiFetch<{ email: string }>(
            `/auth-lookup/resolve?identifier=${encodeURIComponent(emailToUse)}`,
          );
          if (resolved?.email) {
            emailToUse = resolved.email;
          }
        } catch {
          // ignore lookup error, proceed with emailToUse
        }
      }

      await apiFetch('/auth/sign-in/email', {
        method: 'POST',
        body: { email: emailToUse, password: password.trim() },
      });

      await refresh();
      const next = params.get('next') || '/dashboard';
      navigate(next, { replace: true });
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : (err?.message || 'Invalid email or password. Please verify your credentials.'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#171515] flex flex-col justify-between selection:bg-[#EA6623] selection:text-white font-ride-sans relative overflow-hidden">
      {/* Background Subtle Heritage Motif */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#171515_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top Header Bar */}
      <header className="p-4 sm:p-6 flex items-center justify-between relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase text-neutral-700 hover:text-[#EA6623] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Delhi Meri Jaan</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-500 hidden sm:inline">Rotary International District 3011</span>
        </div>
      </header>

      {/* Central Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md bg-white rounded-3xl border-3 border-[#171515] ride-pop-lg p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Top Decorative Pill */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-block">
              <img
                src="/ride/logos/2026_logo_coloured.png?v=2"
                alt="Delhi Meri Jaan Official Emblem"
                className="h-14 sm:h-16 w-auto mx-auto object-contain transition-transform hover:scale-105"
              />
            </Link>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#171515] bg-[#FBC02D] text-[#171515] text-[10px] font-black uppercase tracking-wider mt-3 ride-pop-sm">
              <Sparkles size={12} />
              <span>Participant & Club Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#171515] mt-2">
              Sign In to Your Dossier
            </h1>
            <p className="text-xs text-neutral-600 mt-1 font-medium">
              Access your confirmation form, host allocation details, and transit guides.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border-2 border-red-500 text-red-950 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-700">
                Email Address or Rotary ID
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="delegate@rotaract.org or Rotary ID"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-neutral-300 text-xs font-medium focus:outline-none focus:border-[#19539D] focus:ring-1 focus:ring-[#19539D] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-700">
                Access Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-neutral-300 text-xs font-medium focus:outline-none focus:border-[#19539D] focus:ring-1 focus:ring-[#19539D] transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full py-3 rounded-xl bg-[#EA6623] hover:bg-orange-600 text-white font-black text-sm uppercase tracking-wider ride-pop-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Access Participant Portal</span>
              <ArrowRight size={16} />
            </Button>
          </form>

          {/* Secure Portal Guarantee Note */}
          <div className="mt-6 pt-4 border-t border-neutral-200 text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-neutral-500">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Official Rotaract District 3011 Authentication Gateway</span>
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">
              Need assistance? Contact the RIDE Chair or your district liaison coordinator.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-neutral-500 font-bold relative z-10">
        Rotary International District 3011 · Delhi Meri Jaan 2026
      </footer>
    </div>
  );
}

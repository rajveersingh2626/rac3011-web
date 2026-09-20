import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { ArrowLeft, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, Sparkles, X, CheckCircle } from 'lucide-react';
import { useParticipantAuth } from '@/lib/ride/participantAuth';
import { apiFetch, ApiError } from '@/lib/api';
import { useDocumentMeta } from '@/lib/meta';
import { Button } from '@/components/ui/Button';

export function RideParticipantLoginPage() {
  useDocumentMeta({ title: 'Participant Sign In • Delhi Meri Jaan 2026' });
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { status, login } = useParticipantAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // If already authenticated as a participant, redirect to dashboard
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
      await login(email.trim(), password.trim());
      const next = params.get('next') || '/dashboard';
      navigate(next, { replace: true });
    } catch (err: any) {
      setError(
        err instanceof ApiError
          ? err.message
          : err?.message || 'Invalid credentials or participant account not found. Please contact RIDE administration.',
      );
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (!forgotIdentifier.trim()) {
      setForgotError('Please enter your registered email or Rotary ID.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await apiFetch<{ success: boolean; message: string }>('/ride/auth/forgot-password', {
        method: 'POST',
        body: { identifier: forgotIdentifier.trim() },
      });
      setForgotSuccess(res?.message || 'If an account matches our records, a password reset link has been dispatched to your email.');
    } catch (err: any) {
      setForgotError(err instanceof ApiError ? err.message : err?.message || 'Failed to request password reset link.');
    } finally {
      setForgotLoading(false);
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

            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotError(null);
                  setForgotSuccess(null);
                  setForgotIdentifier(email);
                }}
                className="text-[11px] font-bold text-[#EA6623] hover:underline cursor-pointer transition-colors"
              >
                Forgot your password?
              </button>
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

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl border-3 border-[#171515] ride-pop-lg p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="absolute right-4 top-4 text-neutral-400 hover:text-[#171515] p-1 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-left mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#171515] bg-[#FBC02D] text-[#171515] text-[10px] font-black uppercase tracking-wider mb-2 ride-pop-sm">
                  <Lock size={12} />
                  <span>Password Assistance</span>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-[#171515]">
                  Reset Participant Password
                </h3>
                <p className="text-xs text-neutral-600 mt-1 font-medium">
                  Enter your registered delegate email or Rotary ID. If an active dossier exists, we'll send a password reset link to your email.
                </p>
              </div>

              {forgotError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border-2 border-red-500 text-red-950 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} className="text-red-600 shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess ? (
                <div className="space-y-4 py-2">
                  <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 text-xs font-bold flex items-start gap-2.5">
                    <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{forgotSuccess}</span>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowForgotModal(false)}
                    className="w-full py-2.5 rounded-xl border-2 border-[#171515] font-black text-xs uppercase tracking-wider"
                  >
                    Close
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-black uppercase tracking-wider text-neutral-700">
                      Email or Rotary ID
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        required
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="delegate@rotaract.org or Rotary ID"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-neutral-300 text-xs font-medium focus:outline-none focus:border-[#19539D] focus:ring-1 focus:ring-[#19539D] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1 py-2.5 rounded-xl border-2 border-neutral-300 text-neutral-700 font-bold text-xs uppercase tracking-wider hover:bg-neutral-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={forgotLoading}
                      className="flex-1 py-2.5 rounded-xl bg-[#EA6623] hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider ride-pop-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Send Link</span>
                      <ArrowRight size={14} />
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-neutral-500 font-bold relative z-10">
        Rotary International District 3011 · Delhi Meri Jaan 2026
      </footer>
    </div>
  );
}

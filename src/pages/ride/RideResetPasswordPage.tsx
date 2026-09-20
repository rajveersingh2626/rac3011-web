import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ArrowLeft, Lock, ArrowRight, AlertCircle, CheckCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { useDocumentMeta } from '@/lib/meta';
import { Button } from '@/components/ui/Button';

export function RideResetPasswordPage() {
  useDocumentMeta({ title: 'Set New Password • Delhi Meri Jaan 2026' });
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Missing or invalid password reset token. Please request a new link.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/ride/auth/reset-password', {
        method: 'POST',
        body: {
          token,
          password,
        },
      });
      setSuccess(true);
    } catch (err: any) {
      setError(
        err instanceof ApiError
          ? err.message
          : err?.message || 'Failed to reset password. The link may have expired.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#171515] flex flex-col justify-between selection:bg-[#EA6623] selection:text-white font-ride-sans relative overflow-hidden">
      {/* Background Motif */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#171515_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Header Bar */}
      <header className="p-4 sm:p-6 flex items-center justify-between relative z-10">
        <Link
          to="/participant-login"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-black uppercase text-neutral-700 hover:text-[#EA6623] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Sign In</span>
        </Link>
        <span className="text-xs font-bold text-neutral-500 hidden sm:inline">Rotary International District 3011</span>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md bg-white rounded-3xl border-3 border-[#171515] ride-pop-lg p-6 sm:p-10 shadow-2xl relative overflow-hidden">
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
              <span>Participant Portal Security</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#171515] mt-2">
              Set New Password
            </h1>
            <p className="text-xs text-neutral-600 mt-1 font-medium">
              Choose a secure password for your delegate dossier account.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border-2 border-red-500 text-red-950 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-600 text-emerald-600 flex items-center justify-center mx-auto ride-pop-sm">
                <CheckCircle size={28} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase text-[#171515]">Password Reset Complete!</h3>
                <p className="text-xs text-neutral-600 mt-1 font-medium">
                  Your credentials have been updated successfully. You can now log into your participant portal.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/participant-login"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#EA6623] hover:bg-orange-600 text-white font-black text-sm uppercase tracking-wider ride-pop-sm transition-colors"
                >
                  <span>Sign In to Participant Portal</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!token && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold">
                  No reset token detected in the URL. If you followed a link from your email, please ensure the entire link was copied.
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-700">
                  New Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-neutral-300 text-xs font-medium focus:outline-none focus:border-[#19539D] focus:ring-1 focus:ring-[#19539D] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-neutral-300 text-xs font-medium focus:outline-none focus:border-[#19539D] focus:ring-1 focus:ring-[#19539D] transition-colors"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={!token}
                className="w-full py-3 rounded-xl bg-[#EA6623] hover:bg-orange-600 text-white font-black text-sm uppercase tracking-wider ride-pop-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Save New Password</span>
                <ArrowRight size={16} />
              </Button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-neutral-200 text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-neutral-500">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Rotaract District 3011 Credential Gateway</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-neutral-500 font-bold relative z-10">
        Rotary International District 3011 · Delhi Meri Jaan 2026
      </footer>
    </div>
  );
}

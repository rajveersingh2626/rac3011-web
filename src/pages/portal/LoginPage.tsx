import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { z } from 'zod';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuth } from '@/app/auth';
import { useDocumentMeta } from '@/lib/meta';
import { Form, useZodForm } from '@/components/ui/Form';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Info, Mail, Hash } from 'lucide-react';

const credentialsSchema = z.object({
  email: z.string().trim().min(1, 'Enter your Rotary ID or email address'),
  password: z.string().min(1, 'Enter your password'),
});

const codeSchema = z.object({
  code: z.string().length(6, 'Enter the 6-digit code'),
  rememberDevice: z.boolean(),
});

type SecondFactorMethod = 'email' | 'totp';

function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => () => clearInterval(timer.current), []);

  const start = (from = seconds) => {
    setRemaining(from);
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      setRemaining((n) => {
        if (n <= 1) {
          clearInterval(timer.current);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
  };

  return { remaining, start };
}

export function LoginPage() {
  useDocumentMeta({ title: 'Club portal sign in' });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refresh } = useAuth();
  const next = searchParams.get('next') ?? '/portal/dashboard';

  const [step, setStep] = useState<'credentials' | 'second-factor'>('credentials');
  const [email, setEmail] = useState('');
  const [method, setMethod] = useState<SecondFactorMethod>('email');
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedIdType, setSelectedIdType] = useState<'rotary_id' | 'email'>('rotary_id');
  const countdown = useCountdown(30);

  const credentials = useZodForm(credentialsSchema, { email: '', password: '' });
  const secondFactor = useZodForm(codeSchema, { code: '', rememberDevice: false });

  const submitCredentials = credentials.handleSubmit(async (values) => {
    setFormError(null);
    try {
      let emailToUse = values.email.trim();
      if (!emailToUse.includes('@')) {
        try {
          const resolved = await apiFetch<{ email: string }>(
            `/auth-lookup/resolve?identifier=${encodeURIComponent(emailToUse)}`,
          );
          if (resolved?.email) {
            emailToUse = resolved.email;
          } else {
            setFormError(`No account found matching Rotary ID "${emailToUse}". Please verify your ID or log in with your email address.`);
            return;
          }
        } catch {
          setFormError(`No account found matching Rotary ID "${emailToUse}". Please verify your ID or log in with your email address.`);
          return;
        }
      }

      // Better-Auth swaps the response shape entirely once an authenticator app is enrolled.
      const res = await apiFetch<{ twoFactorRedirect?: boolean; twoFactorMethods?: string[] }>('/auth/sign-in/email', {
        method: 'POST',
        body: { email: emailToUse, password: values.password },
      });
      const nextMethod: SecondFactorMethod = res.twoFactorRedirect && res.twoFactorMethods?.includes('totp') ? 'totp' : 'email';
      setEmail(emailToUse);
      setMethod(nextMethod);
      setStep('second-factor');
      if (nextMethod === 'email') {
        countdown.start(30);
        // Automatically dispatch verification code to email
        apiFetch('/second-factor/resend', { method: 'POST' }).catch(() => undefined);
      }
    } catch (e) {
      if (e instanceof ApiError && e.details) credentials.setServerErrors(e.details);
      else setFormError(e instanceof ApiError ? e.message : 'Something went wrong. Try again.');
    }
  });

  const submitCode = secondFactor.handleSubmit(async (values) => {
    setFormError(null);
    try {
      // TOTP has no session yet to attach a "second factor" to (better-auth holds it in a separate
      // challenge cookie), so it must complete through better-auth's own endpoint, not ours.
      if (method === 'totp') {
        await apiFetch('/auth/two-factor/verify-totp', { method: 'POST', body: { code: values.code } });
      } else {
        await apiFetch('/second-factor/verify', {
          method: 'POST',
          body: { method, code: values.code, rememberDevice: values.rememberDevice },
        });
      }
      await refresh();
      navigate(next, { replace: true });
    } catch (e) {
      if (e instanceof ApiError && e.details) secondFactor.setServerErrors(e.details);
      else setFormError(e instanceof ApiError ? e.message : 'Something went wrong. Try again.');
    }
  });

  const resend = async () => {
    if (countdown.remaining > 0) return;
    try {
      // The API returns {status:'sent'} with no computed retry-after, so reuse the fixed 30s window.
      await apiFetch('/second-factor/resend', { method: 'POST' });
      countdown.start(30);
    } catch {
      countdown.start(30);
    }
  };

  const isExpired = searchParams.get('reason') === 'expired';

  return (
    <div>
      {isExpired && !formError ? (
        <div className="mb-4">
          <Alert tone="info" title="Session expired">
            Your session expired after 2 hours of inactivity. Please sign in to continue.
          </Alert>
        </div>
      ) : null}
      {formError ? (
        <div className="mb-4">
          <Alert tone="error" title="Sign-in problem">
            {formError}
          </Alert>
        </div>
      ) : null}
      {step === 'credentials' ? (
        <>
          <p className="m-0 mb-2.5 text-[10.5px] font-bold tracking-[1px] text-accent">STEP 1 OF 2</p>
          <h1 className="m-0 mb-2 text-[24px] sm:text-[26px] font-extrabold tracking-tight text-fg">Club portal</h1>
          <p className="m-0 mb-5 text-[13.5px] sm:text-[14px] text-fg-2">For club presidents, secretaries and district officers.</p>

          {/* Touch-Friendly Available Login IDs Guide for Mobile & Desktop */}
          <div className="mb-5 p-3.5 sm:p-4 rounded-xl border border-line-accent bg-neutral-50/90 text-left">
            <div className="flex items-center gap-1.5 mb-2 text-xs font-bold uppercase tracking-wider text-accent">
              <Info size={14} />
              <span>Available Sign-In Identifiers</span>
            </div>
            <p className="text-[12px] text-fg-2 mb-2.5">
              Choose your preferred sign-in method to pre-format the keyboard:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedIdType('rotary_id')}
                className={`p-2.5 sm:p-3 rounded-lg border text-left transition-all min-h-[48px] cursor-pointer flex flex-col justify-between ${
                  selectedIdType === 'rotary_id'
                    ? 'border-accent bg-accent/10 ring-2 ring-accent/25 shadow-sm'
                    : 'border-line bg-white hover:border-line-accent active:bg-neutral-100'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-[12px] sm:text-xs text-fg flex items-center gap-1">
                    <Hash size={13} className="text-accent" />
                    Rotary ID
                  </span>
                  <span className="text-[10px] bg-accent/15 text-accent font-bold px-1.5 py-0.5 rounded font-mono">
                    8 Digits
                  </span>
                </div>
                <div className="text-[11px] text-fg-3 mt-1">e.g. 11545987</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedIdType('email')}
                className={`p-2.5 sm:p-3 rounded-lg border text-left transition-all min-h-[48px] cursor-pointer flex flex-col justify-between ${
                  selectedIdType === 'email'
                    ? 'border-accent bg-accent/10 ring-2 ring-accent/25 shadow-sm'
                    : 'border-line bg-white hover:border-line-accent active:bg-neutral-100'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-[12px] sm:text-xs text-fg flex items-center gap-1">
                    <Mail size={13} className="text-accent" />
                    Email
                  </span>
                  <span className="text-[10px] bg-neutral-200 text-neutral-700 font-bold px-1.5 py-0.5 rounded font-mono">
                    Mail
                  </span>
                </div>
                <div className="text-[11px] text-fg-3 mt-1">Registered address</div>
              </button>
            </div>
          </div>

          <Form onSubmit={submitCredentials} submitting={credentials.submitting}>
            <Field
              label={selectedIdType === 'rotary_id' ? 'Rotary Member ID' : 'Registered Email Address'}
              error={credentials.errors.email}
              required
            >
              <Input
                type={selectedIdType === 'rotary_id' ? 'text' : 'email'}
                inputMode={selectedIdType === 'rotary_id' ? 'numeric' : 'email'}
                autoComplete={selectedIdType === 'rotary_id' ? 'off' : 'username'}
                placeholder={
                  selectedIdType === 'rotary_id'
                    ? 'Enter your 8-digit Rotary ID (e.g. 11545987)'
                    : 'Enter your registered email address'
                }
                value={credentials.values.email}
                onChange={(e) => credentials.setValue('email', e.target.value)}
              />
            </Field>
            <Field
              label={
                <span className="flex w-full items-center justify-between">
                  <span>Password</span>
                  <Link to="/portal/forgot-password" className="font-normal text-[12px] text-accent hover:underline">
                    Forgot password?
                  </Link>
                </span>
              }
              error={credentials.errors.password}
              required
            >
              <Input
                type="password"
                autoComplete="current-password"
                value={credentials.values.password}
                onChange={(e) => credentials.setValue('password', e.target.value)}
              />
            </Field>
            <Button type="submit" block loading={credentials.submitting}>
              Continue
            </Button>
          </Form>
          <p className="mt-6 text-center text-[13px] text-fg-2">
            Need to set up your account?{' '}
            <Link to="/portal/register" className="font-bold text-accent hover:underline">
              Join your club
            </Link>
          </p>
        </>
      ) : (
        <>
          <p className="m-0 mb-6 flex items-center gap-2 text-[12.5px] font-semibold text-fg-2">{email}</p>
          <p className="m-0 mb-2.5 text-[10.5px] font-bold tracking-[1px] text-accent">STEP 2 OF 2</p>
          <h1 className="m-0 mb-2 text-[22px] font-extrabold tracking-tight text-fg">
            {method === 'totp' ? 'Enter your authenticator code' : 'Check your email'}
          </h1>
          <p className="m-0 mb-6 text-[13.5px] text-fg-2">
            {method === 'totp' ? (
              'Open your authenticator app and enter the current 6-digit code.'
            ) : (
              <>
                We&apos;ve sent a six-digit code to <span className="font-bold text-fg">{email}</span>. It&apos;s valid for ten minutes.
              </>
            )}
          </p>
          <Form onSubmit={submitCode} submitting={secondFactor.submitting}>
            <Field label="6-digit code" error={secondFactor.errors.code} required>
              <Input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={secondFactor.values.code}
                onChange={(e) => secondFactor.setValue('code', e.target.value.replace(/\D/g, ''))}
              />
            </Field>
            {method === 'email' ? (
              <p className="m-0 text-[12px] text-fg-2">
                Didn&apos;t arrive?{' '}
                <button
                  type="button"
                  onClick={() => void resend()}
                  disabled={countdown.remaining > 0}
                  className="font-bold text-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Send it again
                </button>{' '}
                {countdown.remaining > 0 ? `in 0:${String(countdown.remaining).padStart(2, '0')}` : null}
              </p>
            ) : null}
            {method === 'email' ? (
              <Checkbox
                label="Stay signed in on this device for 2 hours"
                checked={secondFactor.values.rememberDevice}
                onChange={(e) => secondFactor.setValue('rememberDevice', e.target.checked)}
              />
            ) : null}
            <Button type="submit" block loading={secondFactor.submitting}>
              Sign in
            </Button>
          </Form>
        </>
      )}
    </div>
  );
}

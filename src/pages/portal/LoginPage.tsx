import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
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

const credentialsSchema = z.object({
  email: z.string().min(1, 'Enter the email you registered with').email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

const codeSchema = z.object({
  code: z.string().length(6, 'Enter the 6-digit code'),
  rememberDevice: z.boolean(),
});

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
  const [formError, setFormError] = useState<string | null>(null);
  const countdown = useCountdown(30);

  const credentials = useZodForm(credentialsSchema, { email: '', password: '' });
  const secondFactor = useZodForm(codeSchema, { code: '', rememberDevice: false });

  const submitCredentials = credentials.handleSubmit(async (values) => {
    setFormError(null);
    try {
      // Every account goes through this second factor, and only email OTP is wired up in this UI
      // (no TOTP toggle exists here), so `method` never needs to come from the sign-in response.
      await apiFetch('/auth/sign-in/email', { method: 'POST', body: values });
      setEmail(values.email);
      setStep('second-factor');
      countdown.start(30);
    } catch (e) {
      if (e instanceof ApiError && e.details) credentials.setServerErrors(e.details);
      else setFormError(e instanceof ApiError ? e.message : 'Something went wrong. Try again.');
    }
  });

  const submitCode = secondFactor.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await apiFetch('/second-factor/verify', {
        method: 'POST',
        body: { method: 'email', code: values.code, rememberDevice: values.rememberDevice },
      });
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4 py-10">
      <div className="w-full max-w-[430px] rounded-[16px] border border-line-accent bg-surface p-8 shadow-raised">
        <img src="/district-logo.png" alt="Rotaract District Organization 3011" className="mb-6 h-8 w-auto" />
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
            <h1 className="m-0 mb-2 text-[22px] font-extrabold tracking-tight text-fg">Club portal</h1>
            <p className="m-0 mb-6 text-[13.5px] text-fg-2">For club presidents, secretaries and district officers.</p>
            <Form onSubmit={submitCredentials} submitting={credentials.submitting}>
              <Field label="Rotary ID or email" error={credentials.errors.email} required>
                <Input
                  type="email"
                  autoComplete="username"
                  value={credentials.values.email}
                  onChange={(e) => credentials.setValue('email', e.target.value)}
                />
              </Field>
              <Field label="Password" error={credentials.errors.password} required>
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
          </>
        ) : (
          <>
            <p className="m-0 mb-6 flex items-center gap-2 text-[12.5px] font-semibold text-fg-2">{email}</p>
            <p className="m-0 mb-2.5 text-[10.5px] font-bold tracking-[1px] text-accent">STEP 2 OF 2</p>
            <h1 className="m-0 mb-2 text-[22px] font-extrabold tracking-tight text-fg">Check your email</h1>
            <p className="m-0 mb-6 text-[13.5px] text-fg-2">
              We&apos;ve sent a six-digit code to <span className="font-bold text-fg">{email}</span>. It&apos;s valid for ten minutes.
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
              <Checkbox
                label="Stay signed in on this device for 5 hours"
                checked={secondFactor.values.rememberDevice}
                onChange={(e) => secondFactor.setValue('rememberDevice', e.target.checked)}
              />
              <Button type="submit" block loading={secondFactor.submitting}>
                Sign in
              </Button>
            </Form>
          </>
        )}
      </div>
    </div>
  );
}

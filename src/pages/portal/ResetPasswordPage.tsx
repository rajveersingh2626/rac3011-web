import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { z } from 'zod';
import { CheckCircle, Lock } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { useDocumentMeta } from '@/lib/meta';
import { Form, useZodForm } from '@/components/ui/Form';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Use at least 8 characters'),
    confirmPassword: z.string().min(8, 'Use at least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function ResetPasswordPage() {
  useDocumentMeta({ title: 'Set New Password — District 3011' });
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useZodForm(resetPasswordSchema, { password: '', confirmPassword: '' });

  const submit = form.handleSubmit(async (values) => {
    setFormError(null);
    if (!token) {
      setFormError('Missing reset token. Please use the link provided in your email.');
      return;
    }

    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: {
          newPassword: values.password,
          token,
        },
      });
      setSuccess(true);
    } catch (e) {
      if (e instanceof ApiError && e.details) form.setServerErrors(e.details);
      else setFormError(e instanceof ApiError ? e.message : 'Invalid or expired reset token. Please request a new link.');
    }
  });

  return (
    <div className="w-full">
      {formError && (
        <div className="mb-4">
          <Alert tone="error" title="Reset error">
            {formError}
          </Alert>
        </div>
      )}

      {success ? (
        <div className="rounded-xl border border-border bg-surface-1 p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckCircle size={24} />
          </div>
          <h2 className="m-0 mb-2 text-[20px] font-extrabold text-fg">Password updated!</h2>
          <p className="m-0 mb-6 text-[13.5px] text-fg-2">
            Your District 3011 portal password has been successfully reset. You can now sign in with your new password.
          </p>
          <Link to="/portal/login">
            <Button className="w-full">Sign in to Portal</Button>
          </Link>
        </div>
      ) : (
        <>
          <h1 className="m-0 mb-2 text-[22px] font-extrabold tracking-tight text-fg">Set a new password</h1>
          <p className="m-0 mb-6 text-[13.5px] text-fg-2">
            Choose a strong password with at least 8 characters.
          </p>

          {!token && (
            <div className="mb-4">
              <Alert tone="warning" title="No token found">
                This link appears incomplete. Please click the exact reset link sent to your email, or request a new one below.
              </Alert>
            </div>
          )}

          <Form onSubmit={submit} submitting={form.submitting}>
            <Field label="New password" error={form.errors.password} required hint="At least 8 characters">
              <div className="relative">
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={form.values.password}
                  onChange={(e) => form.setValue('password', e.target.value)}
                />
                <Lock size={15} className="pointer-events-none absolute right-3 top-3 text-fg-3" />
              </div>
            </Field>

            <Field label="Confirm new password" error={form.errors.confirmPassword} required>
              <div className="relative">
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={form.values.confirmPassword}
                  onChange={(e) => form.setValue('confirmPassword', e.target.value)}
                />
                <Lock size={15} className="pointer-events-none absolute right-3 top-3 text-fg-3" />
              </div>
            </Field>

            <Button type="submit" block loading={form.submitting} disabled={!token}>
              Update password
            </Button>
          </Form>

          <p className="mt-6 text-center text-[13px] text-fg-2">
            Remembered your password?{' '}
            <Link to="/portal/login" className="font-bold text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

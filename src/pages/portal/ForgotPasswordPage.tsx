import { useState } from 'react';
import { Link } from 'react-router';
import { z } from 'zod';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { useDocumentMeta } from '@/lib/meta';
import { Form, useZodForm } from '@/components/ui/Form';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, 'Enter your email').email('Enter a valid email address'),
});

export function ForgotPasswordPage() {
  useDocumentMeta({ title: 'Forgot Password — District 3011' });
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const form = useZodForm(forgotPasswordSchema, { email: '' });

  const submit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      await apiFetch('/auth/request-password-reset', {
        method: 'POST',
        body: {
          email: values.email,
          redirectTo: '/portal/reset-password',
        },
      });
      setSubmittedEmail(values.email);
    } catch (e) {
      if (e instanceof ApiError && e.details) form.setServerErrors(e.details);
      else setFormError(e instanceof ApiError ? e.message : 'Could not send reset link. Try again.');
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

      {submittedEmail ? (
        <div className="rounded-xl border border-border bg-surface-1 p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckCircle size={24} />
          </div>
          <h2 className="m-0 mb-2 text-[20px] font-extrabold text-fg">Check your inbox</h2>
          <p className="m-0 mb-4 text-[13.5px] text-fg-2">
            If an account exists for <strong className="text-fg">{submittedEmail}</strong>, we have sent a password
            reset link. Please check your email and click the button to set your new password.
          </p>
          <div className="mt-6">
            <Link to="/portal/login">
              <Button variant="secondary" className="w-full">
                Back to sign in
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <Link
            to="/portal/login"
            className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-fg-3 hover:text-fg"
          >
            <ArrowLeft size={14} /> Back to sign in
          </Link>

          <h1 className="m-0 mb-2 text-[22px] font-extrabold tracking-tight text-fg">Reset your password</h1>
          <p className="m-0 mb-6 text-[13.5px] text-fg-2">
            Enter the email address registered with your District 3011 account, and we will send you a password reset link.
          </p>

          <Form onSubmit={submit} submitting={form.submitting}>
            <Field label="Your registered email" error={form.errors.email} required>
              <div className="relative">
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="president.rotaract3011@gmail.com"
                  value={form.values.email}
                  onChange={(e) => form.setValue('email', e.target.value)}
                />
                <Mail size={15} className="pointer-events-none absolute right-3 top-3 text-fg-3" />
              </div>
            </Field>

            <Button type="submit" block loading={form.submitting}>
              Send password reset link
            </Button>
          </Form>
        </>
      )}
    </div>
  );
}

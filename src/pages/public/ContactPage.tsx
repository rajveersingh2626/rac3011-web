import { useState } from 'react';
import { z } from 'zod';
import { useDocumentMeta } from '@/lib/meta';
import { useContentQuery, richTextOf, textOf } from '@/lib/publicApi/content';
import { postEnquiry } from '@/lib/publicApi/enquiries';
import { ApiError } from '@/lib/api';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { RichText } from '@/components/public/RichText';
import { Form, useZodForm } from '@/components/ui/Form';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { Checkbox } from '@/components/ui/Checkbox';
import { ShieldCheck } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().trim().max(200).optional(),
  email: z.string().trim().email('Enter a valid email address').optional(),
  message: z.string().trim().min(1, 'Tell us what this is about'),
  website: z.string(),
});

export function ContactPage() {
  useDocumentMeta({ title: 'Contact & Grievances', description: 'Reach the district secretariat.' });
  const content = useContentQuery('contact');
  const [sent, setSent] = useState<string | null>(null);
  const [anonymous, setAnonymous] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useZodForm(contactSchema, { name: '', email: '', message: '', website: '' });

  const submit = form.handleSubmit(async (values) => {
    setFormError(null);
    if (!anonymous && (!values.name || !values.name.trim())) {
      setFormError('Please enter your name or check "Submit anonymously".');
      return;
    }
    if (!anonymous && (!values.email || !values.email.trim())) {
      setFormError('Please enter your email or check "Submit anonymously".');
      return;
    }

    try {
      const res = await postEnquiry({
        kind: 'contact',
        name: anonymous ? 'Anonymous' : values.name,
        email: anonymous ? 'anonymous@rotaract3011.org' : values.email,
        message: values.message,
        anonymous,
        website: values.website,
      });
      setSent(res.routedTo ?? 'the district secretariat');
      form.reset();
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'Something went wrong. Try again.');
    }
  });

  const intro = richTextOf(content.data, 'intro');
  const address = textOf(content.data, 'address');

  return (
    <Container className="py-8" width="narrow">
      <Section align="center" eyebrow="District 3011" title="Contact">
        {content.isPending ? (
          <Skeleton lines={3} className="mb-6" />
        ) : (
          <div className="mb-6">
            {intro ? <RichText html={intro} /> : null}
            {address ? <p className="mt-2 text-[13px] font-bold text-fg">{address}</p> : null}
          </div>
        )}

        {sent ? (
          <Alert tone="action" title="Message sent">
            We've routed your message to {sent}. Expect a reply within a few working days.
          </Alert>
        ) : (
          <Form onSubmit={submit} submitting={form.submitting}>
            {formError ? (
              <Alert tone="error" title="Couldn't send that">
                {formError}
              </Alert>
            ) : null}
            <div className="mb-4">
              <Checkbox
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                label={
                  <span className="text-xs font-semibold text-fg flex items-center gap-1.5">
                    <ShieldCheck className="size-4 text-accent" />
                    Submit anonymously (grievance or confidential message)
                  </span>
                }
              />
            </div>

            {!anonymous && (
              <>
                <Field label="Your name" error={form.errors.name} required>
                  <Input value={form.values.name} onChange={(e) => form.setValue('name', e.target.value)} />
                </Field>
                <Field label="Email" error={form.errors.email} required>
                  <Input type="email" value={form.values.email} onChange={(e) => form.setValue('email', e.target.value)} />
                </Field>
              </>
            )}
            <Field label="Message" error={form.errors.message} required>
              <Textarea rows={5} value={form.values.message} onChange={(e) => form.setValue('message', e.target.value)} placeholder="Type your message, query, or grievance..." />
            </Field>
            <input
              type="text"
              name="website"
              value={form.values.website}
              onChange={(e) => form.setValue('website', e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="sr-only"
              aria-hidden
            />
            <Button type="submit" loading={form.submitting}>
              Send message
            </Button>
          </Form>
        )}
      </Section>
    </Container>
  );
}

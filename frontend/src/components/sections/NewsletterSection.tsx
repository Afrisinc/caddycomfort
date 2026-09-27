import { useId, useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageSection } from '@/components/common/PageSection';
import { newsletterApi } from '@/lib/api';
import { isValidEmail } from '@/lib/forms';

export function NewsletterSection() {
  const inputId = useId();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await newsletterApi.subscribe(email.trim());
      setSubscribed(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to subscribe');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageSection
      tone="tint"
      align="center"
      eyebrow="Newsletter"
      title="Sign up to our newsletter"
      description="Stay updated with our latest collections, exclusive offers, and fashion insights."
    >
      {subscribed ? (
        <p
          role="status"
          className="mx-auto flex max-w-xl items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          You&apos;re subscribed. Watch your inbox for our latest collections.
        </p>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-xl">
          <label htmlFor={inputId} className="sr-only">
            Email address
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Mail className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id={inputId}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                aria-invalid={!!error}
                aria-describedby={error ? `${inputId}-error` : undefined}
                className="h-12 bg-background pl-12 text-base"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="h-12 gap-2 bg-accent-rose px-6 hover:bg-accent-rose-dark"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Subscribe'}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
          {error && (
            <p
              id={`${inputId}-error`}
              role="alert"
              className="mt-2 text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </p>
          )}
        </form>
      )}
    </PageSection>
  );
}

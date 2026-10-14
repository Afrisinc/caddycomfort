import { useState } from 'react';
import { KeyRound, Mail, MailCheck } from 'lucide-react';
import { AuthLayout, AuthLink } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { TextField } from '@/components/ui/text-field';
import { Heading, Text } from '@/components/ui/typography';
import { useFormValidation } from '@/hooks/useFormValidation';
import { EMAIL_VALUES, validateEmail } from '@/lib/authForm';
import { useAuthStore } from '@/store/useAuthStore';

export default function ForgotPasswordPage() {
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useFormValidation({
    initialValues: EMAIL_VALUES,
    validate: validateEmail,
    idPrefix: 'forgot',
  });

  const onSubmit = form.handleSubmit(async ({ email }) => {
    const address = email.trim().toLowerCase();
    await forgotPassword(address);
    setSentTo(address);
  }, 'We could not send the reset link. Please try again.');

  return (
    <AuthLayout
      icon={KeyRound}
      title="Forgot your password?"
      description="Enter the email you signed up with and we'll send you a link to reset it."
      footer={
        <>
          Remembered it? <AuthLink href="/login">Back to sign in</AuthLink>
        </>
      }
    >
      {sentTo ? (
        <div role="status" className="flex flex-col items-center text-center">
          <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <MailCheck className="size-6" aria-hidden="true" />
          </span>
          <Heading as="h2" size="sm">
            Check your inbox
          </Heading>
          <Text variant="small" className="mt-2">
            If an account exists for <span className="font-medium text-foreground">{sentTo}</span>,
            a reset link is on its way. It expires in 1 hour. Check your spam folder if you don't
            see it.
          </Text>
          <Button
            type="button"
            variant="outline"
            size="xl"
            className="mt-6 w-full"
            onClick={() => {
              form.reset();
              setSentTo(null);
            }}
          >
            Use a different email
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <FormAlert>{form.formError}</FormAlert>

          <TextField
            {...form.field('email')}
            label="Email"
            type="email"
            icon={Mail}
            autoComplete="email"
            placeholder="you@example.com"
            required
          />

          <Button
            type="submit"
            variant="brand"
            size="xl"
            className="w-full"
            loading={form.submitting}
          >
            {form.submitting ? 'Sending link…' : 'Send reset link'}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

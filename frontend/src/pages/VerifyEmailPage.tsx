import { useEffect, useMemo, useState } from 'react';
import { KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { AuthLayout, AuthLink } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { TextField } from '@/components/ui/text-field';
import { Text } from '@/components/ui/typography';
import { useFormValidation } from '@/hooks/useFormValidation';
import {
  RESEND_COOLDOWN_SECONDS,
  VERIFICATION_CODE_LENGTH,
  digitsOnly,
  postAuthPath,
  validateVerification,
  withRedirect,
} from '@/lib/authForm';
import { errorMessage } from '@/lib/utils';
import { useRouter, useSearchParams } from '@/router/compat';
import { useAuthStore } from '@/store/useAuthStore';

function useCooldown() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  return [seconds, setSeconds] as const;
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const user = useAuthStore((state) => state.user);
  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  const resendVerification = useAuthStore((state) => state.resendVerification);

  const knownEmail = searchParams.get('email') ?? user?.email ?? '';
  const initialValues = useMemo(() => ({ email: knownEmail, code: '' }), [knownEmail]);
  const [editingEmail, setEditingEmail] = useState(!knownEmail);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useCooldown();

  const form = useFormValidation({
    initialValues,
    validate: validateVerification,
    idPrefix: 'verify',
  });
  const email = form.values.email.trim().toLowerCase();

  const onSubmit = form.handleSubmit(async ({ code }) => {
    await verifyEmail(email, code);
    toast.success('Email verified');
    router.replace(
      user
        ? postAuthPath({ ...user, isVerified: true }, redirect)
        : withRedirect('/login', redirect),
    );
  }, 'That code is invalid or has expired.');

  const resend = async () => {
    if (form.errors.email) {
      setEditingEmail(true);
      form.touch('email');
      return;
    }
    setResending(true);
    form.setFormError(null);
    try {
      await resendVerification(email);
      toast.success(`New code sent to ${email}`);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      form.setFormError(errorMessage(error, 'We could not send a new code. Please try again.'));
    } finally {
      setResending(false);
    }
  };

  const codeField = form.field('code');

  return (
    <AuthLayout
      icon={ShieldCheck}
      title="Verify your email"
      description={
        editingEmail ? (
          `Enter your email and the ${VERIFICATION_CODE_LENGTH}-digit code we sent you.`
        ) : (
          <>
            We sent a {VERIFICATION_CODE_LENGTH}-digit code to{' '}
            <span className="font-medium text-foreground">{email}</span>.{' '}
            <button
              type="button"
              onClick={() => setEditingEmail(true)}
              className="rounded-sm font-medium text-accent-rose underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-accent-rose/40 focus-visible:outline-none"
            >
              Change
            </button>
          </>
        )
      }
      footer={
        <>
          Wrong account? <AuthLink href="/login">Back to sign in</AuthLink>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <FormAlert>{form.formError}</FormAlert>

        {editingEmail && (
          <TextField
            {...form.field('email')}
            label="Email"
            type="email"
            icon={Mail}
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        )}

        <TextField
          {...codeField}
          onChange={(event) =>
            form.setValue('code', digitsOnly(event.target.value).slice(0, VERIFICATION_CODE_LENGTH))
          }
          label="Verification code"
          icon={KeyRound}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={VERIFICATION_CODE_LENGTH}
          placeholder="123456"
          inputClassName="text-lg font-medium tracking-[0.4em] tabular-nums"
          required
        />

        <Button
          type="submit"
          variant="brand"
          size="xl"
          className="w-full"
          loading={form.submitting}
        >
          {form.submitting ? 'Verifying…' : 'Verify email'}
        </Button>

        <Text variant="small" className="mx-auto text-center">
          Didn&apos;t get it? Check your spam folder or{' '}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 font-medium text-accent-rose"
            disabled={resending || cooldown > 0}
            onClick={resend}
          >
            {cooldown > 0 ? `resend in ${cooldown}s` : 'send a new code'}
          </Button>
        </Text>
      </form>
    </AuthLayout>
  );
}

import { LinkIcon, LockKeyhole } from 'lucide-react';
import { toast } from 'sonner';
import Link from '@/components/common/Link';
import { AuthLayout, AuthLink } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { PasswordField } from '@/components/ui/password-field';
import { Heading, Text } from '@/components/ui/typography';
import { useFormValidation } from '@/hooks/useFormValidation';
import { NEW_PASSWORD_VALUES, PASSWORD_HINT, validateNewPassword } from '@/lib/authForm';
import { useRouter, useSearchParams } from '@/router/compat';
import { useAuthStore } from '@/store/useAuthStore';

function InvalidResetLink() {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
        <LinkIcon className="size-6" aria-hidden="true" />
      </span>
      <Heading as="h2" size="sm">
        This link isn't valid
      </Heading>
      <Text variant="small" className="mt-2">
        Reset links expire after 1 hour and can only be used once. Request a new one to continue.
      </Text>
      <Button asChild variant="brand" size="xl" className="mt-6 w-full">
        <Link href="/forgot-password">Request a new link</Link>
      </Button>
    </div>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const token = useSearchParams().get('token');
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const form = useFormValidation({
    initialValues: NEW_PASSWORD_VALUES,
    validate: validateNewPassword,
    idPrefix: 'reset',
  });

  const onSubmit = form.handleSubmit(async ({ password }) => {
    if (!token) return;
    await resetPassword(token, password);
    toast.success('Password updated. Sign in with your new password.');
    router.replace('/login');
  }, 'We could not reset your password. The link may have expired.');

  return (
    <AuthLayout
      icon={LockKeyhole}
      title="Set a new password"
      description="Choose a strong password you don't use on other sites."
      footer={
        <>
          Remembered it? <AuthLink href="/login">Back to sign in</AuthLink>
        </>
      }
    >
      {token ? (
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <FormAlert>
            {form.formError && (
              <>
                {form.formError} <AuthLink href="/forgot-password">Request a new link</AuthLink>
              </>
            )}
          </FormAlert>

          <PasswordField
            {...form.field('password')}
            label="New password"
            autoComplete="new-password"
            hint={PASSWORD_HINT}
            required
          />

          <PasswordField
            {...form.field('confirmPassword')}
            label="Confirm new password"
            autoComplete="new-password"
            required
          />

          <Button
            type="submit"
            variant="brand"
            size="xl"
            className="w-full"
            loading={form.submitting}
          >
            {form.submitting ? 'Updating password…' : 'Update password'}
          </Button>
        </form>
      ) : (
        <InvalidResetLink />
      )}
    </AuthLayout>
  );
}

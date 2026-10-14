import { Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { AuthLink } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { PasswordField } from '@/components/ui/password-field';
import { TextField } from '@/components/ui/text-field';
import { Text } from '@/components/ui/typography';
import { useFormValidation } from '@/hooks/useFormValidation';
import { PASSWORD_HINT, REGISTER_VALUES, validateRegister } from '@/lib/authForm';
import { normalizePhone } from '@/lib/checkout';
import { useAuthStore } from '@/store/useAuthStore';

export function RegisterForm() {
  const register = useAuthStore((state) => state.register);
  const form = useFormValidation({
    initialValues: REGISTER_VALUES,
    validate: validateRegister,
    idPrefix: 'register',
  });

  const onSubmit = form.handleSubmit(async ({ firstName, lastName, email, phone, password }) => {
    await register({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() ? normalizePhone(phone) : undefined,
      password,
    });
    toast.success('Account created. Check your email for a verification code.');
  }, 'We could not create your account. Please try again.');

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <FormAlert>{form.formError}</FormAlert>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          {...form.field('firstName')}
          label="First name"
          autoComplete="given-name"
          required
        />
        <TextField
          {...form.field('lastName')}
          label="Last name"
          autoComplete="family-name"
          required
        />
      </div>

      <TextField
        {...form.field('email')}
        label="Email"
        type="email"
        icon={Mail}
        autoComplete="email"
        placeholder="you@example.com"
        required
      />

      <TextField
        {...form.field('phone')}
        label="Phone number"
        type="tel"
        icon={Phone}
        autoComplete="tel"
        inputMode="tel"
        placeholder="078 123 4567"
        optional
      />

      <PasswordField
        {...form.field('password')}
        label="Password"
        autoComplete="new-password"
        hint={PASSWORD_HINT}
        required
      />

      <PasswordField
        {...form.field('confirmPassword')}
        label="Confirm password"
        autoComplete="new-password"
        required
      />

      <Button type="submit" variant="brand" size="xl" className="w-full" loading={form.submitting}>
        {form.submitting ? 'Creating account…' : 'Create account'}
      </Button>

      <Text variant="caption" className="mx-auto text-center">
        By creating an account, you agree to our <AuthLink href="/terms">Terms of Service</AuthLink>{' '}
        and <AuthLink href="/privacy">Privacy Policy</AuthLink>.
      </Text>
    </form>
  );
}

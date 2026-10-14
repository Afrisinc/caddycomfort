import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { AuthLink } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { FormAlert } from '@/components/ui/form-alert';
import { PasswordField } from '@/components/ui/password-field';
import { TextField } from '@/components/ui/text-field';
import { useFormValidation } from '@/hooks/useFormValidation';
import { LOGIN_VALUES, validateLogin } from '@/lib/authForm';
import { useAuthStore } from '@/store/useAuthStore';

export function LoginForm() {
  const login = useAuthStore((state) => state.login);
  const form = useFormValidation({
    initialValues: LOGIN_VALUES,
    validate: validateLogin,
    idPrefix: 'login',
  });

  const onSubmit = form.handleSubmit(async ({ email, password }) => {
    await login(email.trim().toLowerCase(), password);
    toast.success('Welcome back!');
  }, 'We could not sign you in. Please try again.');

  return (
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

      <PasswordField
        {...form.field('password')}
        label="Password"
        autoComplete="current-password"
        required
        aside={
          <AuthLink href="/forgot-password" className="text-sm">
            Forgot password?
          </AuthLink>
        }
      />

      <Button type="submit" variant="brand" size="xl" className="w-full" loading={form.submitting}>
        {form.submitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}

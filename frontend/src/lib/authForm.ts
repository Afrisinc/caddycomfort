import type { FormErrors } from '@/hooks/useFormValidation';
import { isValidRwandaPhone } from '@/lib/checkout';
import { isValidEmail } from '@/lib/forms';
import { safeRedirect } from '@/lib/navigation';

export const PASSWORD_MIN_LENGTH = 8;
export const VERIFICATION_CODE_LENGTH = 6;
export const RESEND_COOLDOWN_SECONDS = 60;
export const PASSWORD_HINT = `At least ${PASSWORD_MIN_LENGTH} characters`;

export const LOGIN_VALUES = { email: '', password: '' };
export const REGISTER_VALUES = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};
export const EMAIL_VALUES = { email: '' };
export const NEW_PASSWORD_VALUES = { password: '', confirmPassword: '' };

export type LoginValues = typeof LOGIN_VALUES;
export type RegisterValues = typeof REGISTER_VALUES;
export type EmailValues = typeof EMAIL_VALUES;
export type NewPasswordValues = typeof NEW_PASSWORD_VALUES;
export type VerificationValues = { email: string; code: string };

interface AuthUser {
  readonly email: string;
  readonly role?: string;
  readonly isVerified?: boolean;
}

const ADMIN_ROLES = new Set(['ADMIN', 'SUPER_ADMIN']);

export const isAdminRole = (role?: string) => !!role && ADMIN_ROLES.has(role);

export const digitsOnly = (value: string) => value.replace(/\D/g, '');

export function emailError(value: string) {
  if (!value.trim()) return 'Enter your email address';
  if (!isValidEmail(value)) return 'Enter a valid email address, e.g. name@example.com';
  return undefined;
}

export function newPasswordError(value: string) {
  if (!value) return 'Create a password';
  if (value.length < PASSWORD_MIN_LENGTH) return `Use at least ${PASSWORD_MIN_LENGTH} characters`;
  return undefined;
}

export function confirmPasswordError(password: string, confirmation: string) {
  if (!confirmation) return 'Re-enter your password';
  if (confirmation !== password) return "Passwords don't match";
  return undefined;
}

export const validateLogin = (values: LoginValues): FormErrors<LoginValues> => ({
  email: emailError(values.email),
  password: values.password ? undefined : 'Enter your password',
});

export const validateRegister = (values: RegisterValues): FormErrors<RegisterValues> => ({
  firstName: values.firstName.trim() ? undefined : 'Enter your first name',
  lastName: values.lastName.trim() ? undefined : 'Enter your last name',
  email: emailError(values.email),
  phone:
    values.phone.trim() && !isValidRwandaPhone(values.phone)
      ? 'Enter a Rwandan number, e.g. 078 123 4567'
      : undefined,
  password: newPasswordError(values.password),
  confirmPassword: confirmPasswordError(values.password, values.confirmPassword),
});

export const validateEmail = (values: EmailValues): FormErrors<EmailValues> => ({
  email: emailError(values.email),
});

export const validateNewPassword = (values: NewPasswordValues): FormErrors<NewPasswordValues> => ({
  password: newPasswordError(values.password),
  confirmPassword: confirmPasswordError(values.password, values.confirmPassword),
});

export const validateVerification = (
  values: VerificationValues,
): FormErrors<VerificationValues> => ({
  email: emailError(values.email),
  code:
    values.code.length === VERIFICATION_CODE_LENGTH
      ? undefined
      : `Enter the ${VERIFICATION_CODE_LENGTH}-digit code from your email`,
});

export function withRedirect(
  path: string,
  redirect: string | null,
  params: Record<string, string> = {},
) {
  const query = new URLSearchParams(params);
  if (redirect) query.set('redirect', redirect);
  const search = query.toString();
  return search ? `${path}?${search}` : path;
}

export function postAuthPath(user: AuthUser | null, redirect: string | null) {
  if (!user) return withRedirect('/login', redirect);
  if (user.isVerified === false) {
    return withRedirect('/verify-email', redirect, { email: user.email });
  }
  return safeRedirect(redirect, isAdminRole(user.role) ? '/admin' : '/account');
}

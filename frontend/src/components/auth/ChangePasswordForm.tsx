import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormSection } from '@/components/ui/form-section';
import { PasswordField } from '@/components/ui/password-field';
import { usersApi } from '@/lib/api';
import { PASSWORD_HINT, PASSWORD_MIN_LENGTH } from '@/lib/authForm';

const EMPTY = { current: '', next: '', confirm: '' };
type Field = keyof typeof EMPTY;

const FIELDS: { name: Field; label: string; autoComplete: string; hint?: string }[] = [
  { name: 'current', label: 'Current password', autoComplete: 'current-password' },
  {
    name: 'next',
    label: 'New password',
    autoComplete: 'new-password',
    hint: PASSWORD_HINT,
  },
  { name: 'confirm', label: 'Confirm new password', autoComplete: 'new-password' },
];

function validate(values: typeof EMPTY): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};
  if (!values.current) errors.current = 'Enter your current password';
  if (values.next.length < PASSWORD_MIN_LENGTH)
    errors.next = `Use at least ${PASSWORD_MIN_LENGTH} characters`;
  else if (values.next === values.current)
    errors.next = 'Choose a password different from the current one';
  if (values.confirm !== values.next) errors.confirm = 'Passwords do not match';
  return errors;
}

export function ChangePasswordForm({ id }: Readonly<{ id?: string }>) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [saving, setSaving] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    try {
      await usersApi.changePassword({ currentPassword: values.current, newPassword: values.next });
      setValues(EMPTY);
      toast.success('Password updated');
    } catch (error: any) {
      toast.error(error.message || 'Could not update your password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <FormSection
        id={id}
        title="Password"
        description="Update the password you use to sign in."
        footer={
          <Button type="submit" variant="brand" loading={saving}>
            Update password
          </Button>
        }
      >
        {FIELDS.map((field) => (
          <PasswordField
            key={field.name}
            id={`password-${field.name}`}
            label={field.label}
            hint={field.hint}
            error={errors[field.name]}
            autoComplete={field.autoComplete}
            value={values[field.name]}
            onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
            className="max-w-md"
          />
        ))}
      </FormSection>
    </form>
  );
}

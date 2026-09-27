import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { FormSection } from '@/components/ui/form-section';
import { usersApi } from '@/lib/api';
import { fieldDescribedBy } from '@/lib/forms';

const MIN_LENGTH = 6;
const EMPTY = { current: '', next: '', confirm: '' };
type Field = keyof typeof EMPTY;

const FIELDS: { name: Field; label: string; autoComplete: string; hint?: string }[] = [
  { name: 'current', label: 'Current password', autoComplete: 'current-password' },
  {
    name: 'next',
    label: 'New password',
    autoComplete: 'new-password',
    hint: `At least ${MIN_LENGTH} characters`,
  },
  { name: 'confirm', label: 'Confirm new password', autoComplete: 'new-password' },
];

function validate(values: typeof EMPTY): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};
  if (!values.current) errors.current = 'Enter your current password';
  if (values.next.length < MIN_LENGTH) errors.next = `Use at least ${MIN_LENGTH} characters`;
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
          <Button
            type="submit"
            disabled={saving}
            className="gap-2 bg-accent-rose hover:bg-accent-rose-dark"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Update password
          </Button>
        }
      >
        {FIELDS.map((field) => {
          const fieldId = `password-${field.name}`;
          return (
            <FormField
              key={field.name}
              id={fieldId}
              label={field.label}
              hint={field.hint}
              error={errors[field.name]}
            >
              <Input
                id={fieldId}
                type="password"
                autoComplete={field.autoComplete}
                value={values[field.name]}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                aria-invalid={!!errors[field.name]}
                aria-describedby={fieldDescribedBy(fieldId, !!field.hint, !!errors[field.name])}
                className="h-11 max-w-md"
              />
            </FormField>
          );
        })}
      </FormSection>
    </form>
  );
}

import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PageHeader } from '@/components/common/PageHeader';
import { UnsavedChangesGuard } from '@/components/common/UnsavedChangesGuard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AvatarUpload } from '@/components/account/AvatarUpload';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { FormSection } from '@/components/ui/form-section';
import { Input } from '@/components/ui/input';
import { isValidRwandaPhone } from '@/lib/checkout';
import { fieldDescribedBy } from '@/lib/forms';
import { errorMessage } from '@/lib/utils';
import { useAuthStore, type User } from '@/store/useAuthStore';

type FieldName = 'firstName' | 'lastName' | 'phone';
type ProfileValues = Record<FieldName, string>;
type ProfileErrors = Partial<Record<FieldName, string>>;

const FIELD_ORDER: FieldName[] = ['firstName', 'lastName', 'phone'];

const BREADCRUMBS = [
  { label: 'Home', href: '/' },
  { label: 'Account', href: '/account' },
  { label: 'Profile' },
];

const valuesFrom = (user: User | null): ProfileValues => ({
  firstName: user?.firstName ?? '',
  lastName: user?.lastName ?? '',
  phone: user?.phone ?? '',
});

function validateField(name: FieldName, value: string, saved: string): string | undefined {
  const trimmed = value.trim();
  if (name === 'firstName' && !trimmed) return 'Please enter your first name';
  if (name === 'lastName' && !trimmed) return 'Please enter your last name';
  if (name === 'phone' && trimmed && trimmed !== saved.trim() && !isValidRwandaPhone(trimmed)) {
    return 'Enter a Rwandan number, e.g. 078 123 4567';
  }
  return undefined;
}

function validate(values: ProfileValues, saved: ProfileValues): ProfileErrors {
  const errors: ProfileErrors = {};
  for (const name of FIELD_ORDER) {
    const error = validateField(name, values[name], saved[name]);
    if (error) errors[name] = error;
  }
  return errors;
}

function ProfileForm({ user }: { readonly user: User }) {
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [values, setValues] = useState<ProfileValues>(() => valuesFrom(user));
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [saving, setSaving] = useState(false);
  const inputRefs = useRef<Partial<Record<FieldName, HTMLInputElement | null>>>({});

  const saved = valuesFrom(user);
  const dirty = FIELD_ORDER.some((name) => values[name].trim() !== saved[name].trim());

  const setField = (name: FieldName, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: validateField(name, value, saved[name]) }));
    }
  };

  const handleBlur = (name: FieldName) => {
    setErrors((current) => ({
      ...current,
      [name]: validateField(name, values[name], saved[name]),
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate(values, saved);
    setErrors(nextErrors);

    const firstInvalid = FIELD_ORDER.find((name) => nextErrors[name]);
    if (firstInvalid) {
      inputRefs.current[firstInvalid]?.focus();
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phone: values.phone.trim() || undefined,
      });
      toast.success('Your profile has been updated');
    } catch (error) {
      toast.error(errorMessage(error, 'Your profile could not be saved. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (avatar: string) => {
    await updateProfile({ avatar });
    toast.success('Profile photo updated');
  };

  const handleAvatarRemove = async () => {
    await updateProfile({ avatar: null });
    toast.success('Profile photo removed');
  };

  const fieldProps = (name: FieldName, hint = false) => ({
    id: name,
    ref: (element: HTMLInputElement | null) => {
      inputRefs.current[name] = element;
    },
    value: values[name],
    onChange: (event: ChangeEvent<HTMLInputElement>) => setField(name, event.target.value),
    onBlur: () => handleBlur(name),
    disabled: saving,
    'aria-invalid': Boolean(errors[name]) || undefined,
    'aria-describedby': fieldDescribedBy(name, hint, Boolean(errors[name])),
  });

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-8">
      <FormSection
        className="lg:sticky lg:top-28"
        title="Profile photo"
        description="Shown on your account. Optional, and you can remove it any time."
      >
        <AvatarUpload
          src={user.avatar}
          firstName={user.firstName}
          lastName={user.lastName}
          email={user.email}
          onUpload={handleAvatarUpload}
          onRemove={handleAvatarRemove}
          layout="stacked"
        />
      </FormSection>

      <form onSubmit={handleSubmit} noValidate>
        <UnsavedChangesGuard when={dirty && !saving} />
        <FormSection
          title="Personal details"
          description="Used for your orders and deliveries."
          footer={
            <Button
              type="submit"
              disabled={!dirty || saving}
              className="min-w-32 gap-2 bg-accent-rose hover:bg-accent-rose-dark"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          }
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="firstName" label="First name" required error={errors.firstName}>
              <Input {...fieldProps('firstName')} autoComplete="given-name" />
            </FormField>
            <FormField id="lastName" label="Last name" required error={errors.lastName}>
              <Input {...fieldProps('lastName')} autoComplete="family-name" />
            </FormField>
          </div>

          <FormField id="email" label="Email" hint="Contact support to change your email address.">
            <Input
              id="email"
              type="email"
              value={user.email}
              readOnly
              disabled
              aria-describedby="email-hint"
            />
          </FormField>

          <FormField
            id="phone"
            label="Phone number"
            optional
            hint="Used by our delivery team to reach you."
            error={errors.phone}
          >
            <Input
              {...fieldProps('phone', true)}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="078 123 4567"
            />
          </FormField>
        </FormSection>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-background pt-20">
        <PageHeader
          title="Profile settings"
          description="Manage your photo and personal details."
          breadcrumbs={BREADCRUMBS}
        />
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {user && <ProfileForm user={user} />}
        </div>
      </main>
      <Footer />
    </ProtectedRoute>
  );
}

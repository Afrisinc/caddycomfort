import { useState, type FormEvent } from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/ui/form-field';
import { fieldDescribedBy } from '@/lib/forms';
import { validateShipping, type ShippingDetails, type ShippingErrors } from '@/lib/checkout';
import type { Address } from '@/types/api';
import { cn } from '@/lib/utils';

interface ShippingFormProps {
  readonly initial: ShippingDetails;
  readonly savedAddresses: Address[];
  readonly onSubmit: (details: ShippingDetails, saveAddress: boolean) => void;
}

type Field = keyof ShippingDetails;

interface FieldConfig {
  name: Field;
  label: string;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  inputMode?: 'email' | 'tel' | 'text';
  placeholder?: string;
  hint?: string;
  wide?: boolean;
}

const FIELDS: FieldConfig[] = [
  { name: 'firstName', label: 'First name', required: true, autoComplete: 'given-name' },
  { name: 'lastName', label: 'Last name', required: true, autoComplete: 'family-name' },
  {
    name: 'email',
    label: 'Email',
    required: true,
    type: 'email',
    inputMode: 'email',
    autoComplete: 'email',
    hint: 'We send your order confirmation here',
  },
  {
    name: 'phone',
    label: 'Phone',
    required: true,
    type: 'tel',
    inputMode: 'tel',
    autoComplete: 'tel',
    placeholder: '078 123 4567',
    hint: 'For delivery updates',
  },
  {
    name: 'address',
    label: 'Street address',
    required: true,
    autoComplete: 'street-address',
    placeholder: 'e.g. KN 4 Ave, house 12',
    wide: true,
  },
  { name: 'city', label: 'City', required: true, autoComplete: 'address-level2' },
  { name: 'province', label: 'Province', autoComplete: 'address-level1' },
  { name: 'postalCode', label: 'Postal code', autoComplete: 'postal-code' },
];

function fromAddress(address: Address, current: ShippingDetails): ShippingDetails {
  const [firstName, ...rest] = address.fullName.trim().split(/\s+/);
  return {
    ...current,
    firstName: firstName ?? current.firstName,
    lastName: rest.join(' ') || current.lastName,
    phone: address.phone,
    address: [address.addressLine1, address.addressLine2].filter(Boolean).join(', '),
    city: address.city,
    province: address.state,
    postalCode: address.postalCode,
  };
}

export function ShippingForm({ initial, savedAddresses, onSubmit }: ShippingFormProps) {
  const [details, setDetails] = useState(initial);
  const [errors, setErrors] = useState<ShippingErrors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [saveAddress, setSaveAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const update = (name: Field, value: string) => {
    const next = { ...details, [name]: value };
    setDetails(next);
    setSelectedAddressId(null);
    if (touched[name]) setErrors(validateShipping(next));
  };

  const applyAddress = (address: Address) => {
    const next = fromAddress(address, details);
    setDetails(next);
    setSelectedAddressId(address.id);
    setErrors(validateShipping(next));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validateShipping(details);
    setErrors(found);
    setTouched(Object.fromEntries(FIELDS.map((f) => [f.name, true])));
    const firstInvalid = FIELDS.find((f) => found[f.name]);
    if (firstInvalid) {
      document.getElementById(`ship-${firstInvalid.name}`)?.focus();
      return;
    }
    onSubmit(details, saveAddress && !selectedAddressId);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {savedAddresses.length > 0 && (
        <section aria-label="Saved addresses" className="space-y-3">
          <p className="text-sm font-medium">Use a saved address</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {savedAddresses.map((address) => {
              const selected = selectedAddressId === address.id;
              return (
                <button
                  key={address.id}
                  type="button"
                  onClick={() => applyAddress(address)}
                  aria-pressed={selected}
                  className={cn(
                    'flex items-start gap-3 rounded-xl border bg-card p-4 text-left text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent-rose/40',
                    selected
                      ? 'border-accent-rose ring-1 ring-accent-rose'
                      : 'hover:border-foreground/30',
                  )}
                >
                  <MapPin
                    className={cn(
                      'mt-0.5 h-4 w-4 shrink-0',
                      selected ? 'text-accent-rose' : 'text-muted-foreground',
                    )}
                  />
                  <span className="min-w-0">
                    <span className="block font-medium">
                      {address.fullName}
                      {address.isDefault && (
                        <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          Default
                        </span>
                      )}
                    </span>
                    <span className="block truncate text-muted-foreground">
                      {address.addressLine1}, {address.city}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div className="grid gap-5 rounded-2xl border bg-card p-5 sm:grid-cols-2 sm:p-6">
        {FIELDS.map((field) => {
          const id = `ship-${field.name}`;
          const error = touched[field.name] ? errors[field.name] : undefined;
          return (
            <FormField
              key={field.name}
              id={id}
              label={field.label}
              required={field.required}
              optional={!field.required}
              hint={field.hint}
              error={error}
              className={field.wide ? 'sm:col-span-2' : undefined}
            >
              <Input
                id={id}
                type={field.type ?? 'text'}
                inputMode={field.inputMode}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                value={details[field.name]}
                onChange={(e) => update(field.name, e.target.value)}
                onBlur={() => {
                  setTouched((t) => ({ ...t, [field.name]: true }));
                  setErrors(validateShipping(details));
                }}
                aria-invalid={!!error}
                aria-describedby={fieldDescribedBy(id, !!field.hint, !!error)}
                className="h-11"
              />
            </FormField>
          );
        })}
        <FormField id="ship-country" label="Country">
          <Input id="ship-country" value="Rwanda" disabled className="h-11" />
        </FormField>

        {!selectedAddressId && (
          <label className="flex cursor-pointer items-center gap-2.5 text-sm sm:col-span-2">
            <Checkbox
              checked={saveAddress}
              onCheckedChange={(checked) => setSaveAddress(checked === true)}
            />
            Save this address to my account for next time
          </label>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full gap-2 bg-accent-rose text-[15px] hover:bg-accent-rose-dark"
      >
        Continue to payment
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}

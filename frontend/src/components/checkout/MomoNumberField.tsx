import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { fieldDescribedBy } from '@/lib/forms';

interface MomoNumberFieldProps {
  readonly id: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly error?: string;
  readonly label?: string;
}

export function MomoNumberField({
  id,
  value,
  onChange,
  error,
  label = 'Mobile Money number',
}: MomoNumberFieldProps) {
  return (
    <FormField
      id={id}
      label={label}
      required
      hint="MTN or Airtel number that will receive the payment request"
      error={error}
    >
      <Input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="078 123 4567"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={fieldDescribedBy(id, true, !!error)}
        className="h-11 max-w-xs bg-background"
      />
    </FormField>
  );
}

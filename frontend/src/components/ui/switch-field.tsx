import type { ReactNode } from 'react';
import { Switch } from '@/components/ui/switch';

interface SwitchFieldProps {
  readonly id: string;
  readonly label: string;
  readonly description?: ReactNode;
  readonly checked: boolean;
  readonly onCheckedChange: (checked: boolean) => void;
  readonly disabled?: boolean;
}

export function SwitchField({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: SwitchFieldProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {description && (
          <p id={`${id}-description`} className="mt-0.5 text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-describedby={description ? `${id}-description` : undefined}
      />
    </div>
  );
}

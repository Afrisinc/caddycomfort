import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { InputGroup } from '@/components/ui/input-group';
import { FormField } from '@/components/ui/form-field';
import { FormSection } from '@/components/ui/form-section';
import { FormActionBar } from '@/components/ui/form-action-bar';
import { settingsApi } from '@/lib/api';
import { fieldDescribedBy } from '@/lib/forms';
import {
  cashOnDeliveryText,
  freeShippingText,
  validateSettings,
  type SettingsErrors,
  type StoreSettings,
} from '@/lib/storeSettings';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SETTINGS_SECTIONS, type FieldConfig, type SettingsField } from '@/lib/settingsForm';
import { cn } from '@/lib/utils';

function isChanged(a: StoreSettings, b: StoreSettings) {
  return SETTINGS_SECTIONS.some((section) =>
    section.fields.some((field) => String(a[field.name] ?? '') !== String(b[field.name] ?? '')),
  );
}

export function StoreSettingsForm() {
  const saved = useSettingsStore((state) => state.settings);
  const setSettings = useSettingsStore((state) => state.setSettings);
  const [values, setValues] = useState<StoreSettings>(saved);
  const [errors, setErrors] = useState<SettingsErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi
      .get()
      .then((fresh) => {
        setSettings(fresh);
        setValues(fresh);
      })
      .catch(() => toast.error('Could not load the latest settings'));
  }, [setSettings]);

  const dirty = useMemo(() => isChanged(values, saved), [values, saved]);

  const update = (name: SettingsField, raw: string, kind: FieldConfig['kind']) => {
    const numeric = raw === '' ? '' : Number(raw);
    const next = { ...values, [name]: kind === 'number' ? numeric : raw };
    setValues(next as StoreSettings);
    if (errors[name]) setErrors(validateSettings(next as StoreSettings));
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validateSettings(values);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      document.getElementById(`setting-${firstInvalid}`)?.focus();
      return;
    }
    setSaving(true);
    try {
      const updated = await settingsApi.update(values);
      setSettings(updated);
      setValues(updated);
      toast.success('Settings saved');
    } catch (error: any) {
      toast.error(error.message || 'Could not save settings');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: FieldConfig) => {
    const id = `setting-${field.name}`;
    const error = errors[field.name];
    const common = {
      id,
      value: String(values[field.name] ?? ''),
      'aria-invalid': !!error,
      'aria-describedby': fieldDescribedBy(id, !!field.hint, !!error),
    };
    let control;
    if (field.kind === 'textarea') {
      control = (
        <Textarea
          {...common}
          rows={3}
          onChange={(e) => update(field.name, e.target.value, field.kind)}
        />
      );
    } else if (field.kind === 'number') {
      control = (
        <InputGroup
          {...common}
          type="number"
          inputMode="decimal"
          min={0}
          prefix={field.prefix}
          suffix={field.suffix}
          onChange={(e) => update(field.name, e.target.value, field.kind)}
          className="max-w-xs"
        />
      );
    } else {
      control = (
        <Input
          {...common}
          type={field.kind}
          className="h-11"
          onChange={(e) => update(field.name, e.target.value, field.kind)}
        />
      );
    }
    return (
      <FormField
        key={field.name}
        id={id}
        label={field.label}
        required={field.required}
        hint={field.hint}
        error={error}
        className={cn(field.wide && 'sm:col-span-2')}
      >
        {control}
      </FormField>
    );
  };

  const preview = { ...saved, ...values } as StoreSettings;

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {SETTINGS_SECTIONS.map((section) => (
        <FormSection
          key={section.id}
          id={section.id}
          title={section.title}
          description={section.description}
        >
          <div className="grid gap-5 sm:grid-cols-2">{section.fields.map(renderField)}</div>
          {section.id === 'shipping' && (
            <p className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
              Customers see: free shipping {freeShippingText(preview).toLowerCase()}, otherwise Rwf{' '}
              {Number(preview.standardShippingFee || 0).toLocaleString()}.
            </p>
          )}
          {section.id === 'payments' && (
            <p className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
              Customers see:{' '}
              {cashOnDeliveryText({
                ...preview,
                codDepositPercent: Number(preview.codDepositPercent) || 0,
              })}
            </p>
          )}
        </FormSection>
      ))}

      <FormActionBar
        visible={dirty}
        saving={saving}
        onSecondary={() => {
          setValues(saved);
          setErrors({});
        }}
      />
    </form>
  );
}

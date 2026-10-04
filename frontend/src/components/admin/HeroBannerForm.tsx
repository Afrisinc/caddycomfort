import { useMemo, useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { FormSection } from '@/components/ui/form-section';
import { FormActionBar } from '@/components/ui/form-action-bar';
import { SwitchField } from '@/components/ui/switch-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { HeroBannerPreview } from '@/components/admin/HeroBannerPreview';
import { UnsavedChangesGuard } from '@/components/common/UnsavedChangesGuard';
import { fieldDescribedBy } from '@/lib/forms';
import {
  CUSTOM_LINK,
  HERO_LIMITS,
  heroBannerPayload,
  validateHeroBanner,
  type HeroBannerFormErrors,
  type HeroBannerFormValues,
  type LinkOption,
} from '@/lib/heroBannerForm';
import type { HeroBannerPayload } from '@/lib/api/heroBanners';

interface HeroBannerFormProps {
  readonly mode: 'create' | 'edit';
  readonly initialValues: HeroBannerFormValues;
  readonly linkChoices: LinkOption[];
  readonly onSubmit: (payload: HeroBannerPayload) => Promise<void>;
  readonly onCancel: () => void;
}

function Counter({ value, max }: Readonly<{ value: string; max: number }>) {
  return (
    <span className="text-xs text-muted-foreground tabular-nums">
      {value.length}/{max}
    </span>
  );
}

export function HeroBannerForm({
  mode,
  initialValues,
  linkChoices,
  onSubmit,
  onCancel,
}: HeroBannerFormProps) {
  const [values, setValues] = useState(initialValues);
  const [baseline, setBaseline] = useState(initialValues);
  const [errors, setErrors] = useState<HeroBannerFormErrors>({});
  const [saving, setSaving] = useState(false);

  const dirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(baseline),
    [values, baseline],
  );

  const set = <K extends keyof HeroBannerFormValues>(field: K, value: HeroBannerFormValues[K]) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (Object.keys(errors).length) setErrors(validateHeroBanner(next));
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validateHeroBanner(values);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      document.getElementById(`banner-${firstInvalid}`)?.focus();
      return;
    }
    setSaving(true);
    try {
      await onSubmit(heroBannerPayload(values));
      setBaseline(values);
    } finally {
      setSaving(false);
    }
  };

  const describedBy = (name: keyof HeroBannerFormValues, hasHint: boolean) =>
    fieldDescribedBy(`banner-${name}`, hasHint, !!errors[name]);

  return (
    <form onSubmit={submit} noValidate className="max-w-3xl space-y-6">
      <UnsavedChangesGuard when={dirty && !saving} />

      <FormSection
        title="Preview"
        description="How this slide looks on the home page. It updates as you type."
      >
        <HeroBannerPreview
          image={values.images[0]}
          eyebrow={values.eyebrow}
          title={values.title}
          ctaText={values.ctaText}
        />
      </FormSection>

      <FormSection
        title="Image"
        description="Use a wide photo of at least 1600 × 900 px. Text sits on the left side, so keep the main subject on the right."
      >
        <div id="banner-images" tabIndex={-1} className="outline-none">
          <ImageUploader
            images={values.images}
            onChange={(images) => set('images', images)}
            max={1}
            aspect="landscape"
            label="Banner image"
            disabled={saving}
          />
        </div>
        {errors.images && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {errors.images}
          </p>
        )}
      </FormSection>

      <FormSection title="Content" description="The words customers read on the slide.">
        <FormField
          id="banner-eyebrow"
          label="Label"
          required
          hint="A short line above the headline, for example “Move in comfort”."
          error={errors.eyebrow}
          aside={<Counter value={values.eyebrow} max={HERO_LIMITS.eyebrow} />}
        >
          <Input
            id="banner-eyebrow"
            className="h-11"
            maxLength={HERO_LIMITS.eyebrow}
            value={values.eyebrow}
            onChange={(e) => set('eyebrow', e.target.value)}
            aria-invalid={!!errors.eyebrow}
            aria-describedby={describedBy('eyebrow', true)}
          />
        </FormField>

        <FormField
          id="banner-title"
          label="Headline"
          required
          error={errors.title}
          aside={<Counter value={values.title} max={HERO_LIMITS.title} />}
        >
          <Input
            id="banner-title"
            className="h-11"
            maxLength={HERO_LIMITS.title}
            value={values.title}
            onChange={(e) => set('title', e.target.value)}
            aria-invalid={!!errors.title}
            aria-describedby={describedBy('title', false)}
          />
        </FormField>
      </FormSection>

      <FormSection title="Button" description="Where customers go when they tap the slide button.">
        <FormField
          id="banner-ctaText"
          label="Button text"
          required
          error={errors.ctaText}
          aside={<Counter value={values.ctaText} max={HERO_LIMITS.ctaText} />}
        >
          <Input
            id="banner-ctaText"
            className="h-11 sm:w-80"
            maxLength={HERO_LIMITS.ctaText}
            value={values.ctaText}
            onChange={(e) => set('ctaText', e.target.value)}
            aria-invalid={!!errors.ctaText}
            aria-describedby={describedBy('ctaText', false)}
          />
        </FormField>

        <FormField
          id="banner-linkChoice"
          label="Button destination"
          hint="Pick a category from your shop, or enter your own link."
        >
          <Select value={values.linkChoice} onValueChange={(value) => set('linkChoice', value)}>
            <SelectTrigger
              id="banner-linkChoice"
              className="h-11 w-full sm:w-80"
              aria-describedby={describedBy('linkChoice', true)}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {linkChoices.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
              <SelectItem value={CUSTOM_LINK}>Custom link…</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        {values.linkChoice === CUSTOM_LINK && (
          <FormField
            id="banner-customLink"
            label="Custom link"
            required
            hint="A page on your site such as /about, or a full https:// address."
            error={errors.customLink}
          >
            <Input
              id="banner-customLink"
              className="h-11 font-mono text-sm sm:w-80"
              placeholder="/shop?category=leggings"
              value={values.customLink}
              onChange={(e) => set('customLink', e.target.value)}
              aria-invalid={!!errors.customLink}
              aria-describedby={describedBy('customLink', true)}
            />
          </FormField>
        )}
      </FormSection>

      <FormSection title="Accessibility and visibility">
        <FormField
          id="banner-imageAlt"
          label="Image description"
          optional
          hint="Read aloud by screen readers. Leave blank to use the headline."
          aside={<Counter value={values.imageAlt} max={HERO_LIMITS.imageAlt} />}
        >
          <Input
            id="banner-imageAlt"
            className="h-11"
            maxLength={HERO_LIMITS.imageAlt}
            value={values.imageAlt}
            onChange={(e) => set('imageAlt', e.target.value)}
            aria-describedby={describedBy('imageAlt', true)}
          />
        </FormField>

        <SwitchField
          id="banner-isActive"
          label="Show on the home page"
          description="Turn this off to hide the slide without deleting it."
          checked={values.isActive}
          onCheckedChange={(checked) => set('isActive', checked)}
        />
      </FormSection>

      <FormActionBar
        visible={mode === 'create' || dirty}
        saving={saving}
        message={mode === 'create' ? 'Ready to add this slide?' : 'You have unsaved changes'}
        submitLabel={mode === 'create' ? 'Add slide' : 'Save changes'}
        secondaryLabel={mode === 'create' ? 'Cancel' : 'Discard'}
        onSecondary={
          mode === 'create'
            ? onCancel
            : () => {
                setValues(baseline);
                setErrors({});
              }
        }
      />
    </form>
  );
}

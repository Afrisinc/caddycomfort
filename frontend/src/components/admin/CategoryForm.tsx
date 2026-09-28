import { useMemo, useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import { FormSection } from '@/components/ui/form-section';
import { FormActionBar } from '@/components/ui/form-action-bar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { UnsavedChangesGuard } from '@/components/common/UnsavedChangesGuard';
import { fieldDescribedBy } from '@/lib/forms';
import { slugify } from '@/lib/productForm';
import {
  NO_PARENT,
  categoryPayload,
  parentOptions,
  validateCategory,
  type CategoryFormErrors,
  type CategoryFormValues,
  type CategoryPayload,
} from '@/lib/categoryForm';
import type { Category } from '@/types/api';

interface CategoryFormProps {
  readonly mode: 'create' | 'edit';
  readonly initialValues: CategoryFormValues;
  readonly categories: Category[];
  readonly currentId?: string;
  readonly hasChildren?: boolean;
  readonly onSubmit: (payload: CategoryPayload) => Promise<void>;
  readonly onCancel: () => void;
}

const DESCRIPTION_MAX = 500;

export function CategoryForm({
  mode,
  initialValues,
  categories,
  currentId,
  hasChildren,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const [values, setValues] = useState(initialValues);
  const [baseline, setBaseline] = useState(initialValues);
  const [errors, setErrors] = useState<CategoryFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(mode === 'edit');

  const dirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(baseline),
    [values, baseline],
  );
  const parents = useMemo(() => parentOptions(categories, currentId), [categories, currentId]);
  const isTopLevel = values.parentId === NO_PARENT;

  const set = <K extends keyof CategoryFormValues>(field: K, value: CategoryFormValues[K]) => {
    const next = { ...values, [field]: value };
    if (field === 'name' && !slugEdited) next.slug = slugify(String(value));
    setValues(next);
    if (Object.keys(errors).length) setErrors(validateCategory(next, categories, currentId));
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validateCategory(values, categories, currentId);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      document.getElementById(`category-${firstInvalid}`)?.focus();
      return;
    }
    setSaving(true);
    try {
      await onSubmit(categoryPayload(values));
      setBaseline(values);
    } finally {
      setSaving(false);
    }
  };

  const describedBy = (name: keyof CategoryFormValues, hasHint: boolean) =>
    fieldDescribedBy(`category-${name}`, hasHint, !!errors[name]);

  return (
    <form onSubmit={submit} noValidate className="max-w-3xl space-y-6">
      <UnsavedChangesGuard when={dirty && !saving} />

      <FormSection title="Details" description="How the category appears in the shop and filters.">
        <FormField id="category-name" label="Name" required error={errors.name}>
          <Input
            id="category-name"
            className="h-11"
            placeholder="e.g. Sports Bras"
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={describedBy('name', false)}
          />
        </FormField>

        <FormField
          id="category-slug"
          label="URL handle"
          optional
          hint={`Shop link: /shop?category=${values.slug || slugify(values.name) || 'your-category'}`}
          error={errors.slug}
        >
          <Input
            id="category-slug"
            className="h-11 font-mono text-sm"
            placeholder="sports-bras"
            value={values.slug}
            onChange={(e) => {
              setSlugEdited(true);
              set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'));
            }}
            aria-invalid={!!errors.slug}
            aria-describedby={describedBy('slug', true)}
          />
        </FormField>

        <FormField
          id="category-description"
          label="Description"
          optional
          hint="Shown under the category title on the shop page."
          aside={
            <span className="text-xs text-muted-foreground tabular-nums">
              {values.description.length}/{DESCRIPTION_MAX}
            </span>
          }
        >
          <Textarea
            id="category-description"
            rows={4}
            maxLength={DESCRIPTION_MAX}
            placeholder="A short line that helps customers understand this category"
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
            aria-describedby={describedBy('description', true)}
          />
        </FormField>
      </FormSection>

      <FormSection title="Placement">
        <FormField
          id="category-parentId"
          label="Parent category"
          hint={
            hasChildren
              ? 'This category has subcategories, so it must stay at the top level.'
              : 'Choose a parent to make this a subcategory, e.g. Gym wear › Leggings.'
          }
        >
          <Select
            value={values.parentId}
            onValueChange={(value) => set('parentId', value)}
            disabled={hasChildren}
          >
            <SelectTrigger
              id="category-parentId"
              className="h-11 w-full sm:w-80"
              aria-describedby={describedBy('parentId', true)}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_PARENT}>None — top-level category</SelectItem>
              {parents.map((parent) => (
                <SelectItem key={parent.value} value={parent.value}>
                  {parent.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </FormSection>

      <FormSection
        title="Image"
        description={
          isTopLevel
            ? 'Shown on category tiles on the home page. Landscape images around 800 × 600 work best.'
            : 'Only top-level categories have images. Subcategories use their parent’s image.'
        }
      >
        {isTopLevel ? (
          <ImageUploader
            images={values.images}
            onChange={(images) => set('images', images)}
            max={1}
            aspect="landscape"
            label="Category image"
            disabled={saving}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Move this category to the top level to add an image.
          </p>
        )}
      </FormSection>

      <FormActionBar
        visible={mode === 'create' || dirty}
        saving={saving}
        message={mode === 'create' ? 'Ready to add this category?' : 'You have unsaved changes'}
        submitLabel={mode === 'create' ? 'Create category' : 'Save changes'}
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

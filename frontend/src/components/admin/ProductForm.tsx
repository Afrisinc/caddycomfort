import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { InputGroup } from '@/components/ui/input-group';
import { FormField } from '@/components/ui/form-field';
import { FormSection } from '@/components/ui/form-section';
import { FormActionBar } from '@/components/ui/form-action-bar';
import { SwitchField } from '@/components/ui/switch-field';
import { TagInput } from '@/components/ui/tag-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { UnsavedChangesGuard } from '@/components/common/UnsavedChangesGuard';
import { PriceDisplay } from '@/components/products/PriceDisplay';
import { StockStatus } from '@/components/products/StockStatus';
import { fieldDescribedBy } from '@/lib/forms';
import { getProductPricing } from '@/lib/pricing';
import { swatchColor } from '@/lib/swatches';
import { COLORS, SIZES } from '@/lib/shopFilters';
import {
  MAX_IMAGE_BYTES,
  MAX_PRODUCT_IMAGES,
  categoryOptions,
  formValuesToPayload,
  slugify,
  validateProduct,
  type ProductFormErrors,
  type ProductFormValues,
  type ProductPayload,
} from '@/lib/productForm';
import type { Category } from '@/types/api';

type Field = keyof ProductFormValues;

interface ProductFormProps {
  readonly mode: 'create' | 'edit';
  readonly initialValues: ProductFormValues;
  readonly categories: Category[];
  readonly onSubmit: (payload: ProductPayload) => Promise<void>;
  readonly onCancel: () => void;
}

const DESCRIPTION_MAX = 2000;

function ColorDot({ name }: Readonly<{ name: string }>) {
  const color = swatchColor(name);
  if (!color) return null;
  return (
    <span
      aria-hidden="true"
      className="h-3 w-3 shrink-0 rounded-full border border-black/10"
      style={{ backgroundColor: color }}
    />
  );
}

export function ProductForm({
  mode,
  initialValues,
  categories,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [values, setValues] = useState(initialValues);
  const [baseline, setBaseline] = useState(initialValues);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(mode === 'edit');

  const dirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(baseline),
    [values, baseline],
  );
  const options = useMemo(() => categoryOptions(categories), [categories]);
  const preview = getProductPricing({
    price: Number(values.price) || 0,
    salePrice: Number(values.salePrice) || null,
    comparePrice: Number(values.comparePrice) || null,
  });

  const set = <K extends Field>(field: K, value: ProductFormValues[K]) => {
    const next = { ...values, [field]: value };
    if (field === 'name' && !slugEdited) next.slug = slugify(String(value));
    setValues(next);
    if (errors[field]) setErrors(validateProduct(next));
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validateProduct(values);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      document.getElementById(`product-${firstInvalid}`)?.focus();
      return;
    }
    setSaving(true);
    try {
      await onSubmit(formValuesToPayload(values));
      setBaseline(values);
    } finally {
      setSaving(false);
    }
  };

  const field = (
    name: Field,
    label: string,
    control: (props: {
      id: string;
      'aria-invalid': boolean;
      'aria-describedby'?: string;
    }) => ReactNode,
    opts: { required?: boolean; hint?: ReactNode; className?: string; aside?: ReactNode } = {},
  ) => {
    const id = `product-${name}`;
    const error = errors[name];
    return (
      <FormField
        id={id}
        label={label}
        required={opts.required}
        optional={!opts.required}
        hint={opts.hint}
        error={error}
        aside={opts.aside}
        className={opts.className}
      >
        {control({
          id,
          'aria-invalid': !!error,
          'aria-describedby': fieldDescribedBy(id, !!opts.hint, !!error),
        })}
      </FormField>
    );
  };

  const moneyField = (
    name: 'price' | 'salePrice' | 'comparePrice',
    label: string,
    hint: string,
    required = false,
  ) =>
    field(
      name,
      label,
      (props) => (
        <InputGroup
          {...props}
          prefix="Rwf"
          type="number"
          inputMode="decimal"
          min={0}
          placeholder="0"
          value={values[name]}
          onChange={(e) => set(name, e.target.value)}
        />
      ),
      { required, hint },
    );

  return (
    <form onSubmit={submit} noValidate>
      <UnsavedChangesGuard when={dirty && !saving} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <FormSection
            title="Basic information"
            description="What customers see on the product page."
          >
            {field(
              'name',
              'Product name',
              (props) => (
                <Input
                  {...props}
                  className="h-11"
                  placeholder="e.g. High-Waist Seamless Leggings"
                  value={values.name}
                  onChange={(e) => set('name', e.target.value)}
                />
              ),
              { required: true },
            )}
            {field(
              'slug',
              'URL handle',
              (props) => (
                <Input
                  {...props}
                  className="h-11 font-mono text-sm"
                  placeholder="high-waist-seamless-leggings"
                  value={values.slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    set('slug', slugify(e.target.value) || e.target.value.toLowerCase());
                  }}
                />
              ),
              {
                hint:
                  mode === 'create' && !slugEdited
                    ? 'Created from the product name. Edit it if you want a different address.'
                    : 'Used in admin links. Lowercase letters, numbers and hyphens.',
              },
            )}
            {field(
              'description',
              'Description',
              (props) => (
                <Textarea
                  {...props}
                  rows={6}
                  maxLength={DESCRIPTION_MAX}
                  placeholder="Materials, fit, and what makes this piece special…"
                  value={values.description}
                  onChange={(e) => set('description', e.target.value)}
                />
              ),
              {
                required: true,
                aside: (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {values.description.length}/{DESCRIPTION_MAX}
                  </span>
                ),
              },
            )}
          </FormSection>

          <FormSection title="Pricing" description="All prices are in Rwandan francs.">
            <div className="grid gap-5 sm:grid-cols-3">
              {moneyField('price', 'Regular price', 'The normal selling price', true)}
              {moneyField('salePrice', 'Sale price', 'Customers pay this while it is set')}
              {moneyField(
                'comparePrice',
                'Compare-at price',
                'Shown crossed out, e.g. an old price',
              )}
            </div>
            {preview.current > 0 && (
              <div className="flex flex-wrap items-center gap-3 rounded-lg bg-muted/50 px-4 py-3 text-sm">
                <span className="text-muted-foreground">Customers see:</span>
                <PriceDisplay pricing={preview} size="sm" />
              </div>
            )}
          </FormSection>

          <FormSection title="Inventory">
            <div className="grid gap-5 sm:grid-cols-2">
              {field(
                'stockQuantity',
                'Stock quantity',
                (props) => (
                  <Input
                    {...props}
                    className="h-11"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={values.stockQuantity}
                    onChange={(e) => set('stockQuantity', e.target.value)}
                  />
                ),
                {
                  required: true,
                  hint: (
                    <StockStatus quantity={Number(values.stockQuantity) || 0} className="text-xs" />
                  ),
                },
              )}
              {field(
                'sku',
                'SKU',
                (props) => (
                  <Input
                    {...props}
                    className="h-11 font-mono text-sm"
                    placeholder="e.g. DRS-001"
                    value={values.sku}
                    onChange={(e) => set('sku', e.target.value.toUpperCase())}
                  />
                ),
                {
                  hint: mode === 'create' ? 'Leave empty to generate one automatically' : undefined,
                },
              )}
            </div>
          </FormSection>

          <FormSection
            title="Options"
            description="Customers choose from these on the product page. Leave empty if the product has no sizes or colors."
          >
            {field('sizes', 'Sizes', (props) => (
              <TagInput
                id={props.id}
                describedBy={props['aria-describedby']}
                values={values.sizes}
                onChange={(sizes) => set('sizes', sizes)}
                suggestions={SIZES}
                placeholder="Type a size and press Enter"
              />
            ))}
            {field('colors', 'Colors', (props) => (
              <TagInput
                id={props.id}
                describedBy={props['aria-describedby']}
                values={values.colors}
                onChange={(colors) => set('colors', colors)}
                suggestions={COLORS}
                renderIcon={(name) => <ColorDot name={name} />}
                placeholder="Type a color and press Enter"
              />
            ))}
          </FormSection>
        </div>

        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <FormSection title="Visibility">
            <SwitchField
              id="product-isActive"
              label="Visible in the shop"
              description={
                values.isActive
                  ? 'Customers can find and buy this product.'
                  : 'Saved as a draft, hidden from customers.'
              }
              checked={values.isActive}
              onCheckedChange={(checked) => set('isActive', checked)}
            />
            <SwitchField
              id="product-isFeatured"
              label="Featured"
              description="Shown in Featured products on the home page."
              checked={values.isFeatured}
              onCheckedChange={(checked) => set('isFeatured', checked)}
            />
          </FormSection>

          <FormSection title="Organization">
            {field(
              'categoryId',
              'Category',
              (props) => (
                <Select
                  value={values.categoryId}
                  onValueChange={(value) => set('categoryId', value)}
                >
                  <SelectTrigger {...props} className="h-11 w-full">
                    <SelectValue
                      placeholder={options.length ? 'Choose a category' : 'Loading categories…'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ),
              { required: true },
            )}
            {field(
              'tags',
              'Tags',
              (props) => (
                <TagInput
                  id={props.id}
                  describedBy={props['aria-describedby']}
                  values={values.tags}
                  onChange={(tags) => set('tags', tags)}
                  placeholder="e.g. summer, new-arrival"
                />
              ),
              { hint: 'Help customers find this product in search' },
            )}
          </FormSection>

          <FormSection title="Images" description="The first image is the cover.">
            <ImageUploader
              images={values.images}
              onChange={(images) => set('images', images)}
              max={MAX_PRODUCT_IMAGES}
              maxBytes={MAX_IMAGE_BYTES}
              disabled={saving}
            />
          </FormSection>
        </div>
      </div>

      <FormActionBar
        className="mt-6"
        visible={mode === 'create' || dirty}
        saving={saving}
        message={mode === 'create' ? 'Ready to add this product?' : 'You have unsaved changes'}
        submitLabel={mode === 'create' ? 'Create product' : 'Save changes'}
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

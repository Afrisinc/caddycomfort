import type { ComponentProps, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const headingVariants = cva('font-serif font-semibold tracking-tight text-foreground', {
  variants: {
    size: {
      xl: 'text-3xl md:text-4xl',
      lg: 'text-2xl md:text-3xl',
      md: 'text-xl md:text-2xl',
      sm: 'text-lg',
      xs: 'font-sans text-base',
    },
  },
  defaultVariants: { size: 'md' },
});

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export interface HeadingProps extends ComponentProps<'h2'>, VariantProps<typeof headingVariants> {
  readonly as?: HeadingTag;
}

export function Heading({ as: Tag = 'h2', size, className, ...props }: Readonly<HeadingProps>) {
  return <Tag className={cn(headingVariants({ size }), className)} {...props} />;
}

const textVariants = cva('', {
  variants: {
    variant: {
      lead: 'text-base leading-relaxed text-foreground/80 md:text-lg',
      body: 'text-[15px] leading-7 text-muted-foreground',
      small: 'text-sm leading-6 text-muted-foreground',
      caption: 'text-xs text-muted-foreground',
    },
  },
  defaultVariants: { variant: 'body' },
});

export interface TextProps extends ComponentProps<'p'>, VariantProps<typeof textVariants> {}

export function Text({ variant, className, ...props }: Readonly<TextProps>) {
  return <p className={cn(textVariants({ variant }), 'max-w-prose', className)} {...props} />;
}

export interface ContentSectionProps {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly action?: ReactNode;
  readonly children?: ReactNode;
  readonly className?: string;
}

export interface SectionHeaderProps {
  readonly title: ReactNode;
  readonly eyebrow?: ReactNode;
  readonly description?: ReactNode;
  readonly action?: ReactNode;
  readonly as?: HeadingTag;
  readonly size?: HeadingProps['size'];
  readonly align?: 'left' | 'center';
  readonly className?: string;
}

export function SectionHeader({
  title,
  eyebrow,
  description,
  action,
  as = 'h2',
  size = 'lg',
  align = 'left',
  className,
}: SectionHeaderProps) {
  const centered = align === 'center';
  return (
    <header
      className={cn(
        'flex flex-wrap gap-x-6 gap-y-3',
        centered ? 'flex-col items-center text-center' : 'items-end justify-between',
        className,
      )}
    >
      <div className={cn('space-y-2', centered && 'flex flex-col items-center')}>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-rose">
            {eyebrow}
          </p>
        )}
        <Heading as={as} size={size}>
          {title}
        </Heading>
        {description && <Text variant="small">{description}</Text>}
      </div>
      {action}
    </header>
  );
}

export function ContentSection({
  title,
  description,
  action,
  children,
  className,
}: ContentSectionProps) {
  return (
    <section className={cn('space-y-6', className)}>
      <SectionHeader as="h3" size="md" title={title} description={description} action={action} />
      {children}
    </section>
  );
}

export interface FeatureItemProps {
  readonly icon: LucideIcon;
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly className?: string;
}

export function FeatureItem({ icon: Icon, title, description, className }: FeatureItemProps) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-rose/10 text-accent-rose">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 text-sm leading-5">
        <p className="font-medium text-foreground">{title}</p>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

export interface InfoBlockProps {
  readonly icon?: LucideIcon;
  readonly title: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
}

export function InfoBlock({ icon: Icon, title, children, className }: InfoBlockProps) {
  return (
    <div className={cn('flex gap-4 rounded-xl border bg-card p-5', className)}>
      {Icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-rose/10 text-accent-rose">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0 space-y-1.5">
        <Heading as="h4" size="xs">
          {title}
        </Heading>
        <Text variant="small">{children}</Text>
      </div>
    </div>
  );
}

export interface DetailListProps {
  readonly items: { label: string; value: ReactNode }[];
  readonly bordered?: boolean;
  readonly className?: string;
}

export function DetailList({ items, bordered = true, className }: DetailListProps) {
  return (
    <dl className={cn('divide-y', bordered && 'rounded-xl border bg-card', className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            'grid grid-cols-[minmax(0,9rem)_1fr] items-center gap-4 py-3 text-sm',
            bordered && 'px-5 py-3.5',
          )}
        >
          <dt className="text-muted-foreground">{item.label}</dt>
          <dd className="font-medium text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

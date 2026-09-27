import type { ReactNode } from 'react';
import { SectionHeader } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

interface PageSectionProps {
  readonly title?: ReactNode;
  readonly eyebrow?: ReactNode;
  readonly description?: ReactNode;
  readonly action?: ReactNode;
  readonly align?: 'left' | 'center';
  readonly tone?: 'plain' | 'tint';
  readonly id?: string;
  readonly className?: string;
  readonly children: ReactNode;
}

export function PageSection({
  title,
  eyebrow,
  description,
  action,
  align,
  tone = 'plain',
  id,
  className,
  children,
}: PageSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'py-14 md:py-20',
        tone === 'tint' &&
          'bg-linear-to-br from-accent-rose-subtle via-background to-accent-rose-muted/30',
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {title && (
          <SectionHeader
            title={title}
            eyebrow={eyebrow}
            description={description}
            action={action}
            align={align}
            className="mb-8 md:mb-10"
          />
        )}
        {children}
      </div>
    </section>
  );
}

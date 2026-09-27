import { Fragment, type ReactNode } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Heading, Text } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

export interface Crumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly breadcrumbs?: Crumb[];
  readonly actions?: ReactNode;
  readonly className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('border-b bg-muted/30', className)}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              {breadcrumbs.map((crumb, i) => (
                <Fragment key={crumb.label}>
                  {i > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {crumb.href ? (
                      <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <Heading as="h1" size="xl">
              {title}
            </Heading>
            {description && <Text className="text-base">{description}</Text>}
          </div>
          {actions}
        </div>
      </div>
    </div>
  );
}

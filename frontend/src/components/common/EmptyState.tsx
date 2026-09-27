import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Heading, Text } from '@/components/ui/typography';

interface EmptyStateProps {
  readonly icon: LucideIcon;
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly action?: ReactNode;
  readonly className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-2xl border border-dashed bg-card px-6 py-16 text-center',
        className,
      )}
    >
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-rose/10 text-accent-rose">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <Heading as="h3" size="sm">
        {title}
      </Heading>
      {description && (
        <Text variant="small" className="mt-1.5">
          {description}
        </Text>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

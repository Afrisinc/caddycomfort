import type { LucideIcon } from 'lucide-react';
import Link from '@/components/common/Link';
import { cn } from '@/lib/utils';
import { formatCount } from '@/lib/navigation';

interface HeaderActionProps {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly href?: string;
  readonly onClick?: () => void;
  readonly count?: number;
  readonly className?: string;
}

const actionClass =
  'relative flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent-rose/40';

export function HeaderAction({
  icon: Icon,
  label,
  href,
  onClick,
  count = 0,
  className,
}: HeaderActionProps) {
  const accessibleLabel = count > 0 ? `${label} (${count})` : label;
  const content = (
    <>
      <Icon className="h-5 w-5" aria-hidden="true" />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-0.5 right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent-rose px-1 text-[10px] leading-none font-semibold tabular-nums text-white ring-2 ring-background"
        >
          {formatCount(count)}
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label={accessibleLabel}
        title={label}
        className={cn(actionClass, className)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={accessibleLabel}
      title={label}
      className={cn(actionClass, className)}
    >
      {content}
    </button>
  );
}

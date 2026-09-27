import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type StatusTone = 'green' | 'amber' | 'red' | 'blue' | 'violet' | 'rose' | 'neutral';

const tones: Record<StatusTone, string> = {
  green: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
  violet: 'bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300',
  rose: 'bg-accent-rose/10 text-accent-rose',
  neutral: 'bg-muted text-muted-foreground',
};

interface StatusPillProps {
  readonly tone?: StatusTone;
  readonly children: ReactNode;
  readonly className?: string;
}

export function StatusPill({ tone = 'neutral', children, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

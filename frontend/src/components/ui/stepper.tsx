import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepItem {
  id: string;
  label: string;
}

interface StepperProps {
  readonly steps: StepItem[];
  readonly current: string;
  readonly onStepClick?: (id: string) => void;
  readonly className?: string;
}

export function Stepper({ steps, current, onStepClick, className }: StepperProps) {
  const currentIndex = steps.findIndex((step) => step.id === current);

  return (
    <nav aria-label="Checkout progress" className={className}>
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          const clickable = done && onStepClick;
          const marker = (
            <>
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold tabular-nums transition-colors',
                  done && 'border-accent-rose bg-accent-rose text-white',
                  active && 'border-accent-rose text-accent-rose',
                  !done && !active && 'border-border text-muted-foreground',
                )}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={3} /> : index + 1}
              </span>
              <span
                className={cn(
                  'hidden text-sm font-medium sm:inline',
                  active ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </>
          );

          return (
            <li
              key={step.id}
              aria-current={active ? 'step' : undefined}
              className="flex flex-1 items-center gap-3 last:flex-none"
            >
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onStepClick(step.id)}
                  aria-label={`Back to ${step.label}`}
                  className="flex items-center gap-2.5 rounded-full outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-accent-rose/40"
                >
                  {marker}
                </button>
              ) : (
                <span className="flex items-center gap-2.5">
                  {marker}
                  <span className="sr-only">{active ? '(current step)' : ''}</span>
                </span>
              )}
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'mx-2 h-0.5 flex-1 rounded-full sm:mx-4',
                    done ? 'bg-accent-rose' : 'bg-border',
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-sm text-muted-foreground sm:hidden">
        Step {currentIndex + 1} of {steps.length}:{' '}
        <span className="font-medium text-foreground">{steps[currentIndex]?.label}</span>
      </p>
    </nav>
  );
}

import { useState, type ClipboardEvent, type KeyboardEvent, type ReactNode } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagInputProps {
  readonly id: string;
  readonly values: string[];
  readonly onChange: (values: string[]) => void;
  readonly placeholder?: string;
  readonly suggestions?: string[];
  readonly renderIcon?: (value: string) => ReactNode;
  readonly invalid?: boolean;
  readonly describedBy?: string;
  readonly className?: string;
}

function addUnique(current: string[], additions: string[]): string[] {
  const seen = new Set(current.map((v) => v.toLowerCase()));
  const next = [...current];
  for (const raw of additions) {
    const value = raw.trim();
    if (value && !seen.has(value.toLowerCase())) {
      seen.add(value.toLowerCase());
      next.push(value);
    }
  }
  return next;
}

export function TagInput({
  id,
  values,
  onChange,
  placeholder,
  suggestions = [],
  renderIcon,
  invalid,
  describedBy,
  className,
}: TagInputProps) {
  const [draft, setDraft] = useState('');
  const remaining = suggestions.filter(
    (s) => !values.some((v) => v.toLowerCase() === s.toLowerCase()),
  );

  const commit = (text: string) => {
    const parts = text.split(',');
    if (parts.some((p) => p.trim())) onChange(addUnique(values, parts));
    setDraft('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit(draft);
    } else if (e.key === 'Backspace' && !draft && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (text.includes(',')) {
      e.preventDefault();
      commit(text);
    }
  };

  return (
    <div className={cn('space-y-2.5', className)}>
      <div
        className={cn(
          'flex min-h-11 flex-wrap items-center gap-1.5 rounded-md border bg-background px-2 py-1.5 shadow-xs transition-[color,box-shadow] focus-within:border-accent-rose/50 focus-within:ring-[3px] focus-within:ring-accent-rose/20',
          invalid ? 'border-red-500/60' : 'border-input',
        )}
      >
        {values.map((value) => (
          <span
            key={value}
            className="inline-flex h-7 items-center gap-1.5 rounded-full bg-muted pr-1 pl-2.5 text-sm"
          >
            {renderIcon?.(value)}
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((v) => v !== value))}
              aria-label={`Remove ${value}`}
              className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent-rose/40"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onBlur={() => draft.trim() && commit(draft)}
          placeholder={values.length === 0 ? placeholder : 'Add more…'}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className="h-7 min-w-24 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      {remaining.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {remaining.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onChange(addUnique(values, [suggestion]))}
              className="inline-flex h-7 items-center gap-1 rounded-full border border-dashed px-2.5 text-xs text-muted-foreground transition-colors outline-none hover:border-foreground/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent-rose/40"
            >
              <Plus className="h-3 w-3" />
              {renderIcon?.(suggestion)}
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

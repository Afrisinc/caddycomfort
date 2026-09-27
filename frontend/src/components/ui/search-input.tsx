import { useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly label: string;
  readonly placeholder?: string;
  readonly size?: 'md' | 'lg';
  readonly className?: string;
  readonly id?: string;
}

const sizes = {
  md: { input: 'h-10 pl-9 pr-9 text-sm', icon: 'left-3 h-4 w-4', clear: 'right-2 h-6 w-6' },
  lg: { input: 'h-12 pl-12 pr-11 text-base', icon: 'left-4 h-5 w-5', clear: 'right-3 h-7 w-7' },
};

export function SearchInput({
  value,
  onValueChange,
  label,
  placeholder,
  size = 'md',
  className,
  id,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const styles = sizes[size];

  return (
    <div className={cn('relative', className)}>
      <Search
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground',
          styles.icon,
        )}
      />
      <input
        ref={inputRef}
        id={id}
        type="search"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && value) {
            e.preventDefault();
            onValueChange('');
          }
        }}
        placeholder={placeholder}
        aria-label={label}
        autoComplete="off"
        spellCheck={false}
        className={cn(
          'w-full min-w-0 rounded-md border border-input bg-background shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-accent-rose/50 focus-visible:ring-[3px] focus-visible:ring-accent-rose/20 [&::-webkit-search-cancel-button]:hidden',
          styles.input,
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onValueChange('');
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className={cn(
            'absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent-rose/40',
            styles.clear,
          )}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

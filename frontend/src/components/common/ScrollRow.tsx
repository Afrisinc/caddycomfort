import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollRowProps {
  readonly label: string;
  readonly children: ReactNode;
  readonly itemClassName?: string;
  readonly className?: string;
}

const arrowClass =
  'absolute top-1/3 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background/95 shadow-md backdrop-blur-sm transition-all outline-none hover:bg-background hover:shadow-lg focus-visible:ring-2 focus-visible:ring-accent-rose/40 disabled:pointer-events-none disabled:opacity-0 pointer-fine:flex';

export function ScrollRow({
  label,
  children,
  itemClassName = 'w-[46%] sm:w-[31%] lg:w-[23.5%]',
  className,
}: ScrollRowProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    updateEdges();
    const el = trackRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateEdges, children]);

  const scrollByPage = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => scrollByPage(-1)}
        disabled={edges.start}
        aria-label={`Scroll ${label} left`}
        className={cn(arrowClass, '-left-4')}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <ul
        ref={trackRef}
        onScroll={updateEdges}
        aria-label={label}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:gap-5 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {Children.map(children, (child) => (
          <li className={cn('shrink-0 snap-start', itemClassName)}>{child}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => scrollByPage(1)}
        disabled={edges.end}
        aria-label={`Scroll ${label} right`}
        className={cn(arrowClass, '-right-4')}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

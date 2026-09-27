import { useCallback, useEffect, useRef, useState, type MouseEvent, type TouchEvent } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ImageLightboxProps {
  readonly images: string[];
  readonly open: boolean;
  readonly index: number;
  readonly onOpenChange: (open: boolean) => void;
  readonly onIndexChange: (index: number) => void;
  readonly alt?: string;
}

const controlButton =
  'flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-40';

export function ImageLightbox({
  images,
  open,
  index,
  onOpenChange,
  onIndexChange,
  alt = 'Image',
}: ImageLightboxProps) {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const touchStartX = useRef<number | null>(null);
  const total = images.length;
  const hasMany = total > 1;

  const go = useCallback(
    (delta: number) => {
      if (!hasMany) return;
      onIndexChange((index + delta + total) % total);
    },
    [hasMany, index, total, onIndexChange],
  );

  useEffect(() => {
    setZoomed(false);
    setOrigin('50% 50%');
  }, [index, open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, go]);

  const updateOrigin = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  const toggleZoom = (e: MouseEvent<HTMLButtonElement>) => {
    if (e.detail > 0) updateOrigin(e);
    setZoomed((z) => !z);
  };

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null || zoomed) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  const src = images[index];

  return (
    <DialogPrimitive.Root open={open && !!src} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-100 bg-black/90 backdrop-blur-sm" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 fixed inset-0 z-100 flex flex-col outline-none duration-200"
        >
          <DialogPrimitive.Title className="sr-only">{alt}</DialogPrimitive.Title>

          <div className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium tabular-nums text-white/90 backdrop-blur-md">
              {hasMany ? `${index + 1} / ${total}` : alt}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomed((z) => !z)}
                className={cn(controlButton, 'hidden h-10 w-10 sm:flex')}
                aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
              >
                {zoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
              </button>
              <DialogPrimitive.Close className={cn(controlButton, 'h-10 w-10')} aria-label="Close">
                <X className="h-5 w-5" />
              </DialogPrimitive.Close>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 sm:px-20">
            <DialogPrimitive.Close
              tabIndex={-1}
              aria-hidden="true"
              className="absolute inset-0 cursor-default"
            />
            {src && (
              <button
                type="button"
                onClick={toggleZoom}
                onMouseMove={zoomed ? updateOrigin : undefined}
                aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
                className={cn(
                  'relative flex max-h-full max-w-full focus-visible:outline-none',
                  zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in',
                )}
              >
                <img
                  key={src}
                  src={src}
                  alt={hasMany ? `${alt} ${index + 1} of ${total}` : alt}
                  draggable={false}
                  style={{ transformOrigin: origin }}
                  className={cn(
                    'animate-in fade-in-0 max-h-[calc(100vh-10rem)] max-w-full select-none object-contain transition-transform duration-300 ease-out',
                    zoomed && 'scale-[2.2]',
                  )}
                />
              </button>
            )}

            {hasMany && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className={cn(
                    controlButton,
                    'absolute left-3 top-1/2 h-11 w-11 -translate-y-1/2 sm:left-6',
                  )}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className={cn(
                    controlButton,
                    'absolute right-3 top-1/2 h-11 w-11 -translate-y-1/2 sm:right-6',
                  )}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {hasMany ? (
            <div className="flex h-24 shrink-0 items-center justify-center gap-2 overflow-x-auto px-4">
              {images.map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  type="button"
                  onClick={() => onIndexChange(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-current={i === index || undefined}
                  className={cn(
                    'h-14 w-14 shrink-0 overflow-hidden rounded-md ring-2 transition-all focus-visible:outline-none focus-visible:ring-white',
                    i === index
                      ? 'opacity-100 ring-white'
                      : 'opacity-50 ring-transparent hover:opacity-90',
                  )}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" draggable={false} />
                </button>
              ))}
            </div>
          ) : (
            <div className="h-8 shrink-0" />
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export interface ImageZoomTriggerProps {
  readonly onClick: () => void;
  readonly label?: string;
  readonly className?: string;
}

export function ImageZoomTrigger({
  onClick,
  label = 'View full image',
  className,
}: ImageZoomTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'group/zoom absolute inset-0 z-5 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-rose/60',
        className,
      )}
    >
      <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/85 text-foreground opacity-0 shadow-md backdrop-blur-sm transition-opacity duration-200 group-hover/zoom:opacity-100 group-focus-visible/zoom:opacity-100">
        <Maximize2 className="h-4 w-4" />
      </span>
    </button>
  );
}

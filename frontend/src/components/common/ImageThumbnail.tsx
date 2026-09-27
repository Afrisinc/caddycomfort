import type { LucideIcon } from 'lucide-react';
import { ImageOff } from 'lucide-react';
import Image from '@/components/common/Image';
import { ImageLightbox } from '@/components/common/ImageLightbox';
import { useImageLightbox } from '@/hooks/useImageLightbox';
import { cn } from '@/lib/utils';

interface ImageThumbnailProps {
  readonly images: (string | null | undefined)[];
  readonly alt: string;
  readonly size?: 'sm' | 'md';
  readonly fallbackIcon?: LucideIcon;
  readonly className?: string;
}

const sizes = { sm: 'h-10 w-10', md: 'h-12 w-12' };

export function ImageThumbnail({
  images,
  alt,
  size = 'md',
  fallbackIcon: FallbackIcon = ImageOff,
  className,
}: ImageThumbnailProps) {
  const lightbox = useImageLightbox();
  const sources = images.filter((src): src is string => !!src);
  const placeholder = (
    <FallbackIcon className="absolute inset-0 m-auto h-4 w-4 text-muted-foreground" />
  );
  const base = cn(
    'relative shrink-0 overflow-hidden rounded-lg border border-border/50 bg-muted',
    sizes[size],
    className,
  );

  if (sources.length === 0) {
    return (
      <span className={base} aria-hidden="true">
        {placeholder}
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => lightbox.openAt(0)}
        aria-label={
          sources.length > 1 ? `View ${sources.length} images of ${alt}` : `View image of ${alt}`
        }
        className={cn(
          base,
          'group/thumb cursor-zoom-in transition-all outline-none hover:border-accent-rose/50 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-accent-rose/50',
        )}
      >
        <Image
          src={sources[0]}
          alt=""
          fill
          sizes="48px"
          className="object-cover transition-transform duration-300 group-hover/thumb:scale-110"
          fallback={placeholder}
        />
        {sources.length > 1 && (
          <span className="absolute right-0.5 bottom-0.5 rounded bg-black/60 px-1 text-[10px] leading-4 font-medium text-white tabular-nums">
            {sources.length}
          </span>
        )}
      </button>
      <ImageLightbox
        images={sources}
        open={lightbox.open}
        index={lightbox.index}
        onOpenChange={lightbox.onOpenChange}
        onIndexChange={lightbox.setIndex}
        alt={alt}
      />
    </>
  );
}

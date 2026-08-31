import { forwardRef, type ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  sizes?: string;
}

const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ src, alt, fill, priority, quality, sizes, className, style, loading, ...props }, ref) => {
    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        sizes={sizes}
        loading={priority ? 'eager' : (loading ?? 'lazy')}
        fetchPriority={priority ? 'high' : 'auto'}
        className={cn(fill && 'absolute inset-0 h-full w-full', className)}
        style={fill ? { ...style, objectFit: style?.objectFit ?? undefined } : style}
        {...props}
      />
    );
  },
);

Image.displayName = 'Image';

export default Image;

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  readonly rating: number;
  readonly size?: 'sm' | 'md';
  readonly className?: string;
}

export function RatingStars({ rating, size = 'sm', className }: RatingStarsProps) {
  const rounded = Math.round(rating);
  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      role="img"
      aria-label={`Rated ${rating.toFixed(1)} out of 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={cn(
            size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
            i < rounded ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/30',
          )}
        />
      ))}
    </div>
  );
}

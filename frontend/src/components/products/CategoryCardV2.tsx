import { ArrowRight } from 'lucide-react';
import Link from '@/components/common/Link';
import Image from '@/components/common/Image';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  title: string;
  image?: string;
  href?: string;
  parentName?: string;
  className?: string;
}

export function CategoryCardV2({
  title,
  image,
  href = '#',
  parentName,
  className = '',
}: CategoryCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative block aspect-4/5 w-full overflow-hidden rounded-2xl bg-muted shadow-sm outline-none transition-shadow duration-300 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-accent-rose/60',
        className,
      )}
    >
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-accent-rose-subtle via-accent-rose-muted to-accent-rose-subtle"
        >
          <span className="font-serif text-7xl font-bold text-accent-rose/25">
            {title.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-black/70 via-black/25 to-transparent"
      />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 md:p-4">
        <div className="min-w-0">
          {parentName && (
            <p className="truncate text-[11px] font-medium uppercase tracking-wider text-white/75">
              {parentName}
            </p>
          )}
          <h3 className="line-clamp-2 font-serif text-lg leading-tight font-bold text-white drop-shadow md:text-xl">
            {title}
          </h3>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/25 backdrop-blur-md transition-colors group-hover:bg-accent-rose">
          <ArrowRight className="h-4 w-4 text-white" />
        </span>
      </div>
    </Link>
  );
}

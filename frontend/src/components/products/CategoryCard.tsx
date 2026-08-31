import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import Link from '@/components/common/Link';
import Image from '@/components/common/Image';

interface CategoryCardProps {
  title: string;
  image?: string;
  href?: string;
  className?: string;
}

export function CategoryCard({ title, image, href = '#', className = '' }: CategoryCardProps) {
  return (
    <Link href={href}>
      <Card
        className={`group relative overflow-hidden border-0 shadow-sm hover:shadow-luxury transition-luxury cursor-pointer bg-card hover:bg-gradient-to-r hover:from-accent-rose-subtle hover:to-accent-rose-muted/50 !py-0 ${className}`}
      >
        <div className="flex items-center gap-3 px-3 py-2">
          {/* Small Rounded Image on Left */}
          <div className="relative w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full overflow-hidden bg-gradient-to-br from-accent-rose-subtle to-accent-rose-muted">
            {image ? (
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl md:text-3xl opacity-30">👗</span>
              </div>
            )}
          </div>

          {/* Category Name in Middle */}
          <div className="flex-1 min-w-0">
            <span className="text-sm md:text-base font-semibold text-foreground group-hover:text-accent-rose transition-colors line-clamp-1">
              {title}
            </span>
          </div>

          {/* Arrow Icon on Right */}
          <div className="shrink-0">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-accent-rose-subtle group-hover:bg-accent-rose flex items-center justify-center transition-all duration-300 group-hover:translate-x-1">
              <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-accent-rose group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import Link from '@/components/common/Link';
import Image from '@/components/common/Image';
import { motion } from 'framer-motion';

interface CategoryCardProps {
  title: string;
  image?: string;
  href?: string;
  className?: string;
}

export function CategoryCardV2({ title, image, href = '#', className = '' }: CategoryCardProps) {
  return (
    <Link href={href}>
      <Card
        className={`group relative overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer bg-gradient-to-br from-background to-muted/30 h-[160px] md:h-[180px] ${className}`}
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          {image ? (
            <>
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover group-hover:scale-125 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {/* Enhanced Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 group-hover:from-black/95 group-hover:via-black/70 group-hover:to-black/40 transition-all duration-500" />
              {/* Accent Gradient Overlay for Visual Appeal */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-rose/20 via-transparent to-accent-rose/10 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              {/* Animated Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-accent-rose-subtle via-accent-rose-muted to-accent-rose-subtle">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl md:text-7xl opacity-20">👗</span>
              </div>
            </div>
          )}
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-3 md:p-4 z-10">
          {/* Category Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-2"
          >
            <h3 className="text-lg md:text-xl font-serif font-bold text-white drop-shadow-lg group-hover:translate-x-2 transition-transform duration-300">
              {title}
            </h3>
          </motion.div>

          {/* Arrow Button */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-white/20 backdrop-blur-md group-hover:bg-accent-rose flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg">
              <ArrowRight className="h-4 w-4 md:h-5 md:w-5 text-white group-hover:translate-x-1 transition-transform duration-300" />
            </div>
            <span className="text-xs md:text-sm font-medium text-white/90 group-hover:text-white transition-colors">
              Explore
            </span>
          </motion.div>
        </div>
      </Card>
    </Link>
  );
}

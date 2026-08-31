import Link from '@/components/common/Link';
import Image from '@/components/common/Image';
import { Card } from '@/components/ui/card';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { toProductCardProps } from '@/lib/productCard';
import { Product } from '@/types/api';

import 'swiper/css';
import 'swiper/css/autoplay';

export function HomeFlashSaleCarousel({ products }: { products: Product[] }) {
  return (
    <div className="relative">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={16}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 24 },
          1280: { slidesPerView: 4, spaceBetween: 24 },
        }}
        autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        loop={products.length >= 4}
        className="!pb-4"
      >
        {products.map((product) => {
          const cardProps = toProductCardProps(product);
          return (
            <SwiperSlide key={`flash-sale-${product.id}`}>
              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 hover:border-white/30 transition-all overflow-visible group shadow-lg">
                <Link href={`/shop/${product.id}`}>
                  <div className="relative h-[200px] md:h-[220px] overflow-visible p-3">
                    <div className="relative w-full h-full overflow-hidden rounded-lg">
                      {cardProps.image ? (
                        <Image
                          src={cardProps.image}
                          alt={cardProps.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/10"></div>
                      )}
                      {cardProps.discount && (
                        <div className="absolute top-2 right-2 bg-accent-rose-dark text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg z-10 animate-pulse">
                          {cardProps.discount} Off
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-full text-xs font-semibold z-10">
                        ⚡ Flash
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="px-4 pb-4 pt-2 space-y-1.5 bg-gradient-to-b from-white/5 to-transparent">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">{cardProps.price}</span>
                    {cardProps.originalPrice && (
                      <span className="text-xs text-white/60 line-through">
                        {cardProps.originalPrice}
                      </span>
                    )}
                  </div>
                  <Link href={`/shop/${product.id}`}>
                    <h4 className="text-sm font-semibold text-white hover:text-white/80 transition-colors line-clamp-2 min-h-10">
                      {cardProps.title}
                    </h4>
                  </Link>
                  {product.category && (
                    <Link href={`/shop?category=${product.category.slug}`}>
                      <h5 className="text-xs text-white/70 hover:text-white transition-colors uppercase tracking-wide">
                        {product.category.name}
                      </h5>
                    </Link>
                  )}
                </div>
              </Card>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}

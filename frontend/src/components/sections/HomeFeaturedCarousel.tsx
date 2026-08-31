import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { ProductCard } from '@/components/products/ProductCard';
import { toProductCardProps } from '@/lib/productCard';
import { Product } from '@/types/api';

import 'swiper/css';
import 'swiper/css/autoplay';

export function HomeFeaturedCarousel({ products }: { products: Product[] }) {
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
        autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        loop={products.length >= 4}
        className="!pb-12"
      >
        {products.map((product) => (
          <SwiperSlide key={`featured-${product.id}`}>
            <ProductCard {...toProductCardProps(product)} href={`/shop/${product.id}`} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

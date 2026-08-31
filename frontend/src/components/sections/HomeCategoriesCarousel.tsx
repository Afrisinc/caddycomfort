import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { CategoryCardV2 } from '@/components/products/CategoryCardV2';
import { Category } from '@/types/api';

import 'swiper/css';
import 'swiper/css/autoplay';

export function HomeCategoriesCarousel({ categories }: { categories: Category[] }) {
  return (
    <div className="relative">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={16}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 4, spaceBetween: 16 },
        }}
        autoplay={{ delay: 2500, disableOnInteraction: false, pauseOnMouseEnter: false }}
        loop={categories.length > 4}
        loopAdditionalSlides={4}
        speed={800}
        className="!pb-12"
      >
        {categories.map((category) => (
          <SwiperSlide key={category.id}>
            <CategoryCardV2
              title={category.name}
              href={`/shop?category=${category.slug}`}
              image={category.image || undefined}
            />
          </SwiperSlide>
        ))}
        {categories.length > 4 &&
          categories.map((category) => (
            <SwiperSlide key={`dup-${category.id}`}>
              <CategoryCardV2
                title={category.name}
                href={`/shop?category=${category.slug}`}
                image={category.image || undefined}
              />
            </SwiperSlide>
          ))}
      </Swiper>
    </div>
  );
}

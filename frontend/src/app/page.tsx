import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroBanner } from '@/components/sections/HeroBanner';
import { HomeCategoriesCarousel } from '@/components/sections/HomeCategoriesCarousel';
import { HomeFeaturedCarousel } from '@/components/sections/HomeFeaturedCarousel';
import { HomeFlashSaleCarousel } from '@/components/sections/HomeFlashSaleCarousel';
import { NewsletterSection } from '@/components/sections/NewsletterSection';
import { CountdownTimer } from '@/components/sections/CountdownTimer';
import {
  getHomeCategories,
  getFeaturedProducts,
  getMostSellingProducts,
  getFlashSaleProducts,
} from '@/lib/server-data';

export const revalidate = 300;

export default async function Home() {
  const [categories, featuredProducts, mostSellingProducts, flashSaleProducts] = await Promise.all([
    getHomeCategories().catch(() => []),
    getFeaturedProducts().catch(() => []),
    getMostSellingProducts().catch(() => []),
    getFlashSaleProducts().catch(() => []),
  ]);

  const flashSaleEndDate = new Date();
  flashSaleEndDate.setDate(flashSaleEndDate.getDate() + 15);
  flashSaleEndDate.setHours(23, 36, 55, 0);

  return (
    <>
      <Navbar />

      <HeroBanner
        slides={[
          {
            subtitle: 'New Arrival',
            title: 'Step into Style with Our Premium Shoes Collection',
            description: 'Starting From',
            ctaText: 'SHOP NOW',
            ctaLink: '/shop',
            image: '/new-images/hero-1.jpg',
            gradient: 'from-accent-rose-subtle via-accent-rose-muted to-accent-rose-subtle',
          },
          {
            subtitle: 'Perfect for Summer Evenings',
            title: 'Elegant Dresses for Every Beautiful Moment',
            description: 'Starting From',
            ctaText: 'EXPLORE COLLECTION',
            ctaLink: '/shop',
            image: '/new-images/hero-4.jpg',
            gradient: 'from-purple-100 via-pink-100 to-rose-100',
          },
          {
            subtitle: 'Limited Edition',
            title: 'Transform Your Look with Stunning Wigs',
            description: 'Starting From',
            ctaText: 'DISCOVER MORE',
            ctaLink: '/shop',
            image: '/new-images/hero-3.jpg',
            gradient: 'from-blue-100 via-indigo-100 to-purple-100',
          },
        ]}
        autoPlayInterval={5000}
      />

      {categories.length > 0 && (
        <section className="py-16 md:py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
              <div className="mb-6 md:mb-0">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-accent-rose uppercase tracking-wider mb-3 px-4 py-1.5 bg-accent-rose-subtle/50 rounded-full">
                  <Star className="h-3.5 w-3.5 fill-accent-rose" />
                  Categories
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-2">
                  Explore Our All Categories
                </h2>
                <p className="text-muted-foreground max-w-xl">
                  Discover our wide range of fashion categories to find your perfect style
                </p>
              </div>
            </div>

            <HomeCategoriesCarousel categories={categories} />
          </div>
        </section>
      )}

      {featuredProducts.length > 0 && (
        <section className="bg-gradient-to-b from-background via-accent-rose-subtle/20 to-background relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-96 h-96 bg-accent-rose rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-rose-muted rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
              <div className="mb-6 md:mb-0">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-accent-rose uppercase tracking-wider mb-3 px-4 py-1.5 bg-accent-rose-subtle/50 rounded-full">
                  <Star className="h-3.5 w-3.5 fill-accent-rose" />
                  Summer collection
                </span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-2">
                  Shopping Every Day
                </h2>
                <p className="text-muted-foreground max-w-xl">
                  Discover our curated selection of premium fashion pieces
                </p>
              </div>
              <div className="flex items-center">
                <Link href="/shop">
                  <Button size="lg" className="bg-accent-rose hover:bg-accent-rose-dark text-white">
                    More Collection
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <HomeFeaturedCarousel products={featuredProducts} />
          </div>
        </section>
      )}

      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="relative overflow-hidden border-0 shadow-luxury bg-gradient-to-br from-accent-rose-subtle via-background to-accent-rose-subtle/30">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-end p-6 md:p-8">
              <div className="space-y-4 text-center md:text-left">
                <span className="inline-block text-sm font-medium text-accent-rose uppercase tracking-wider">
                  Trending Products
                </span>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif">
                  Get Discount On Our Products!
                </h2>

                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {['Dress', 'Wigs', 'Handbag', 'Shoes'].map((brand) => (
                    <span
                      key={brand}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-card rounded-full text-xs md:text-sm border"
                    >
                      <span className="text-accent-rose">✓</span>
                      {brand}
                    </span>
                  ))}
                </div>

                <Link href="/shop">
                  <Button size="lg" className="bg-accent-rose hover:bg-accent-rose-dark text-white mt-4">
                    Check Discount
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="relative h-[200px] md:h-[250px] rounded-lg overflow-hidden self-end">
                <Image
                  src="/new-images/png/bag-1.png"
                  alt="Discount Offer"
                  fill
                  className="object-contain object-bottom"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {mostSellingProducts.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-card rounded-xl border shadow-sm p-6 md:p-8">
              <div className="mb-8 text-left">
                <span className="inline-block text-sm font-medium text-accent-rose uppercase tracking-wider mb-2">
                  most selling items
                </span>
                <h2 className="text-2xl md:text-3xl font-serif">
                  Top selling Categories This Week
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {mostSellingProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group flex items-center gap-4 p-4 rounded-lg hover:bg-accent-rose-subtle/30 transition-colors cursor-pointer"
                  >
                    <Link href={`/shop/${product.id}`} className="shrink-0">
                      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-muted">
                        {product.imageUrl || product.images[0] ? (
                          <Image
                            src={product.imageUrl || product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="96px"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-accent-rose-subtle to-accent-rose-muted"></div>
                        )}
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <span className="text-sm md:text-base font-semibold text-foreground">
                        Rwf {product.price.toLocaleString()}
                      </span>
                      <Link href={`/shop/${product.id}`}>
                        <h4 className="text-sm md:text-base font-medium hover:text-accent-rose transition-colors line-clamp-2">
                          {product.name}
                        </h4>
                      </Link>
                      {product.category && (
                        <Link href={`/shop?category=${product.category.slug}`}>
                          <h5 className="text-xs text-muted-foreground hover:text-accent-rose transition-colors">
                            {product.category.name}
                          </h5>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      )}

      {flashSaleProducts.length > 0 && (
        <section className="py-12 md:py-16 bg-gradient-to-br from-accent-rose-dark via-accent-rose to-accent-rose-light text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.1) 35px, rgba(255,255,255,0.1) 70px)`,
              }}
            ></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-6">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                  <span className="text-sm font-medium text-white uppercase tracking-wider">
                    Flash Sale
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-white mb-3">
                  Trending Flash Sell
                </h2>
                <p className="text-white/80 max-w-xl">
                  Limited time offer! Don&apos;t miss out on these amazing deals
                </p>
              </div>

              <div className="flex flex-col items-center lg:items-end gap-4">
                <div className="text-center lg:text-right">
                  <p className="text-sm text-white/70 mb-2 uppercase tracking-wider">Ends In</p>
                </div>
                <CountdownTimer targetDate={flashSaleEndDate} className="mt-0" />
              </div>

              <Link href="/shop" className="lg:ml-4">
                <Button size="lg" variant="secondary" className="bg-white text-accent-rose hover:bg-white/90 w-full lg:w-auto shadow-lg">
                  View All Collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <HomeFlashSaleCarousel products={flashSaleProducts} />
          </div>
        </section>
      )}

      <NewsletterSection />

      <Footer />
    </>
  );
}

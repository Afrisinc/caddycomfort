import { ArrowRight, Award, Clock, Heart, MapPin, Sparkles, Users } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from '@/components/common/Link';
import Image from '@/components/common/Image';
import { ContactMethod } from '@/components/common/ContactMethod';
import { CtaBanner } from '@/components/common/CtaBanner';
import { CategoryCardV2 } from '@/components/products/CategoryCardV2';
import { Button } from '@/components/ui/button';
import { Heading, InfoBlock, SectionHeader, Text } from '@/components/ui/typography';
import { useContactInfo } from '@/hooks/useContactInfo';

const VALUES = [
  {
    icon: Award,
    title: 'Quality first',
    description: 'Only the finest materials and craftsmanship make it into our collection.',
  },
  {
    icon: Heart,
    title: 'Customer care',
    description:
      'Your satisfaction is our priority, with personalized service every step of the way.',
  },
  {
    icon: Sparkles,
    title: 'Timeless style',
    description: 'We curate pieces that remain elegant and relevant season after season.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Building a community of fashion enthusiasts who appreciate true luxury.',
  },
];

const COLLECTIONS = [
  { title: 'Dresses', image: '/new-images/dress/dress-1.jpg', href: '/shop?category=dresses' },
  { title: 'Shoes', image: '/new-images/Shoes/shoe-1.jpg', href: '/shop?category=shoes' },
  { title: 'Bags', image: '/new-images/bag/bag-1.jpg', href: '/shop?category=bags' },
  { title: 'Wigs', image: '/new-images/wigs/wig-1.jpg', href: '/shop?category=wigs' },
];

export default function AboutPage() {
  const contact = useContactInfo();
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background pt-20">
        <section className="border-b bg-muted/30">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-rose">
                Our story
              </p>
              <Heading as="h1" size="xl" className="max-w-xl leading-tight">
                Timeless elegance, curated in Kigali
              </Heading>
              <Text variant="lead">
                Crafting timeless elegance since 2026, CaddyComfort brings you curated luxury
                fashion that celebrates individuality and sophistication.
              </Text>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  asChild
                  size="lg"
                  className="h-11 gap-2 bg-accent-rose hover:bg-accent-rose-dark"
                >
                  <Link href="/shop">
                    Shop the collection
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-11">
                  <Link href="/contact">Contact us</Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-4/5 overflow-hidden rounded-3xl bg-muted shadow-xl sm:aspect-square lg:aspect-4/5">
              <Image
                src="/new-images/hero-4.jpg"
                alt="Inside the CaddyComfort boutique, surrounded by dresses and printed fabrics"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl space-y-20 px-4 py-16 sm:px-6 md:space-y-28 md:py-24 lg:px-8">
          <section className="grid grid-cols-1 gap-8 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-16">
            <SectionHeader eyebrow="Our mission" title="Fashion as an expression of who you are" />
            <div className="grid gap-6 md:grid-cols-2 md:gap-10">
              <Text className="text-base">
                At CaddyComfort, we believe that fashion is more than just clothing—it&apos;s an
                expression of who you are. Our mission is to provide discerning customers with
                access to the finest luxury fashion pieces that blend timeless elegance with
                contemporary style.
              </Text>
              <Text className="text-base">
                Every item in our collection is carefully selected for its quality, craftsmanship,
                and ability to transcend trends. We&apos;re committed to sustainability, ethical
                sourcing, and creating a shopping experience that&apos;s as exceptional as the
                pieces we offer.
              </Text>
            </div>
          </section>

          <section>
            <SectionHeader
              eyebrow="What we stand for"
              title="Our values"
              align="center"
              className="mb-10"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {VALUES.map((value) => (
                <InfoBlock key={value.title} icon={value.icon} title={value.title} className="p-6">
                  {value.description}
                </InfoBlock>
              ))}
            </div>
          </section>

          <section>
            <SectionHeader
              eyebrow="Explore"
              title="What you'll find"
              className="mb-8"
              action={
                <Link
                  href="/shop"
                  className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 transition-colors hover:text-accent-rose"
                >
                  Shop all
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              }
            />
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {COLLECTIONS.map((collection) => (
                <CategoryCardV2 key={collection.href} {...collection} />
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="relative order-last aspect-4/3 overflow-hidden rounded-3xl bg-muted lg:order-first">
              <Image
                src="/new-images/hero-2.jpg"
                alt="Wigs, handbags and heels on display in the CaddyComfort store"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-6">
              <SectionHeader eyebrow="Visit us" title="Come see us in store" />
              <Text className="text-base">
                Experience our collection in person at our store in the heart of Kigali. Our team is
                ready to assist you with personalized styling and expert advice.
              </Text>
              <div className="grid gap-3 sm:grid-cols-2">
                <ContactMethod
                  icon={MapPin}
                  label="Address"
                  value={contact.address}
                  href={contact.mapsHref}
                  external
                />
                <ContactMethod icon={Clock} label="Opening hours" value={contact.hours} />
              </div>
            </div>
          </section>

          <CtaBanner
            title="Find your next favorite piece"
            description="Browse dresses, shoes, bags and wigs selected for quality and timeless style."
            actions={
              <>
                <Button
                  asChild
                  size="lg"
                  className="h-11 gap-2 bg-accent-rose hover:bg-accent-rose-dark"
                >
                  <Link href="/shop">
                    Shop now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-11 bg-background/80">
                  <Link href="/contact">Get in touch</Link>
                </Button>
              </>
            }
          />
        </div>
      </main>

      <Footer />
    </>
  );
}

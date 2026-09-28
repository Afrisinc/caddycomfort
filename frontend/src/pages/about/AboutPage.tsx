import {
  ArrowRight,
  Award,
  Clock,
  Feather,
  Heart,
  MapPin,
  Move,
  Smile,
  Sparkles,
  Sun,
  Users,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from '@/components/common/Link';
import Image from '@/components/common/Image';
import { ContactMethod } from '@/components/common/ContactMethod';
import { CtaBanner } from '@/components/common/CtaBanner';
import { CategoryCardV2 } from '@/components/products/CategoryCardV2';
import { CategoryCardSkeleton } from '@/components/products/CategoryCardSkeleton';
import { Button } from '@/components/ui/button';
import { FeatureItem, Heading, InfoBlock, SectionHeader, Text } from '@/components/ui/typography';
import { useAsyncData } from '@/hooks/useAsyncData';
import { useContactInfo } from '@/hooks/useContactInfo';
import { getHomeCategories } from '@/lib/server-data';
import type { Category } from '@/types/api';

const FOUNDATIONS = [
  {
    icon: Feather,
    title: 'Comfort',
    description: "Because you shouldn't have to think about your outfit while you train.",
  },
  {
    icon: Smile,
    title: 'Confidence',
    description: 'Knowing you look and feel good, every rep.',
  },
  {
    icon: Move,
    title: 'Garments that move with your body',
    description: 'Not against it.',
  },
  {
    icon: Sun,
    title: 'A daily go-to',
    description: 'Not just for the gym, but for your whole day.',
  },
];

const VALUES = [
  {
    icon: Award,
    title: 'Quality first',
    description:
      'Good quality fabric is where everything starts. Every piece is made to feel great, hold its shape, and last through every squat, stretch, and step.',
  },
  {
    icon: Sparkles,
    title: 'Timeless style',
    description:
      'Clean, versatile designs that look as good at the coffee shop as they do in the gym, and never go out of season.',
  },
  {
    icon: Heart,
    title: 'Customer care',
    description:
      'Every woman who wears Caddy matters. We listen, we design around real needs, and we want you to feel looked after.',
  },
  {
    icon: Users,
    title: 'Community',
    description:
      'Caddy is built with and for women who support each other. Confidence grows when we move together.',
  },
];

const NO_CATEGORIES: Category[] = [];

export default function AboutPage() {
  const contact = useContactInfo();
  const categories = useAsyncData(getHomeCategories, NO_CATEGORIES);
  const showCategories = categories.loading || categories.data.length > 0;
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
                Caddy: move in comfort
              </Heading>
              <Text variant="lead">
                It&apos;s more than a name. It&apos;s how we want every woman to feel.
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
                alt="Inside the CaddyComfort store"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl space-y-20 px-4 py-16 sm:px-6 md:space-y-28 md:py-24 lg:px-8">
          <section className="grid grid-cols-1 gap-8 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-16">
            <SectionHeader eyebrow="The story behind Caddy" title="Solving the whole problem" />
            <div className="space-y-6">
              <Text className="text-base">
                I heard it over and over, from friends, from mums: women who felt limited by their
                gym wear before they&apos;d even started their workout.
              </Text>
              <Text className="text-base">
                That&apos;s when it clicked. It&apos;s not enough to just inspire women to get to
                the gym. If you&apos;re not giving them something that actually works for their body
                and how they move, you&apos;re only solving half the problem.
              </Text>
              <Text className="text-base">
                So instead of just chasing &ldquo;gym wear,&rdquo; I went back to what I personally
                look for every time I choose something to work out in, and I wrote it all down. That
                list became the foundation of the brand:
              </Text>
              <div className="grid gap-5 rounded-2xl border bg-muted/30 p-6 sm:grid-cols-2">
                {FOUNDATIONS.map((item) => (
                  <FeatureItem
                    key={item.title}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                  />
                ))}
              </div>
              <Text className="text-base">
                I also considered women who prefer more coverage in their gym wear: extra coverage,
                inseam length, whatever fits their own reasons for wanting it.
              </Text>
              <Text className="text-base">
                I&apos;m doing this for my fellow women. No one should have an excuse not to
                exercise because of what she has to wear. Caddy Move in Comfort is that solution.
              </Text>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-4 rounded-2xl border bg-card p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-rose">
                Our mission
              </p>
              <Text variant="lead">
                To create high-quality gym wear that works for every woman&apos;s body and how she
                moves, so she can train, travel, and live her day in comfort and confidence, with no
                excuses.
              </Text>
            </div>
            <div className="space-y-4 rounded-2xl border bg-card p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-rose">
                Our vision
              </p>
              <Text variant="lead">
                A world where every woman feels comfortable, confident, and unstoppable in what she
                wears, whether she&apos;s training, traveling, or simply going about her day.
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

          {showCategories && (
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
                {categories.loading
                  ? Array.from({ length: 4 }, (_, i) => <CategoryCardSkeleton key={i} />)
                  : categories.data
                      .slice(0, 4)
                      .map((category) => (
                        <CategoryCardV2
                          key={category.id}
                          title={category.name}
                          href={`/shop?category=${category.slug}`}
                          image={category.image || undefined}
                        />
                      ))}
              </div>
            </section>
          )}

          <section className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="relative order-last aspect-4/3 overflow-hidden rounded-3xl bg-muted lg:order-first">
              <Image
                src="/new-images/hero-2.jpg"
                alt="Products on display in the CaddyComfort store"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-6">
              <SectionHeader eyebrow="Visit us" title="Come see us in store" />
              <Text className="text-base">
                Try our gym wear on in person at our store in the heart of Kigali. Our team is ready
                to help you find the right fit, coverage and length for how you move.
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
            title="Comfort. Confidence. Caddy."
            description="Find pieces that move with you, from your workout to the rest of your day."
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

import {
  Clock,
  MapPin,
  PackageCheck,
  PackageX,
  RefreshCw,
  RotateCcw,
  Truck,
  Wallet,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from '@/components/common/Link';
import { PageHeader } from '@/components/common/PageHeader';
import { CtaBanner } from '@/components/common/CtaBanner';
import { Button } from '@/components/ui/button';
import { CheckList, StepList } from '@/components/ui/lists';
import { ContentSection, DetailList, Heading, InfoBlock, Text } from '@/components/ui/typography';
import { CONTACT } from '@/lib/contactInfo';
import { formatRwf } from '@/lib/pricing';
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING } from '@/lib/checkout';

const HIGHLIGHTS = [
  { icon: Truck, title: 'Delivery in 5–7 days', text: 'Across Rwanda' },
  {
    icon: PackageCheck,
    title: `Free over ${formatRwf(FREE_SHIPPING_THRESHOLD)}`,
    text: `Otherwise ${formatRwf(STANDARD_SHIPPING)}`,
  },
  { icon: Clock, title: '1–2 day processing', text: 'Monday to Friday' },
  { icon: RotateCcw, title: '30-day returns', text: 'Unworn items with tags' },
];

export default function ShippingPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background pt-20">
        <PageHeader
          title="Shipping & returns"
          description="How we deliver your order, what it costs, and how returns work."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Shipping & returns' }]}
          actions={
            <nav aria-label="On this page" className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <a href="#shipping">Shipping</a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="#returns">Returns</a>
              </Button>
            </nav>
          }
        />

        <div className="mx-auto max-w-5xl space-y-16 px-4 py-10 sm:px-6 md:space-y-20 md:py-14 lg:px-8">
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-2xl border bg-card p-4 sm:p-5">
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-rose/10 text-accent-rose">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{text}</p>
              </li>
            ))}
          </ul>

          <ContentSection
            title="Shipping"
            description="We currently deliver to addresses within Rwanda."
            className="scroll-mt-28"
          >
            <div id="shipping" className="scroll-mt-28 space-y-4">
              <DetailList
                items={[
                  {
                    label: 'Standard delivery',
                    value: `${formatRwf(STANDARD_SHIPPING)} · 5–7 business days`,
                  },
                  {
                    label: 'Free delivery',
                    value: `On orders over ${formatRwf(FREE_SHIPPING_THRESHOLD)}`,
                  },
                  {
                    label: 'Order processing',
                    value: '1–2 business days, Monday to Friday, excluding public holidays',
                  },
                ]}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <InfoBlock icon={MapPin} title="Where we deliver">
                  We deliver to all major cities in Rwanda, including Kigali, Huye, Musanze and
                  Rubavu. Remote areas may need extra time — contact us for details.
                </InfoBlock>
                <InfoBlock icon={PackageCheck} title="Following your order">
                  Sign in and open My orders to see each order&apos;s status, from placed to shipped
                  and delivered.
                </InfoBlock>
                <InfoBlock icon={Wallet} title="Cash on delivery" className="md:col-span-2">
                  Pay a 50% deposit online when you order, and the remaining 50% in cash when your
                  order arrives. Nothing is owed after delivery.{' '}
                  <Link
                    href="/faq#cash-on-delivery"
                    className="font-medium text-accent-rose underline-offset-4 hover:underline"
                  >
                    How it works
                  </Link>
                </InfoBlock>
              </div>
            </div>
          </ContentSection>

          <ContentSection
            title="Returns & exchanges"
            description="We want you to love what you ordered."
          >
            <div id="returns" className="scroll-mt-28 grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border bg-card p-5 sm:p-6">
                <Heading as="h3" size="xs" className="mb-1">
                  30-day return policy
                </Heading>
                <Text variant="small" className="mb-5">
                  Return items within 30 days of delivery for a refund or exchange, as long as:
                </Text>
                <CheckList
                  items={[
                    'Items are unworn, unwashed and in their original condition with all tags attached',
                    'Original packaging and receipts are included',
                    'The item was not bought as a sale or final-sale product',
                  ]}
                />
              </section>
              <section className="rounded-2xl border bg-card p-5 sm:p-6">
                <Heading as="h3" size="xs" className="mb-5">
                  How to return an item
                </Heading>
                <StepList
                  items={[
                    <>
                      Email{' '}
                      <a
                        href={CONTACT.emailHref}
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        {CONTACT.email}
                      </a>{' '}
                      with your order number
                    </>,
                    'We send you a return authorization number and instructions',
                    'Pack your items securely with all original materials',
                    'Send the package to the return address we provide',
                    'Your refund is processed within 7–10 business days after we receive it',
                  ]}
                />
              </section>
              <InfoBlock icon={RefreshCw} title="Exchanges">
                Exchanges depend on availability. For the fastest service, return the item for a
                refund and place a new order for the size or color you want.
              </InfoBlock>
              <InfoBlock icon={PackageX} title="Damaged or defective items">
                Contact us within 48 hours of delivery with photos of the damage. We will arrange a
                replacement or a full refund at no extra cost, including return shipping.
              </InfoBlock>
            </div>
          </ContentSection>

          <CtaBanner
            title="Need help with a delivery or return?"
            description="Our customer service team is happy to help with any question about shipping or returns."
            actions={
              <>
                <Button asChild size="lg" className="h-11 bg-accent-rose hover:bg-accent-rose-dark">
                  <a href={CONTACT.emailHref}>Email us</a>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-11 bg-background/80">
                  <a href={CONTACT.phoneHref}>Call {CONTACT.phone}</a>
                </Button>
                <Button asChild size="lg" variant="ghost" className="h-11">
                  <Link href="/faq">Read the FAQ</Link>
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

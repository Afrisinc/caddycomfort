import { Clock, HelpCircle, Mail, MapPin, Package, Phone, RotateCcw } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from '@/components/common/Link';
import Image from '@/components/common/Image';
import { PageHeader } from '@/components/common/PageHeader';
import { ContactMethod } from '@/components/common/ContactMethod';
import { ContactForm } from '@/components/contact/ContactForm';
import { Heading, Text } from '@/components/ui/typography';

const EMAIL = 'caddyumutoniwase@gmail.com';
const PHONE_DISPLAY = '+250 786 763 654';
const PHONE_HREF = 'tel:+250786763654';
const ADDRESS = 'KN 4 Ave, Kigali, Rwanda';
const MAPS_HREF = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`;

const QUICK_HELP = [
  { icon: HelpCircle, label: 'FAQ', description: 'Answers to common questions', href: '/faq' },
  {
    icon: RotateCcw,
    label: 'Shipping & returns',
    description: 'Delivery times and returns',
    href: '/shipping',
  },
  {
    icon: Package,
    label: 'My orders',
    description: 'Track and review your orders',
    href: '/account/orders',
  },
];

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background pt-20">
        <PageHeader
          title="Get in touch"
          description="We'd love to hear from you. Send us a message and we'll respond as soon as possible."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
        />

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8 lg:py-16">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ContactMethod icon={Mail} label="Email" value={EMAIL} href={`mailto:${EMAIL}`} />
            <ContactMethod icon={Phone} label="Call us" value={PHONE_DISPLAY} href={PHONE_HREF} />
            <ContactMethod icon={MapPin} label="Visit" value={ADDRESS} href={MAPS_HREF} external />
            <ContactMethod icon={Clock} label="Opening hours" value="Mon–Sat: 9AM–8PM" />
          </div>

          <div className="mt-12 grid grid-cols-1 gap-10 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
            <section aria-labelledby="contact-form-title">
              <Heading as="h2" size="md" id="contact-form-title">
                Send us a message
              </Heading>
              <Text variant="small" className="mt-1.5 mb-6">
                Choose a topic so we can route your message to the right person.
              </Text>
              <ContactForm />
            </section>

            <aside className="space-y-8">
              <section aria-labelledby="quick-help-title">
                <Heading as="h2" size="sm" id="quick-help-title">
                  Quick help
                </Heading>
                <ul className="mt-4 divide-y rounded-2xl border bg-card">
                  {QUICK_HELP.map(({ icon: Icon, label, description, href }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="group flex items-center gap-3 px-4 py-3.5 transition-colors outline-none first:rounded-t-2xl last:rounded-b-2xl hover:bg-muted/60 focus-visible:bg-muted/60"
                      >
                        <Icon className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-accent-rose" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">{label}</span>
                          <span className="block text-xs text-muted-foreground">{description}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="overflow-hidden rounded-2xl border bg-card">
                <div className="relative aspect-4/3">
                  <Image
                    src="/new-images/hero-2.jpg"
                    alt="Wigs, handbags and heels on display in the CaddyComfort store"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-2 p-5">
                  <Heading as="h2" size="sm">
                    Visit our store
                  </Heading>
                  <Text variant="small">
                    Experience our collection in person in the heart of Kigali. Our team is ready to
                    help with personalized styling and expert advice.
                  </Text>
                  <a
                    href={MAPS_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 pt-1 text-sm font-medium text-accent-rose underline-offset-4 hover:underline"
                  >
                    <MapPin className="h-4 w-4" />
                    Get directions
                  </a>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Phone, SearchX } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from '@/components/common/Link';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { CtaBanner } from '@/components/common/CtaBanner';
import { JsonLd } from '@/components/common/JsonLd';
import { FaqAccordion } from '@/components/faq/FaqAccordion';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/typography';
import { FAQ_CATEGORIES } from '@/lib/faqContent';
import { cn } from '@/lib/utils';
import { SearchInput } from '@/components/ui/search-input';
import { CONTACT } from '@/lib/contactInfo';

const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_CATEGORIES.flatMap((category) =>
    category.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  ),
};

export default function FaqPage() {
  const { hash } = useLocation();
  const [query, setQuery] = useState('');
  const [openIds, setOpenIds] = useState<string[]>([]);
  const term = query.trim().toLowerCase();

  useEffect(() => {
    const id = decodeURIComponent(hash.replace('#', ''));
    if (!id) return;
    const isQuestion = FAQ_CATEGORIES.some((c) => c.items.some((item) => item.id === id));
    if (isQuestion) setOpenIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }));
  }, [hash]);

  const categories = useMemo(() => {
    if (!term) return FAQ_CATEGORIES;
    return FAQ_CATEGORIES.map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        `${item.question} ${item.answer}`.toLowerCase().includes(term),
      ),
    })).filter((category) => category.items.length > 0);
  }, [term]);

  const matchCount = categories.reduce((sum, category) => sum + category.items.length, 0);
  const visibleOpenIds = term
    ? categories.flatMap((category) => category.items.map((item) => item.id))
    : openIds;

  return (
    <>
      <Navbar />
      <JsonLd data={FAQ_JSON_LD} />

      <main className="min-h-screen bg-background pt-20">
        <PageHeader
          title="Frequently asked questions"
          description="Answers to common questions about ordering, payment, delivery and returns."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'FAQ' }]}
        />

        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <SearchInput
              size="lg"
              label="Search frequently asked questions"
              placeholder="Search questions, e.g. “deposit” or “return”"
              value={query}
              onValueChange={setQuery}
            />
            {term && (
              <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
                {matchCount} {matchCount === 1 ? 'answer' : 'answers'} found
              </p>
            )}
          </div>

          <div className="grid gap-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-14">
            <nav aria-label="FAQ topics" className="lg:sticky lg:top-28 lg:self-start">
              <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
                {FAQ_CATEGORIES.map((category) => {
                  const hidden = !categories.some((c) => c.id === category.id);
                  return (
                    <li key={category.id} className="shrink-0">
                      <a
                        href={`#${category.id}`}
                        aria-disabled={hidden}
                        className={cn(
                          'flex h-9 items-center justify-between gap-3 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-accent-rose/40 lg:rounded-lg lg:border-0',
                          hidden && 'pointer-events-none opacity-40',
                        )}
                      >
                        {category.title}
                        <span className="hidden text-xs text-muted-foreground tabular-nums lg:inline">
                          {category.items.length}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="space-y-12">
              {categories.length === 0 ? (
                <EmptyState
                  icon={SearchX}
                  title={`No answers for “${query.trim()}”`}
                  description="Try another word, or ask us directly — we're happy to help."
                  action={
                    <div className="flex flex-wrap justify-center gap-3">
                      <Button variant="outline" onClick={() => setQuery('')}>
                        Clear search
                      </Button>
                      <Button asChild className="bg-accent-rose hover:bg-accent-rose-dark">
                        <Link href="/contact">Contact us</Link>
                      </Button>
                    </div>
                  }
                />
              ) : (
                categories.map((category) => (
                  <section
                    key={category.id}
                    id={category.id}
                    aria-labelledby={`${category.id}-title`}
                    className="scroll-mt-28"
                  >
                    <Heading as="h2" size="sm" id={`${category.id}-title`} className="mb-4">
                      {category.title}
                    </Heading>
                    <FaqAccordion
                      items={category.items}
                      openIds={visibleOpenIds}
                      onOpenChange={(ids) => {
                        if (term) return;
                        const others = openIds.filter(
                          (id) => !category.items.some((item) => item.id === id),
                        );
                        setOpenIds([...others, ...ids]);
                      }}
                      query={term}
                    />
                  </section>
                ))
              )}
            </div>
          </div>

          <CtaBanner
            className="mt-16 md:mt-20"
            title="Still have questions?"
            description="Can't find the answer you're looking for? Our customer service team is here to help."
            actions={
              <>
                <Button asChild size="lg" className="h-11 bg-accent-rose hover:bg-accent-rose-dark">
                  <Link href="/contact">Contact us</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-11 gap-2 bg-background/80">
                  <a href={CONTACT.phoneHref}>
                    <Phone className="h-4 w-4" />
                    {CONTACT.phone}
                  </a>
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

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Link from '@/components/common/Link';
import { HighlightMatch } from '@/components/common/HighlightMatch';
import type { FaqItem } from '@/lib/faqContent';

interface FaqAccordionProps {
  readonly items: FaqItem[];
  readonly openIds: string[];
  readonly onOpenChange: (ids: string[]) => void;
  readonly query?: string;
}

export function FaqAccordion({ items, openIds, onOpenChange, query = '' }: FaqAccordionProps) {
  return (
    <AccordionPrimitive.Root
      type="multiple"
      value={openIds}
      onValueChange={onOpenChange}
      className="divide-y rounded-2xl border bg-card"
    >
      {items.map((item) => (
        <AccordionPrimitive.Item
          key={item.id}
          value={item.id}
          id={item.id}
          className="scroll-mt-28"
        >
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-medium transition-colors outline-none hover:text-accent-rose focus-visible:bg-muted/60 data-[state=open]:text-accent-rose sm:px-6">
              <span>
                <HighlightMatch text={item.question} query={query} />
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-data-[state=open]:bg-accent-rose/10 group-data-[state=open]:text-accent-rose">
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </span>
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
            <div className="space-y-3 px-5 pb-5 text-[15px] leading-7 text-muted-foreground sm:px-6">
              <p className="max-w-prose">
                <HighlightMatch text={item.answer} query={query} />
              </p>
              {item.link && (
                <Link
                  href={item.link.href}
                  className="group/link inline-flex items-center gap-1.5 text-sm font-medium text-accent-rose underline-offset-4 hover:underline"
                >
                  {item.link.label}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
                </Link>
              )}
            </div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}

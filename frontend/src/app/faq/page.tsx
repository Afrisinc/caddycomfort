import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    {
      category: 'Orders & Payments',
      questions: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept credit/debit cards (Visa, Mastercard), Mobile Money (MTN, Airtel), and Cash on Delivery for orders within Rwanda.',
        },
        {
          question: 'Can I modify or cancel my order?',
          answer: 'You can modify or cancel your order within 2 hours of placing it by contacting our customer service. After this time, your order will be processed and cannot be changed.',
        },
        {
          question: 'Do you offer gift wrapping?',
          answer: 'Yes! We offer complimentary luxury gift wrapping for all orders. Simply select the gift wrap option at checkout and include a personalized message.',
        },
        {
          question: 'Can I use multiple discount codes?',
          answer: 'Only one discount code can be applied per order. If you have multiple codes, we recommend using the one that provides the greatest discount.',
        },
      ],
    },
    {
      category: 'Shipping & Delivery',
      questions: [
        {
          question: 'How long does delivery take?',
          answer: 'Standard delivery takes 5-7 business days within Rwanda. Express delivery (2-3 business days) is also available. International orders typically arrive within 10-20 business days.',
        },
        {
          question: 'Do you ship internationally?',
          answer: 'Yes, we ship to select countries worldwide. International shipping rates and delivery times vary by destination and are calculated at checkout.',
        },
        {
          question: 'How can I track my order?',
          answer: 'Once your order ships, you&apos;ll receive a confirmation email with a tracking number. You can also track your order by logging into your account and viewing your order history.',
        },
        {
          question: 'What if I&apos;m not home during delivery?',
          answer: 'Our delivery partners will attempt delivery twice. If unsuccessful, you&apos;ll receive a notification to arrange pickup at a nearby location or schedule a new delivery time.',
        },
      ],
    },
    {
      category: 'Returns & Exchanges',
      questions: [
        {
          question: 'What is your return policy?',
          answer: 'We accept returns within 30 days of delivery. Items must be unworn, unwashed, in original condition with all tags attached. Visit our Shipping & Returns page for complete details.',
        },
        {
          question: 'How do I initiate a return?',
          answer: 'Contact our customer service at support@clementineshop.rw with your order number. We&apos;ll provide a return authorization number and shipping instructions.',
        },
        {
          question: 'When will I receive my refund?',
          answer: 'Refunds are processed within 7-10 business days after we receive and inspect your return. The refund will be credited to your original payment method.',
        },
        {
          question: 'Can I exchange an item for a different size or color?',
          answer: 'Yes! Exchanges are subject to availability. For fastest service, we recommend returning your item for a refund and placing a new order.',
        },
      ],
    },
    {
      category: 'Products & Sizing',
      questions: [
        {
          question: 'How do I find my size?',
          answer: 'Each product page includes detailed size charts. We recommend measuring yourself and comparing to our charts for the best fit. If you&apos;re between sizes, we suggest sizing up.',
        },
        {
          question: 'Are your products authentic?',
          answer: 'Absolutely! We only sell 100% authentic luxury fashion items. All products are sourced directly from authorized distributors and come with authenticity guarantees.',
        },
        {
          question: 'How do I care for my luxury items?',
          answer: 'Care instructions are included with each item and on the product page. Most luxury pieces require dry cleaning or gentle hand washing. We recommend storing items in dust bags when not in use.',
        },
        {
          question: 'Do you restock sold-out items?',
          answer: 'Some items are restocked regularly, while others are limited edition. Sign up for restock notifications on the product page or contact us to inquire about specific items.',
        },
      ],
    },
    {
      category: 'Account & Membership',
      questions: [
        {
          question: 'Do I need an account to place an order?',
          answer: 'No, you can checkout as a guest. However, creating an account allows you to track orders, save favorites, and enjoy faster checkout.',
        },
        {
          question: 'How do I reset my password?',
          answer: 'Click "Forgot Password" on the login page and enter your email. You&apos;ll receive instructions to reset your password.',
        },
        {
          question: 'Is there a loyalty program?',
          answer: 'Yes! Our VIP program offers exclusive benefits including early access to sales, special discounts, and priority customer service. You&apos;re automatically enrolled with your first purchase.',
        },
        {
          question: 'How do I update my account information?',
          answer: 'Log into your account and visit the Profile Settings page to update your personal information, shipping addresses, and preferences.',
        },
      ],
    },
  ];

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-background pt-20">
        <div className="bg-gradient-to-br from-accent-rose-subtle via-background to-accent-rose-muted/30 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-accent-rose-subtle flex items-center justify-center">
                <HelpCircle className="h-8 w-8 text-accent-rose" />
              </div>
            </div>
            <h1 className="text-5xl font-serif mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about shopping with CaddyComfort
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {faqs.map((category, index) => (
            <div key={index} className="mb-12 last:mb-0">
              <h2 className="text-2xl font-serif mb-6 text-accent-rose">{category.category}</h2>
              <Accordion type="single" collapsible className="space-y-4">
                {category.questions.map((faq, faqIndex) => (
                  <AccordionItem
                    key={faqIndex}
                    value={`${index}-${faqIndex}`}
                    className="bg-card border rounded-lg px-6"
                  >
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-semibold">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          {/* Still Have Questions */}
          <div className="mt-16 bg-accent-rose-subtle/20 border border-accent-rose-subtle rounded-lg p-8 text-center">
            <h3 className="text-2xl font-serif mb-3">Still Have Questions?</h3>
            <p className="text-muted-foreground mb-6">
              Can&apos;t find the answer you&apos;re looking for? Our customer service team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/contact"
                className="inline-block px-6 py-3 bg-accent-rose hover:bg-accent-rose-dark text-white rounded-lg font-semibold transition-colors"
              >
                Contact Us
              </a>
              <span className="text-muted-foreground">or call</span>
              <a href="tel:+250788888888" className="text-accent-rose hover:underline font-semibold">
                +250 788 888 888
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

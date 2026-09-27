import { cashOnDeliveryText, type StoreSettings } from '@/lib/storeSettings';

export interface FaqLink {
  label: string;
  href: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  link?: FaqLink;
}

export interface FaqCategory {
  id: string;
  title: string;
  items: FaqItem[];
}

export function getFaqCategories(settings: StoreSettings): FaqCategory[] {
  return [
    {
      id: 'orders-payments',
      title: 'Orders & payments',
      items: [
        {
          id: 'payment-methods',
          question: 'What payment methods do you accept?',
          answer:
            'You can pay by credit or debit card, by Mobile Money (MTN or Airtel), or choose cash on delivery.',
        },
        {
          id: 'cash-on-delivery',
          question: 'How does cash on delivery work?',
          answer: cashOnDeliveryText(settings),
        },
        {
          id: 'cancel-order',
          question: 'Can I cancel my order?',
          answer:
            'Yes. While your order is pending or processing, you can cancel it from the order page in your account. Once it has shipped it can no longer be cancelled — please contact us instead.',
          link: { label: 'Go to my orders', href: '/account/orders' },
        },
        {
          id: 'retry-payment',
          question: 'My payment did not go through. What should I do?',
          answer:
            'Your order is saved even if the payment fails. Open the order in your account and use the Pay button to try again.',
          link: { label: 'Go to my orders', href: '/account/orders' },
        },
        {
          id: 'discount-codes',
          question: 'Can I use multiple discount codes?',
          answer:
            'Only one discount code can be applied per order. If you have more than one, use the code that gives you the biggest discount.',
        },
      ],
    },
    {
      id: 'shipping-delivery',
      title: 'Shipping & delivery',
      items: [
        {
          id: 'delivery-area',
          question: 'Where do you deliver?',
          answer: 'We currently deliver to addresses within Rwanda.',
        },
        {
          id: 'delivery-time',
          question: 'How long does delivery take?',
          answer:
            'Orders are typically processed within 1-2 business days and delivered within 5-7 business days.',
          link: { label: 'Shipping & returns', href: '/shipping' },
        },
        {
          id: 'track-order',
          question: 'How can I track my order?',
          answer:
            'Sign in and open My orders to see the current status of each order, from pending to shipped and delivered.',
          link: { label: 'Go to my orders', href: '/account/orders' },
        },
      ],
    },
    {
      id: 'returns-exchanges',
      title: 'Returns & exchanges',
      items: [
        {
          id: 'return-policy',
          question: 'What is your return policy?',
          answer:
            'We accept returns within 30 days of delivery. Items must be unworn, unwashed, and in their original condition with all tags attached. Sale and final-sale items cannot be returned.',
          link: { label: 'Shipping & returns', href: '/shipping' },
        },
        {
          id: 'start-return',
          question: 'How do I start a return?',
          answer:
            'Contact our customer service team at caddyumutoniwase@gmail.com with your order number and we will guide you through the return.',
          link: { label: 'Contact us', href: '/contact' },
        },
        {
          id: 'refund-time',
          question: 'When will I receive my refund?',
          answer:
            'Refunds are processed within 7-10 business days after we receive and inspect your return, and are credited to your original payment method.',
        },
        {
          id: 'exchange',
          question: 'Can I exchange an item for a different size or color?',
          answer:
            'Exchanges depend on availability. For the fastest service, return the item for a refund and place a new order for the size or color you want.',
        },
      ],
    },
    {
      id: 'products-sizing',
      title: 'Products & sizing',
      items: [
        {
          id: 'find-size',
          question: 'How do I choose my size?',
          answer:
            'The available sizes are listed on each product page. If you are unsure which size to choose, contact us before ordering and we will help.',
          link: { label: 'Contact us', href: '/contact' },
        },
        {
          id: 'care',
          question: 'How do I care for my items?',
          answer:
            'Follow the care label on each item. Delicate pieces are best dry-cleaned or hand-washed and stored away from direct sunlight.',
        },
        {
          id: 'sold-out',
          question: 'Will sold-out items come back?',
          answer:
            'Some items are restocked while others are limited. Contact us to ask about a specific item.',
          link: { label: 'Contact us', href: '/contact' },
        },
      ],
    },
    {
      id: 'account',
      title: 'Your account',
      items: [
        {
          id: 'need-account',
          question: 'Do I need an account to place an order?',
          answer:
            'Yes. An account lets you check out, track your orders, pay for an order later, and save items to your wishlist. Your cart is kept while you sign in.',
          link: { label: 'Sign in or create an account', href: '/login' },
        },
        {
          id: 'reset-password',
          question: 'How do I reset my password?',
          answer:
            'Select "Forgot password" on the sign-in page and enter your email address. We will send you instructions to reset it.',
          link: { label: 'Reset password', href: '/forgot-password' },
        },
        {
          id: 'update-details',
          question: 'How do I update my details or addresses?',
          answer:
            'Sign in and go to your account to update your profile and manage your saved delivery addresses.',
          link: { label: 'Go to my account', href: '/account' },
        },
      ],
    },
  ];
}

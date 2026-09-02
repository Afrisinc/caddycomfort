import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Package, Truck, Clock, MapPin, RotateCcw, AlertCircle } from 'lucide-react';

export default function ShippingPage() {
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-background pt-20">
        <div className="bg-gradient-to-br from-accent-rose-subtle via-background to-accent-rose-muted/30 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-5xl font-serif text-center mb-4">Shipping & Returns</h1>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto">
              Learn about our shipping policies and hassle-free return process
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Shipping Information */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-accent-rose-subtle flex items-center justify-center">
                <Truck className="h-6 w-6 text-accent-rose" />
              </div>
              <h2 className="text-3xl font-serif">Shipping Information</h2>
            </div>

            <div className="space-y-6">
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Domestic Shipping</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    <strong className="text-foreground">
                      Standard Delivery (5-7 business days):
                    </strong>{' '}
                    Rwf 5,000
                  </p>
                  <p>
                    <strong className="text-foreground">
                      Express Delivery (2-3 business days):
                    </strong>{' '}
                    Rwf 10,000
                  </p>
                  <p className="flex items-start gap-2">
                    <Package className="h-5 w-5 text-accent-rose shrink-0 mt-0.5" />
                    <span>Free standard shipping on all orders over Rwf 100,000</span>
                  </p>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">International Shipping</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    We ship to select countries worldwide. International shipping rates vary by
                    destination and are calculated at checkout.
                  </p>
                  <p>
                    <strong className="text-foreground">Delivery time:</strong> 10-20 business days
                    depending on location
                  </p>
                  <p className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-accent-rose shrink-0 mt-0.5" />
                    <span>
                      Additional customs duties and taxes may apply based on your country&apos;s
                      regulations.
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Order Processing</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-accent-rose shrink-0 mt-0.5" />
                    <span>
                      Orders are processed within 1-2 business days (Monday-Friday, excluding public
                      holidays).
                    </span>
                  </p>
                  <p>
                    You will receive a confirmation email with tracking information once your order
                    has been shipped.
                  </p>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Delivery Locations</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-accent-rose shrink-0 mt-0.5" />
                    <span>
                      We deliver to all major cities in Rwanda: Kigali, Huye, Musanze, Rubavu, and
                      more.
                    </span>
                  </p>
                  <p>
                    For remote areas, additional delivery time may be required. Please contact our
                    customer service for more information.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Returns & Exchanges */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-accent-rose-subtle flex items-center justify-center">
                <RotateCcw className="h-6 w-6 text-accent-rose" />
              </div>
              <h2 className="text-3xl font-serif">Returns & Exchanges</h2>
            </div>

            <div className="space-y-6">
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">30-Day Return Policy</h3>
                <p className="text-muted-foreground mb-4">
                  We want you to be completely satisfied with your purchase. If you&apos;re not
                  happy with your order, you can return it within 30 days of delivery for a full
                  refund or exchange.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-accent-rose">•</span>
                    <span>
                      Items must be unworn, unwashed, and in original condition with all tags
                      attached
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-rose">•</span>
                    <span>Original packaging and receipts must be included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-rose">•</span>
                    <span>Sale items and final sale products cannot be returned</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-rose">•</span>
                    <span>Gift cards are non-refundable</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">How to Return</h3>
                <ol className="space-y-3 text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="font-semibold text-accent-rose shrink-0">1.</span>
                    <span>
                      Contact our customer service team at caddyumutoniwase@gmail.com to initiate a
                      return
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-accent-rose shrink-0">2.</span>
                    <span>
                      You will receive a return authorization number and shipping instructions
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-accent-rose shrink-0">3.</span>
                    <span>Pack your items securely with all original materials</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-accent-rose shrink-0">4.</span>
                    <span>Ship the package to the provided return address</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-accent-rose shrink-0">5.</span>
                    <span>
                      Refunds will be processed within 7-10 business days after we receive your
                      return
                    </span>
                  </li>
                </ol>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Exchanges</h3>
                <p className="text-muted-foreground mb-3">
                  If you need a different size or color, we&apos;re happy to help! Exchanges are
                  subject to product availability.
                </p>
                <p className="text-muted-foreground">
                  For the fastest service, we recommend returning your original item for a refund
                  and placing a new order for the item you want.
                </p>
              </div>

              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Damaged or Defective Items</h3>
                <p className="text-muted-foreground mb-3">
                  If you receive a damaged or defective item, please contact us within 48 hours of
                  delivery with photos of the damage.
                </p>
                <p className="text-muted-foreground">
                  We will arrange for a replacement or full refund at no additional cost to you,
                  including return shipping.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-16 bg-accent-rose-subtle/20 border border-accent-rose-subtle rounded-lg p-8 text-center">
            <h3 className="text-2xl font-serif mb-3">Need Help?</h3>
            <p className="text-muted-foreground mb-6">
              Our customer service team is here to assist you with any questions about shipping or
              returns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:caddyumutoniwase@gmail.com"
                className="text-accent-rose hover:underline font-semibold"
              >
                caddyumutoniwase@gmail.com
              </a>
              <span className="hidden sm:inline text-muted-foreground">|</span>
              <a
                href="tel:+250786763654"
                className="text-accent-rose hover:underline font-semibold"
              >
                +250 786 763 654
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

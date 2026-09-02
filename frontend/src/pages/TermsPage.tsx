import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-background pt-20">
        <div className="bg-gradient-to-br from-accent-rose-subtle via-background to-accent-rose-muted/30 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-accent-rose-subtle flex items-center justify-center">
                <FileText className="h-8 w-8 text-accent-rose" />
              </div>
            </div>
            <h1 className="text-5xl font-serif mb-4">Terms & Conditions</h1>
            <p className="text-muted-foreground">Last updated: December 6, 2025</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 prose prose-lg max-w-none">
          <div className="space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">Agreement to Terms</h2>
              <p>
                By accessing and using CaddyComfort (&quot;the Website&quot;), you accept and agree
                to be bound by these Terms and Conditions. If you do not agree to these terms,
                please do not use our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">Use of Website</h2>
              <p className="mb-3">
                You agree to use our website only for lawful purposes and in a way that does not
                infringe the rights of others. You must not:
              </p>
              <ul className="space-y-2 ml-6">
                <li>Use the website in any way that breaches applicable laws or regulations</li>
                <li>Transmit any material that is defamatory, offensive, or obscene</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the proper functioning of the website</li>
                <li>Reproduce, duplicate, copy, or resell any part of our website</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">Product Information</h2>
              <p>
                We make every effort to display our products as accurately as possible. However, we
                cannot guarantee that colors and images perfectly match the actual products. All
                product descriptions, prices, and availability are subject to change without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">Pricing and Payment</h2>
              <p className="mb-3">
                All prices are displayed in Rwandan Francs (Rwf) and include applicable taxes unless
                otherwise stated. We accept the following payment methods:
              </p>
              <ul className="space-y-2 ml-6">
                <li>Credit/Debit Cards (Visa, Mastercard)</li>
                <li>Mobile Money (MTN, Airtel)</li>
                <li>Cash on Delivery (within Rwanda)</li>
              </ul>
              <p className="mt-3">
                Payment must be received before we process your order. We reserve the right to
                refuse or cancel any order for any reason.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">Order Acceptance</h2>
              <p>
                Your order is an offer to purchase products from us. We may accept or reject your
                order for any reason. We will send you an order confirmation email, but this does
                not mean your order has been accepted. Acceptance occurs when we dispatch the
                products to you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">Shipping and Delivery</h2>
              <p>
                Delivery times are estimates and not guaranteed. We are not liable for delays caused
                by circumstances beyond our control. Risk of loss and title for products pass to you
                upon delivery. Please review our Shipping & Returns page for detailed information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">Returns and Refunds</h2>
              <p>
                We accept returns within 30 days of delivery for eligible items. Items must be in
                original condition with all tags attached. Sale items and final sale products cannot
                be returned. Please see our Returns Policy for complete details.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">Intellectual Property</h2>
              <p>
                All content on this website, including text, graphics, logos, images, and software,
                is the property of CaddyComfort or its licensors and is protected by copyright and
                trademark laws. You may not use, reproduce, or distribute any content without our
                written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">User Accounts</h2>
              <p className="mb-3">When you create an account, you agree to:</p>
              <ul className="space-y-2 ml-6">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your password</li>
                <li>Notify us immediately of any unauthorized use</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, CaddyComfort shall not be liable for any
                indirect, incidental, special, or consequential damages arising from your use of our
                website or products. Our total liability shall not exceed the amount you paid for
                the product in question.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">Disclaimer of Warranties</h2>
              <p>
                Our website and products are provided &quot;as is&quot; without warranties of any
                kind. We do not warrant that the website will be uninterrupted, error-free, or free
                of viruses or other harmful components.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless CaddyComfort from any claims, losses,
                damages, or expenses (including legal fees) arising from your use of the website or
                violation of these terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">Governing Law</h2>
              <p>
                These terms are governed by the laws of Rwanda. Any disputes shall be subject to the
                exclusive jurisdiction of the courts of Rwanda.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Changes will be effective
                immediately upon posting. Your continued use of the website after changes
                constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">Contact Information</h2>
              <p className="mb-3">
                If you have any questions about these Terms & Conditions, please contact us:
              </p>
              <div className="bg-card border rounded-lg p-6">
                <p className="mb-2">
                  <strong className="text-foreground">Email:</strong> caddyumutoniwase@gmail.com
                </p>
                <p className="mb-2">
                  <strong className="text-foreground">Phone:</strong> +250 786 763 654
                </p>
                <p>
                  <strong className="text-foreground">Address:</strong> KN 4 Ave, Kigali, Rwanda
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

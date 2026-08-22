import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-background pt-20">
        <div className="bg-gradient-to-br from-accent-rose-subtle via-background to-accent-rose-muted/30 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-accent-rose-subtle flex items-center justify-center">
                <Shield className="h-8 w-8 text-accent-rose" />
              </div>
            </div>
            <h1 className="text-5xl font-serif mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: December 6, 2025</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 prose prose-lg max-w-none">
          <div className="space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">Introduction</h2>
              <p>
                Welcome to CaddyComfort. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">Information We Collect</h2>
              <p className="mb-3">We may collect, use, store and transfer different kinds of personal data about you:</p>
              <ul className="space-y-2 ml-6">
                <li><strong className="text-foreground">Identity Data:</strong> first name, last name, username</li>
                <li><strong className="text-foreground">Contact Data:</strong> email address, telephone numbers, billing and delivery addresses</li>
                <li><strong className="text-foreground">Financial Data:</strong> payment card details</li>
                <li><strong className="text-foreground">Transaction Data:</strong> details about payments and orders</li>
                <li><strong className="text-foreground">Technical Data:</strong> IP address, browser type, device information</li>
                <li><strong className="text-foreground">Usage Data:</strong> how you use our website and products</li>
                <li><strong className="text-foreground">Marketing Data:</strong> your preferences in receiving marketing from us</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">How We Use Your Information</h2>
              <p className="mb-3">We use your personal data for the following purposes:</p>
              <ul className="space-y-2 ml-6">
                <li>To process and deliver your orders</li>
                <li>To manage payments and prevent fraud</li>
                <li>To communicate with you about your orders and account</li>
                <li>To provide customer support</li>
                <li>To send you marketing communications (with your consent)</li>
                <li>To improve our website and services</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">Data Security</h2>
              <p>
                We have implemented appropriate security measures to prevent your personal data from being accidentally lost, used, accessed, altered or disclosed. We limit access to your personal data to employees and partners who have a business need to know. All payment transactions are encrypted using SSL technology.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">Sharing Your Information</h2>
              <p className="mb-3">We may share your personal data with:</p>
              <ul className="space-y-2 ml-6">
                <li><strong className="text-foreground">Service Providers:</strong> Payment processors, delivery services, marketing platforms</li>
                <li><strong className="text-foreground">Business Partners:</strong> For joint marketing or product offerings</li>
                <li><strong className="text-foreground">Legal Requirements:</strong> When required by law or to protect our rights</li>
              </ul>
              <p className="mt-3">
                We require all third parties to respect the security of your personal data and treat it in accordance with the law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">Your Rights</h2>
              <p className="mb-3">Under data protection laws, you have rights including:</p>
              <ul className="space-y-2 ml-6">
                <li><strong className="text-foreground">Right to Access:</strong> Request copies of your personal data</li>
                <li><strong className="text-foreground">Right to Rectification:</strong> Request correction of inaccurate data</li>
                <li><strong className="text-foreground">Right to Erasure:</strong> Request deletion of your personal data</li>
                <li><strong className="text-foreground">Right to Restrict Processing:</strong> Request restriction of processing your data</li>
                <li><strong className="text-foreground">Right to Data Portability:</strong> Request transfer of your data</li>
                <li><strong className="text-foreground">Right to Object:</strong> Object to processing of your personal data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">Cookies</h2>
              <p>
                Our website uses cookies to distinguish you from other users. This helps us provide you with a good experience and allows us to improve our site. Cookies are small files stored on your device that help us analyze web traffic and remember your preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">Data Retention</h2>
              <p>
                We will only retain your personal data for as long as necessary to fulfill the purposes for which we collected it, including legal, accounting, or reporting requirements. When we no longer need your data, we will securely delete or anonymize it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">Children&apos;s Privacy</h2>
              <p>
                Our website is not intended for children under 16 years of age. We do not knowingly collect data from children. If you believe we have collected data from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif text-foreground mb-4">Contact Us</h2>
              <p className="mb-3">
                If you have any questions about this privacy policy or our privacy practices, please contact us:
              </p>
              <div className="bg-card border rounded-lg p-6">
                <p className="mb-2"><strong className="text-foreground">Email:</strong> privacy@clementineshop.rw</p>
                <p className="mb-2"><strong className="text-foreground">Phone:</strong> +250 788 888 888</p>
                <p><strong className="text-foreground">Address:</strong> KN 4 Ave, Kigali, Rwanda</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

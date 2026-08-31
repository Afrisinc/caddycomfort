import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Send, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { newsletterApi } from '@/lib/api';
import { toast } from 'sonner';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await newsletterApi.subscribe(email);
      toast.success("You're subscribed to our newsletter!");
      setEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to subscribe');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-accent-rose-subtle via-background to-accent-rose-subtle/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12 space-y-4">
          <span className="inline-block text-sm font-medium text-accent-rose uppercase tracking-wider">
            GET NEWSLETTER
          </span>
          <h2 className="text-3xl md:text-4xl font-serif">Sign Up to Newsletter</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay updated with our latest collections, exclusive offers, and fashion insights
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Send className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Enter Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-14 text-base bg-card border-2 border-border focus:border-accent-rose rounded-lg"
                required
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-14 px-8 bg-accent-rose hover:bg-accent-rose-dark text-white whitespace-nowrap"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Subscribe Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

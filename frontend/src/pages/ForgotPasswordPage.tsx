import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import Link from '@/components/common/Link';
import { ArrowLeft, Mail, MailCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuthStore();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (error: any) {
      const message = error.message || 'Something went wrong. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Sign In
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif mb-2">Forgot Password</h1>
            <p className="text-muted-foreground">
              {isSubmitted
                ? 'Check your inbox for the reset link'
                : "Enter your email and we'll send you a reset link"}
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6">
            {isSubmitted ? (
              <div className="text-center space-y-4 py-4">
                <MailCheck className="h-12 w-12 text-accent-rose mx-auto" />
                <p className="text-sm text-muted-foreground">
                  If an account exists for{' '}
                  <span className="font-medium text-foreground">{email}</span>, a password reset
                  link is on its way. The link expires in 1 hour.
                </p>
                <Button variant="outline" className="w-full" onClick={() => setIsSubmitted(false)}>
                  Use a different email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-accent-rose hover:bg-accent-rose-dark"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

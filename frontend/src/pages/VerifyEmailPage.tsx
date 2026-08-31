import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from '@/router/compat';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import Link from '@/components/common/Link';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';

const RESEND_COOLDOWN_SECONDS = 60;

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, verifyEmail, resendVerification } = useAuthStore();

  const [email, setEmail] = useState(searchParams.get('email') || user?.email || '');
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      await verifyEmail(email, code);
      toast.success('Email verified successfully!');

      if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    } catch (error: any) {
      const message = error.message || 'Invalid or expired verification code';
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Enter your email first');
      return;
    }

    setIsResending(true);

    try {
      await resendVerification(email);
      toast.success('Verification code sent');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error: any) {
      const message = error.message || 'Failed to resend verification code';
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/login"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Sign In
      </Link>

      <div className="text-center mb-8">
        <ShieldCheck className="h-12 w-12 text-accent-rose mx-auto mb-4" />
        <h1 className="text-4xl font-serif mb-2">Verify Your Email</h1>
        <p className="text-muted-foreground">
          Enter the 6-digit code we sent to your email address
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <form onSubmit={handleVerify} className="space-y-4">
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

          <div>
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              className="text-center text-lg tracking-[0.5em]"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-accent-rose hover:bg-accent-rose-dark"
            disabled={isVerifying}
          >
            {isVerifying ? 'Verifying...' : 'Verify Email'}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Didn&apos;t get a code?{' '}
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-accent-rose"
              disabled={isResending || cooldown > 0}
              onClick={handleResend}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : isResending ? 'Sending...' : 'Resend code'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        <Suspense
          fallback={<div className="min-h-[50vh] flex items-center justify-center">Loading...</div>}
        >
          <VerifyEmailForm />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}

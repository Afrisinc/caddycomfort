import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import Link from '@/components/common/Link';
import { Home, Search, ShoppingBag } from 'lucide-react';

export default function NotFound() {
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-serif text-accent-rose mb-4">404</h1>
            <h2 className="text-3xl font-serif mb-4">Page Not Found</h2>
            <p className="text-muted-foreground mb-8">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button
                size="lg"
                className="bg-accent-rose hover:bg-accent-rose-dark w-full sm:w-auto"
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </Link>
            <Link href="/shop">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Browse Shop
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

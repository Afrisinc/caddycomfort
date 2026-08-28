'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, User, Heart, Menu, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { SearchDialog } from '@/components/SearchDialog';
import { wishlistApi } from '@/lib/api';

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [wishlistCount, setWishlistCount] = React.useState(0);
  const items = useCartStore((state) => state.items);
  const { isAuthenticated, user } = useAuthStore();
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  React.useEffect(() => {
    if (!isAuthenticated) {
      setWishlistCount(0);
      return;
    }
    wishlistApi.getCount().then(setWishlistCount).catch(() => {});
  }, [isAuthenticated]);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-luxury ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 relative h-12 w-48 md:h-14 md:w-56 hover:opacity-80 transition-opacity">
            <Image
              src="/images/logo/logo.png"
              alt="CaddyComfort"
              fill
              className="object-contain object-left"
              priority
              sizes="(max-width: 768px) 192px, 224px"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 absolute left-1/2 -translate-x-1/2">
            <Link
              href="/"
              className="text-sm font-medium hover:text-accent-rose transition-luxury"
            >
              HOME
            </Link>
            <Link
              href="/shop"
              className="text-sm font-medium hover:text-accent-rose transition-luxury"
            >
              SHOP
            </Link>
            <Link
              href="/shop?category=womans-cloth"
              className="text-sm font-medium hover:text-accent-rose transition-luxury"
            >
              WOMEN
            </Link>
            <Link
              href="/shop?category=men"
              className="text-sm font-medium hover:text-accent-rose transition-luxury"
            >
              MEN
            </Link>
            <Link
              href="/shop?category=kids"
              className="text-sm font-medium hover:text-accent-rose transition-luxury"
            >
              KIDS
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium hover:text-accent-rose transition-luxury"
            >
              CONTACT US
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium hover:text-accent-rose transition-luxury"
            >
              ABOUT
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm font-medium hover:text-accent-rose transition-luxury"
              >
                ADMIN
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4 ml-auto">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Link href={isAuthenticated ? (isAdmin ? '/admin' : '/account') : '/login'}>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/account/wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent-rose text-white text-xs flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent-rose text-white text-xs flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] sm:w-[380px]">
                <SheetHeader className="border-b border-border/50 pb-6">
                  <SheetTitle className="text-left">
                    <Link href="/" className="inline-block relative h-12 w-48 hover:opacity-80 transition-opacity">
                      <Image
                        src="/images/logo/logo.png"
                        alt="CaddyComfort"
                        fill
                        className="object-contain object-left"
                        sizes="192px"
                      />
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                {/* Search Button */}
                <div className="py-6">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      setSearchOpen(true);
                    }}
                  >
                    <Search className="h-4 w-4" />
                    <span>Search products...</span>
                  </Button>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col space-y-1">
                  <Link
                    href="/shop"
                    className="group flex items-center justify-between px-4 py-3 rounded-lg hover:bg-accent-rose-subtle/30 transition-all"
                  >
                    <span className="text-base font-medium">Shop</span>
                    <span className="text-accent-rose opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </Link>
                  <Link
                    href="/shop?category=womans-cloth"
                    className="group flex items-center justify-between px-4 py-3 rounded-lg hover:bg-accent-rose-subtle/30 transition-all"
                  >
                    <span className="text-base font-medium">Women</span>
                    <span className="text-accent-rose opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </Link>
                  <Link
                    href="/shop?category=men"
                    className="group flex items-center justify-between px-4 py-3 rounded-lg hover:bg-accent-rose-subtle/30 transition-all"
                  >
                    <span className="text-base font-medium">Men</span>
                    <span className="text-accent-rose opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </Link>
                  <Link
                    href="/shop?category=kids"
                    className="group flex items-center justify-between px-4 py-3 rounded-lg hover:bg-accent-rose-subtle/30 transition-all"
                  >
                    <span className="text-base font-medium">Kids</span>
                    <span className="text-accent-rose opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </Link>
                  <Link
                    href="/contact"
                    className="group flex items-center justify-between px-4 py-3 rounded-lg hover:bg-accent-rose-subtle/30 transition-all"
                  >
                    <span className="text-base font-medium">Contact Us</span>
                    <span className="text-accent-rose opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </Link>
                  <Link
                    href="/about"
                    className="group flex items-center justify-between px-4 py-3 rounded-lg hover:bg-accent-rose-subtle/30 transition-all"
                  >
                    <span className="text-base font-medium">About</span>
                    <span className="text-accent-rose opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="group flex items-center justify-between px-4 py-3 rounded-lg hover:bg-accent-rose-subtle/30 transition-all"
                    >
                      <span className="text-base font-medium">Admin Dashboard</span>
                      <span className="text-accent-rose opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    </Link>
                  )}
                </nav>

                {/* Divider */}
                <div className="my-6 border-t border-border/50"></div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <Link
                    href={isAdmin ? '/admin' : '/account'}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent-rose-subtle/20 transition-all"
                  >
                    <div className="h-10 w-10 rounded-full bg-accent-rose-subtle/40 flex items-center justify-center">
                      <User className="h-5 w-5 text-accent-rose" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{isAdmin ? 'Admin Dashboard' : 'My Account'}</p>
                      <p className="text-xs text-muted-foreground">{isAdmin ? 'Manage Store' : 'Profile & Orders'}</p>
                    </div>
                  </Link>
                  <Link
                    href="/account/wishlist"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent-rose-subtle/20 transition-all"
                  >
                    <div className="h-10 w-10 rounded-full bg-accent-rose-subtle/40 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-accent-rose" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Wishlist</p>
                      <p className="text-xs text-muted-foreground">
                        {wishlistCount} item{wishlistCount === 1 ? '' : 's'} saved
                      </p>
                    </div>
                  </Link>
                </div>

                {/* Bottom CTA */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
                  <Link href="/cart">
                    <Button className="w-full bg-accent-rose hover:bg-accent-rose-dark text-white shadow-lg">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      View Cart ({cartItemCount})
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </nav>
  );
}

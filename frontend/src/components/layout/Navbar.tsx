import { useEffect, useState } from 'react';
import { Heart, Menu, Search, ShoppingBag, User, type LucideIcon } from 'lucide-react';
import Link from '@/components/common/Link';
import Image from '@/components/common/Image';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SearchDialog } from '@/components/SearchDialog';
import { HeaderAction } from '@/components/layout/HeaderAction';
import { NavLinks } from '@/components/layout/NavLinks';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { ADMIN_LINK, NAV_LINKS } from '@/lib/navigation';
import { cn } from '@/lib/utils';

function SiteLogo({ onClick, priority }: Readonly<{ onClick?: () => void; priority?: boolean }>) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="CaddyComfort home"
      className="relative block h-12 w-40 shrink-0 rounded-md outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-accent-rose/40 md:h-14 md:w-48"
    >
      <Image
        src="/images/logo/logo.png"
        alt=""
        fill
        priority={priority}
        sizes="192px"
        className="object-contain object-left"
      />
    </Link>
  );
}

interface DrawerShortcut {
  icon: LucideIcon;
  label: string;
  description: string;
  href: string;
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );
  const { isAuthenticated, user } = useAuthStore();
  const wishlistCount = useWishlistStore((state) => state.ids.size);
  const loadWishlist = useWishlistStore((state) => state.load);
  const resetWishlist = useWishlistStore((state) => state.reset);
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const links = isAdmin ? [...NAV_LINKS, ADMIN_LINK] : NAV_LINKS;
  const accountHref = isAuthenticated ? '/account' : '/login';

  useEffect(() => {
    if (isAuthenticated) loadWishlist();
    else resetWishlist();
  }, [isAuthenticated, loadWishlist, resetWishlist]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const shortcuts: DrawerShortcut[] = [
    {
      icon: User,
      label: isAuthenticated ? 'My account' : 'Sign in',
      description: isAuthenticated ? 'Profile & orders' : 'Access your orders and wishlist',
      href: accountHref,
    },
    {
      icon: Heart,
      label: 'Wishlist',
      description: `${wishlistCount} ${wishlistCount === 1 ? 'item' : 'items'} saved`,
      href: '/account/wishlist',
    },
  ];

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        isScrolled ? 'border-b bg-background/90 shadow-xs backdrop-blur-md' : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <SiteLogo priority />

        <nav aria-label="Main" className="hidden flex-1 justify-center lg:flex">
          <NavLinks items={links} variant="bar" />
        </nav>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1 lg:ml-0">
          <HeaderAction icon={Search} label="Search (Ctrl+K)" onClick={() => setSearchOpen(true)} />
          <HeaderAction
            icon={User}
            label={isAuthenticated ? 'My account' : 'Sign in'}
            href={accountHref}
            className="hidden sm:flex"
          />
          <HeaderAction
            icon={Heart}
            label="Wishlist"
            href="/account/wishlist"
            count={wishlistCount}
            className="hidden sm:flex"
          />
          <HeaderAction icon={ShoppingBag} label="Cart" href="/cart" count={cartCount} />
          <HeaderAction
            icon={Menu}
            label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="lg:hidden"
          />
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="flex w-[88vw] max-w-sm flex-col gap-0 p-0">
          <SheetHeader className="border-b px-5 py-4">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SiteLogo onClick={closeMenu} />
          </SheetHeader>

          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
            <button
              type="button"
              onClick={() => {
                closeMenu();
                setSearchOpen(true);
              }}
              className="flex h-11 w-full items-center gap-3 rounded-lg border bg-muted/40 px-4 text-sm text-muted-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-accent-rose/40"
            >
              <Search className="h-4 w-4" />
              Search products…
            </button>

            <nav aria-label="Mobile">
              <NavLinks items={links} variant="drawer" onNavigate={closeMenu} />
            </nav>

            <ul className="space-y-1 border-t pt-6">
              {shortcuts.map(({ icon: Icon, label, description, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-accent-rose/40"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-rose/10 text-accent-rose">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-medium">{label}</span>
                      <span className="block text-xs text-muted-foreground">{description}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t p-5">
            <Button asChild className="h-11 w-full gap-2 bg-accent-rose hover:bg-accent-rose-dark">
              <Link href="/cart" onClick={closeMenu}>
                <ShoppingBag className="h-4 w-4" />
                View cart{cartCount > 0 && ` (${cartCount})`}
              </Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}

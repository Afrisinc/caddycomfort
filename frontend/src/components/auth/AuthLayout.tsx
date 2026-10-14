import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import Image from '@/components/common/Image';
import Link from '@/components/common/Link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Heading, Text } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { useStoreSettings } from '@/store/useSettingsStore';

const AUTH_IMAGE = '/new-images/about-hero.jpg';
const CURVED_CORNERS = 'lg:rounded-tr-[9rem] lg:rounded-bl-[9rem]';

interface AuthLayoutProps {
  readonly title: string;
  readonly description?: ReactNode;
  readonly icon?: LucideIcon;
  readonly image?: string;
  readonly footer?: ReactNode;
  readonly children: ReactNode;
}

export function AuthLayout({
  title,
  description,
  icon: Icon,
  image = AUTH_IMAGE,
  footer,
  children,
}: AuthLayoutProps) {
  const { storeName } = useStoreSettings();

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background pt-20">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div
            className={cn(
              'grid overflow-hidden rounded-3xl bg-card shadow-sm lg:grid-cols-2',
              CURVED_CORNERS,
            )}
          >
            <div
              className={cn(
                'relative hidden min-h-160 overflow-hidden bg-muted lg:block',
                CURVED_CORNERS,
              )}
            >
              <Image
                src={image}
                alt=""
                aria-hidden="true"
                fill
                priority
                sizes="(min-width: 1024px) 560px, 0px"
                className="object-cover object-top"
                fallback={null}
              />
            </div>

            <div className="flex flex-col justify-center px-6 py-10 sm:px-12 sm:py-14 lg:px-14">
              <div className="mx-auto w-full max-w-sm">
                <header className="mb-8">
                  <p className="mb-6 text-sm font-semibold tracking-[0.18em] text-accent-rose uppercase">
                    Welcome to {storeName}
                  </p>
                  {Icon && (
                    <span className="mb-4 flex size-11 items-center justify-center rounded-full bg-accent-rose/10 text-accent-rose">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                  )}
                  <Heading as="h1" size="lg">
                    {title}
                  </Heading>
                  {description && (
                    <Text variant="small" className="mt-2">
                      {description}
                    </Text>
                  )}
                </header>

                {children}

                {footer && (
                  <div className="mt-8 text-center text-sm text-muted-foreground">{footer}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

interface AuthLinkProps {
  readonly href: string;
  readonly className?: string;
  readonly children: ReactNode;
}

export function AuthLink({ href, className, children }: AuthLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'rounded-sm font-medium text-accent-rose underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-accent-rose/40 focus-visible:outline-none',
        className,
      )}
    >
      {children}
    </Link>
  );
}

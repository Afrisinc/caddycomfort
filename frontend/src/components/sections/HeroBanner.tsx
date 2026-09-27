import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import Link from '@/components/common/Link';
import Image from '@/components/common/Image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { HeroSlide } from '@/lib/homeContent';

interface HeroBannerProps {
  readonly slides: HeroSlide[];
  readonly autoPlayInterval?: number;
}

const controlClass =
  'flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors outline-none hover:bg-white/25 focus-visible:ring-2 focus-visible:ring-white/70';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  );
  useEffect(() => {
    const query = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) return;
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

function HeroPreview({
  slide,
  label,
  onSelect,
}: Readonly<{ slide: HeroSlide; label: string; onSelect: () => void }>) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${label}: ${slide.title}`}
      className="group relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-muted text-left outline-none focus-visible:ring-2 focus-visible:ring-accent-rose/50 focus-visible:ring-offset-2"
    >
      <Image
        src={slide.image}
        alt=""
        fill
        sizes="18rem"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
      <span className="absolute inset-x-4 bottom-4 text-white">
        <span className="block text-[11px] font-medium uppercase tracking-wider text-white/75">
          {label}
        </span>
        <span className="mt-0.5 line-clamp-2 block text-sm font-medium">{slide.title}</span>
      </span>
    </button>
  );
}

export function HeroBanner({ slides, autoPlayInterval = 6000 }: HeroBannerProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [interacting, setInteracting] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const count = slides.length;
  const autoPlay = playing && !interacting && !reducedMotion && count > 1;

  const goTo = useCallback((next: number) => setIndex((next + count) % count), [count]);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, count]);

  if (count === 0) return null;
  const slide = slides[index];
  const upcoming = [1, 2]
    .filter((offset) => offset < count)
    .map((offset) => (index + offset) % count);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="bg-background pt-24 pb-6 md:pt-28"
    >
      <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:px-8">
        <div
          className="relative h-110 overflow-hidden rounded-3xl bg-muted sm:h-130 lg:h-150"
          onMouseEnter={() => setInteracting(true)}
          onMouseLeave={() => setInteracting(false)}
          onFocus={() => setInteracting(true)}
          onBlur={() => setInteracting(false)}
        >
          {slides.map((item, i) => (
            <div
              key={item.image}
              aria-hidden={i !== index}
              className={cn(
                'absolute inset-0 transition-opacity duration-700 ease-out',
                i === index ? 'opacity-100' : 'opacity-0',
              )}
            >
              <Image
                src={item.image}
                alt={item.imageAlt}
                fill
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 70vw"
                className={cn(
                  'object-cover transition-transform duration-6000 ease-out',
                  i === index && !reducedMotion ? 'scale-105' : 'scale-100',
                )}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/35 to-transparent" />

          <div
            key={index}
            aria-live={autoPlay ? 'off' : 'polite'}
            className="animate-in fade-in-0 slide-in-from-bottom-2 absolute inset-x-0 bottom-0 flex flex-col gap-5 p-6 pb-24 text-white duration-500 sm:p-10 sm:pb-28 lg:top-0 lg:justify-center lg:p-14"
          >
            <p className="w-fit rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider backdrop-blur-md">
              {slide.eyebrow}
            </p>
            <h2 className="max-w-xl font-serif text-3xl leading-tight font-semibold tracking-tight text-white md:text-4xl lg:text-5xl">
              {slide.title}
            </h2>
            <Button
              asChild
              size="lg"
              className="h-12 w-fit gap-2 bg-white px-6 text-foreground shadow-lg hover:bg-white/90"
            >
              <Link href={slide.ctaLink}>
                {slide.ctaText}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {count > 1 && (
            <div className="absolute inset-x-6 bottom-6 flex items-center justify-between gap-4 sm:inset-x-10 lg:inset-x-14">
              <div className="flex items-center gap-2">
                {slides.map((item, i) => (
                  <button
                    key={item.image}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Show slide ${i + 1} of ${count}`}
                    aria-current={i === index}
                    className="flex h-6 items-center outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  >
                    <span
                      className={cn(
                        'block h-1.5 rounded-full transition-all duration-300',
                        i === index ? 'w-8 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80',
                      )}
                    />
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
                  className={cn(controlClass, 'h-9 w-9')}
                >
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => goTo(index - 1)}
                  aria-label="Previous slide"
                  className={controlClass}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(index + 1)}
                  aria-label="Next slide"
                  className={controlClass}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {upcoming.length > 0 && (
          <div className="hidden gap-4 lg:flex lg:flex-col">
            {upcoming.map((slideIndex, i) => (
              <HeroPreview
                key={slides[slideIndex].image}
                slide={slides[slideIndex]}
                label={i === 0 ? 'Up next' : 'Coming up'}
                onSelect={() => goTo(slideIndex)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import Link from '@/components/common/Link';
import Image from '@/components/common/Image';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroSlide {
  subtitle: string;
  title: string;
  description?: string;
  ctaText: string;
  ctaLink: string;
  image?: string;
  gradient?: string;
}

interface HeroBannerProps {
  slides?: HeroSlide[];
  autoPlayInterval?: number;
}

const defaultSlides: HeroSlide[] = [
  {
    subtitle: 'New Arrival',
    title: 'Timeless Elegance for Every Occasion',
    description: 'Starting From',
    ctaText: 'SHOP NOW',
    ctaLink: '/shop',
    image: '/new-images/hero-1.jpg',
    gradient: 'from-accent-rose-subtle via-accent-rose-muted to-accent-rose-subtle',
  },
  {
    subtitle: 'Perfect for Summer Evenings',
    title: 'Casual and Stylish for All Seasons',
    description: 'Starting From',
    ctaText: 'EXPLORE COLLECTION',
    ctaLink: '/shop',
    image: '/new-images/hero-2.jpg',
    gradient: 'from-purple-100 via-pink-100 to-rose-100',
  },
  {
    subtitle: 'Limited Edition',
    title: 'Luxury Meets Contemporary Design',
    description: 'Starting From',
    ctaText: 'DISCOVER MORE',
    ctaLink: '/shop',
    image: '/new-images/hero-3.jpg',
    gradient: 'from-blue-100 via-indigo-100 to-purple-100',
  },
];

export function HeroBanner({ slides = defaultSlides, autoPlayInterval = 5000 }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(0);
  const [slideCount, setSlideCount] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setSlideCount((prev) => prev + 1);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setSlideCount((prev) => prev + 1);
  }, [slides.length]);

  const goToSlide = useCallback(
    (index: number) => {
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
      setSlideCount((prev) => prev + 1);
    },
    [currentIndex],
  );

  // Swap layout every 2 slides
  const isSwapped = Math.floor(slideCount / 2) % 2 === 1;

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;

    const timer = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isAutoPlaying, autoPlayInterval, nextSlide, slides.length]);

  const currentSlide = slides[currentIndex];

  // Typing animation effect
  useEffect(() => {
    setTypedText('');
    setShowCursor(true);
    let currentCharIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentCharIndex < currentSlide.title.length) {
        setTypedText(currentSlide.title.slice(0, currentCharIndex + 1));
        currentCharIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50); // Typing speed

    return () => clearInterval(typingInterval);
  }, [currentIndex, currentSlide.title]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  const imageVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
    }),
    center: {
      x: 0,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
    }),
  };

  const contentVariants = {
    enter: {
      opacity: 0,
    },
    center: {
      opacity: 1,
      transition: {
        delay: 0.3,
        duration: 0.5,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  const getNextIndex = (offset: number) => {
    return (currentIndex + offset + slides.length) % slides.length;
  };

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden bg-background pt-14">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-8">
        <div className="flex gap-4 lg:gap-6 h-[500px] md:h-[600px]">
          {/* Main Active Slide - 70% on desktop, 100% on mobile */}
          <div className="relative flex-1 lg:w-[70%] rounded-2xl overflow-hidden shadow-2xl group">
            {/* Background Image with Animation */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0"
              >
                {currentSlide.image ? (
                  <Image
                    src={currentSlide.image}
                    alt={currentSlide.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 70vw"
                    priority
                  />
                ) : (
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${currentSlide.gradient || 'from-accent-rose-subtle via-accent-rose-muted to-accent-rose-subtle'}`}
                  ></div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12 lg:px-16 text-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`content-${currentIndex}`}
                  variants={contentVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6 max-w-xl"
                >
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-medium border border-white/30">
                    <Sparkles className="h-4 w-4" />
                    {currentSlide.subtitle}
                  </div>

                  {/* Title with Typing Animation */}
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight leading-tight drop-shadow-2xl">
                    <span className="bg-gradient-to-r from-amber-200 via-rose-200 via-pink-200 to-amber-200 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                      {typedText}
                      {showCursor && (
                        <span className="inline-block w-0.5 h-full bg-gradient-to-b from-amber-300 to-rose-400 ml-1 animate-pulse">
                          |
                        </span>
                      )}
                    </span>
                  </h1>

                  {/* CTA Button */}
                  <div className="pt-2">
                    <Link href={currentSlide.ctaLink}>
                      <Button
                        size="lg"
                        className="bg-white text-foreground hover:bg-white/90 shadow-xl font-semibold"
                      >
                        {currentSlide.ctaText}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Arrows - Right Side Vertical (iPhone 11 Style) */}
            {slides.length > 1 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2 bg-background/80 backdrop-blur-sm rounded-tl-3xl rounded-bl-3xl p-2 shadow-lg">
                <button
                  onClick={prevSlide}
                  className="p-2 hover:bg-accent-rose-subtle rounded-lg transition-all hover:scale-110 active:scale-95"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-5 w-5 text-foreground" />
                </button>
                <div className="h-px bg-border mx-1"></div>
                <button
                  onClick={nextSlide}
                  className="p-2 hover:bg-accent-rose-subtle rounded-lg transition-all hover:scale-110 active:scale-95"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-5 w-5 text-foreground" />
                </button>
              </div>
            )}

            {/* Bottom Controls - Inside main slide */}
            {slides.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
                {/* Dots Indicator */}
                <div className="flex gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`transition-all duration-300 rounded-full ${
                        index === currentIndex
                          ? 'w-8 h-2 bg-white'
                          : 'w-2 h-2 bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Play/Pause Button */}
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="bg-white/20 backdrop-blur-md hover:bg-white/30 p-2 rounded-full border border-white/30 transition-all hover:scale-110"
                  aria-label={isAutoPlaying ? 'Pause autoplay' : 'Start autoplay'}
                >
                  {isAutoPlaying ? (
                    <Pause className="h-4 w-4 text-white" />
                  ) : (
                    <Play className="h-4 w-4 text-white" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Side Preview Slides - 30% on desktop, hidden on mobile */}
          {slides.length > 1 && (
            <div className="hidden lg:flex gap-4 w-[30%]">
              {/* First Preview - Swaps between 20% and 10% width */}
              <motion.div
                animate={{
                  width: isSwapped ? '33.33%' : '66.67%',
                }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                onClick={() => nextSlide()}
                className="relative rounded-xl overflow-hidden shadow-lg cursor-pointer group hover:shadow-2xl transition-shadow"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`preview-img-1-${getNextIndex(1)}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    {slides[getNextIndex(1)].image ? (
                      <Image
                        src={slides[getNextIndex(1)].image!}
                        alt={slides[getNextIndex(1)].title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="20vw"
                      />
                    ) : (
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${slides[getNextIndex(1)].gradient}`}
                      ></div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>

                {/* Overlay Label */}
                {!isSwapped && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                      <p className="text-xs font-medium text-muted-foreground">Next</p>
                      <h3 className="text-sm font-serif font-semibold text-foreground line-clamp-1">
                        {slides[getNextIndex(1)].title}
                      </h3>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Second Preview - Swaps between 10% and 20% width */}
              <motion.div
                animate={{
                  width: isSwapped ? '66.67%' : '33.33%',
                }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                onClick={() => goToSlide(getNextIndex(2))}
                className="relative rounded-xl overflow-hidden shadow-lg cursor-pointer group hover:shadow-2xl transition-shadow"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`preview-img-2-${getNextIndex(2)}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    {slides[getNextIndex(2)].image ? (
                      <Image
                        src={slides[getNextIndex(2)].image!}
                        alt={slides[getNextIndex(2)].title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="20vw"
                      />
                    ) : (
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${slides[getNextIndex(2)].gradient}`}
                      ></div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>

                {/* Overlay Label */}
                {isSwapped && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                      <p className="text-xs font-medium text-muted-foreground">Coming Up</p>
                      <h3 className="text-sm font-serif font-semibold text-foreground line-clamp-1">
                        {slides[getNextIndex(2)].title}
                      </h3>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

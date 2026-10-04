import { ArrowRight } from 'lucide-react';
import Image from '@/components/common/Image';

interface HeroBannerPreviewProps {
  readonly image?: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly ctaText: string;
}

export function HeroBannerPreview({ image, eyebrow, title, ctaText }: HeroBannerPreviewProps) {
  return (
    <div className="relative aspect-16/8 overflow-hidden rounded-2xl bg-muted">
      {image ? (
        <Image src={image} alt="" fill sizes="48rem" className="object-cover" />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-br from-accent-rose-subtle to-accent-rose-muted"
        />
      )}
      <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/35 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-center gap-3 p-5 text-white sm:p-8">
        <p className="w-fit rounded-full bg-white/15 px-3 py-1 text-[10px] font-medium uppercase tracking-wider backdrop-blur-md sm:text-xs">
          {eyebrow || 'Label'}
        </p>
        <p className="line-clamp-3 max-w-[60%] font-serif text-lg leading-tight font-semibold sm:text-2xl lg:text-3xl">
          {title || 'Your headline appears here'}
        </p>
        <span className="inline-flex h-8 w-fit items-center gap-1.5 rounded-md bg-white px-3 text-xs font-medium text-foreground sm:h-10 sm:px-4 sm:text-sm">
          {ctaText || 'Button'}
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}

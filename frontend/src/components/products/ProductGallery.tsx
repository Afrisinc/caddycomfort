import { useState } from 'react';
import Image from '@/components/common/Image';
import { ImageLightbox, ImageZoomTrigger } from '@/components/common/ImageLightbox';
import { useImageLightbox } from '@/hooks/useImageLightbox';
import { Badge } from '@/components/ui/badge';

interface ProductGalleryProps {
  readonly images: string[];
  readonly name: string;
  readonly hasDiscount: boolean;
  readonly discountPct: number;
}

export function ProductGallery({ images, name, hasDiscount, discountPct }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const lightbox = useImageLightbox();

  return (
    <div className="space-y-4">
      <div className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
        {images[selectedImage] && (
          <>
            <Image
              src={images[selectedImage]}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              priority
            />
            <ImageZoomTrigger
              onClick={() => lightbox.openAt(selectedImage)}
              className="[&>span]:bottom-4 [&>span]:right-4"
            />
          </>
        )}
        {hasDiscount && (
          <Badge className="pointer-events-none absolute top-4 right-4 bg-accent-rose">
            -{discountPct}%
          </Badge>
        )}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setSelectedImage(index)}
              aria-label={`Show image ${index + 1}`}
              aria-current={selectedImage === index || undefined}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                selectedImage === index
                  ? 'border-accent-rose'
                  : 'border-transparent hover:border-muted-foreground/30'
              }`}
            >
              <Image src={image} alt={`${name} ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <ImageLightbox
        images={images}
        open={lightbox.open}
        index={lightbox.index}
        onOpenChange={lightbox.onOpenChange}
        onIndexChange={(i) => {
          lightbox.setIndex(i);
          setSelectedImage(i);
        }}
        alt={name}
      />
    </div>
  );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

interface ProductGalleryProps {
  images: string[];
  name: string;
  hasDiscount: boolean;
  discountPct: number;
}

export function ProductGallery({ images, name, hasDiscount, discountPct }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        {images[selectedImage] && (
          <Image src={images[selectedImage]} alt={name} fill className="object-cover" priority />
        )}
        {hasDiscount && <Badge className="absolute top-4 right-4 bg-accent-rose">-{discountPct}%</Badge>}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setSelectedImage(index)}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                selectedImage === index ? 'border-accent-rose' : 'border-transparent hover:border-muted-foreground/30'
              }`}
            >
              <Image src={image} alt={`${name} ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

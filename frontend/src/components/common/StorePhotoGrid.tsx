import Image from '@/components/common/Image';
import { ImageLightbox, ImageZoomTrigger } from '@/components/common/ImageLightbox';
import { useImageLightbox } from '@/hooks/useImageLightbox';
import { cn } from '@/lib/utils';

const STORE_PHOTOS = [
  {
    id: 1,
    wide: 720,
    alt: 'Two women wearing Caddy flared leggings, one in black and one in plum',
    className: 'row-span-2',
    position: 'object-center',
  },
  {
    id: 2,
    wide: 1000,
    alt: 'Woman in a green Caddy set walking through the city',
    className: '',
    position: 'object-[50%_28%]',
  },
  {
    id: 3,
    wide: 1000,
    alt: 'Woman in a red and white Caddy set with a wrap top',
    className: '',
    position: 'object-[50%_35%]',
  },
] as const;

const FULL_SIZE_PHOTOS = STORE_PHOTOS.map(
  (photo) => `/new-images/store/store-${photo.id}-${photo.wide}.jpg`,
);

interface StorePhotoGridProps {
  readonly sizes: string;
  readonly className?: string;
}

export function StorePhotoGrid({ sizes, className }: StorePhotoGridProps) {
  const lightbox = useImageLightbox();

  return (
    <>
      <div
        className={cn(
          'grid aspect-4/3 grid-cols-2 grid-rows-2 gap-2 overflow-hidden rounded-3xl bg-muted',
          className,
        )}
      >
        {STORE_PHOTOS.map((photo, index) => (
          <div key={photo.id} className={cn('relative overflow-hidden bg-muted', photo.className)}>
            <Image
              src={`/new-images/store/store-${photo.id}-600.jpg`}
              srcSet={`/new-images/store/store-${photo.id}-600.jpg 600w, /new-images/store/store-${photo.id}-${photo.wide}.jpg ${photo.wide}w`}
              sizes={sizes}
              alt={photo.alt}
              fill
              decoding="async"
              className={cn('object-cover', photo.position)}
            />
            <ImageZoomTrigger
              label={`View full photo: ${photo.alt}`}
              onClick={() => lightbox.openAt(index)}
            />
          </div>
        ))}
      </div>
      <ImageLightbox
        images={FULL_SIZE_PHOTOS}
        open={lightbox.open}
        index={lightbox.index}
        onOpenChange={lightbox.onOpenChange}
        onIndexChange={lightbox.setIndex}
        alt="Caddy store photo"
      />
    </>
  );
}

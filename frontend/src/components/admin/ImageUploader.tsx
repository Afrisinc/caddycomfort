import { useId, useState, type DragEvent } from 'react';
import { ImagePlus, Loader2, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from '@/components/common/Image';
import { ImageLightbox, ImageZoomTrigger } from '@/components/common/ImageLightbox';
import { useImageLightbox } from '@/hooks/useImageLightbox';
import { compressImage } from '@/lib/imageCompression';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  readonly images: string[];
  readonly onChange: (images: string[]) => void;
  readonly max?: number;
  readonly maxBytes?: number;
  readonly disabled?: boolean;
  readonly aspect?: 'square' | 'landscape';
  readonly label?: string;
}

const iconButton =
  'flex h-8 w-8 items-center justify-center rounded-full bg-background/95 text-foreground shadow-sm backdrop-blur-sm transition-colors outline-none hover:bg-background focus-visible:ring-2 focus-visible:ring-accent-rose/50';

export function ImageUploader({
  images,
  onChange,
  max = 5,
  maxBytes = 25 * 1024 * 1024,
  disabled,
  aspect = 'square',
  label = 'Product image',
}: ImageUploaderProps) {
  const inputId = useId();
  const lightbox = useImageLightbox();
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);
  const slotsLeft = max - images.length;

  const addFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    if (list.length > slotsLeft) {
      toast.error(
        `You can add ${slotsLeft} more ${slotsLeft === 1 ? 'image' : 'images'} (max ${max})`,
      );
    }
    const accepted = list.slice(0, Math.max(0, slotsLeft)).filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > maxBytes) {
        toast.error(`${file.name} is larger than ${Math.round(maxBytes / 1024 / 1024)} MB`);
        return false;
      }
      return true;
    });
    if (accepted.length === 0) return;
    setReading(true);
    try {
      const prepared: string[] = [];
      for (const file of accepted) {
        try {
          prepared.push(await compressImage(file));
        } catch (error) {
          toast.error(error instanceof Error ? error.message : `${file.name} could not be read`);
        }
      }
      if (prepared.length > 0) onChange([...images, ...prepared]);
    } finally {
      setReading(false);
    }
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled) addFiles(e.dataTransfer.files);
  };

  const makeCover = (index: number) =>
    onChange([images[index], ...images.filter((_, i) => i !== index)]);

  return (
    <div className="space-y-4">
      {images.length > 0 && (
        <ul className={cn('grid gap-3', max > 1 ? 'grid-cols-3' : 'max-w-xl grid-cols-1')}>
          {images.map((src, index) => (
            <li
              key={src.slice(-48) + index}
              className={cn(
                'group relative overflow-hidden rounded-xl border bg-muted/60',
                aspect === 'landscape' ? 'aspect-4/3' : 'aspect-square',
              )}
            >
              <Image src={src} alt={`${label} ${index + 1}`} fill className="object-contain p-2" />
              <ImageZoomTrigger
                onClick={() => lightbox.openAt(index)}
                label={`Preview image ${index + 1}`}
              />
              {max > 1 && index === 0 && (
                <span className="pointer-events-none absolute top-2 left-2 z-10 rounded-full bg-foreground px-2 py-0.5 text-[11px] font-semibold text-background">
                  Cover
                </span>
              )}
              <div className="absolute top-2 right-2 z-10 flex gap-1.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100">
                {max > 1 && index > 0 && (
                  <button
                    type="button"
                    onClick={() => makeCover(index)}
                    aria-label={`Make image ${index + 1} the cover`}
                    title="Make cover"
                    className={iconButton}
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onChange(images.filter((_, i) => i !== index))}
                  aria-label={`Remove image ${index + 1}`}
                  title="Remove"
                  className={cn(iconButton, 'text-red-600')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {slotsLeft > 0 && (
        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors focus-within:ring-2 focus-within:ring-accent-rose/40',
            dragging
              ? 'border-accent-rose bg-accent-rose/5'
              : 'hover:border-foreground/30 hover:bg-muted/40',
            disabled && 'pointer-events-none opacity-50',
          )}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-rose/10 text-accent-rose">
            {reading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ImagePlus className="h-5 w-5" />
            )}
          </span>
          <span className="text-sm font-medium">
            {dragging ? 'Drop images here' : 'Drag images here or click to browse'}
          </span>
          <span className="text-xs text-muted-foreground">
            JPG, PNG or WebP · up to {Math.round(maxBytes / 1024 / 1024)} MB · {images.length}/{max}{' '}
            added
          </span>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            multiple
            disabled={disabled}
            className="sr-only"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </label>
      )}

      {max > 1 && images.length > 1 && (
        <p className="text-xs text-muted-foreground">The cover image is shown first in the shop.</p>
      )}

      <ImageLightbox
        images={images}
        open={lightbox.open}
        index={lightbox.index}
        onOpenChange={lightbox.onOpenChange}
        onIndexChange={lightbox.setIndex}
        alt={label}
      />
    </div>
  );
}

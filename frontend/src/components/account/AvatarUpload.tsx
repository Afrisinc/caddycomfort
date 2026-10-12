import { useId, useRef, useState, type ChangeEvent } from 'react';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/account/UserAvatar';
import { compressImage } from '@/lib/imageCompression';
import { cn, errorMessage } from '@/lib/utils';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_DIMENSION = 800;

type Pending = 'upload' | 'remove' | null;

interface AvatarUploadProps {
  readonly src?: string | null;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly email?: string;
  readonly onUpload: (dataUrl: string) => Promise<void>;
  readonly onRemove: () => Promise<void>;
  readonly layout?: 'inline' | 'stacked';
}

export function AvatarUpload({
  src,
  firstName,
  lastName,
  email,
  onUpload,
  onRemove,
  layout = 'inline',
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hintId = useId();
  const [pending, setPending] = useState<Pending>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = pending !== null;
  const inline = layout === 'inline';
  let uploadLabel = src ? 'Change photo' : 'Upload photo';
  if (pending === 'upload') uploadLabel = 'Uploading…';

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Choose a JPG, PNG, WebP or GIF image.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError('That image is larger than 10 MB. Choose a smaller one.');
      return;
    }

    setError(null);
    setPending('upload');
    try {
      await onUpload(await compressImage(file, { maxDimension: MAX_DIMENSION }));
    } catch (uploadError) {
      setError(errorMessage(uploadError, 'Your photo could not be uploaded. Please try again.'));
    } finally {
      setPending(null);
    }
  };

  const handleRemove = async () => {
    setError(null);
    setPending('remove');
    try {
      await onRemove();
    } catch (removeError) {
      setError(errorMessage(removeError, 'Your photo could not be removed. Please try again.'));
    } finally {
      setPending(null);
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-5', inline && 'sm:flex-row')}>
      <div className="relative">
        <UserAvatar
          src={src}
          firstName={firstName}
          lastName={lastName}
          email={email}
          size="lg"
          className="ring-4 ring-background"
        />
        {pending === 'upload' && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
            <Loader2 className="h-6 w-6 animate-spin text-accent-rose" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className={cn('space-y-2 text-center', inline && 'sm:text-left')}>
        <div className={cn('flex flex-wrap justify-center gap-2', inline && 'sm:justify-start')}>
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            aria-describedby={hintId}
            className="gap-2"
          >
            {pending === 'upload' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            {uploadLabel}
          </Button>
          {src && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleRemove}
              disabled={busy}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              {pending === 'remove' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Remove
            </Button>
          )}
        </div>
        {error ? (
          <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : (
          <p id={hintId} className="text-xs text-muted-foreground">
            JPG, PNG, WebP or GIF, up to 10 MB. Square photos look best.
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFile}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

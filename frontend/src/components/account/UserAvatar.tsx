import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const SIZES = {
  sm: 'size-8 text-xs',
  md: 'size-16 text-lg',
  lg: 'size-24 text-2xl',
} as const;

interface UserAvatarProps {
  readonly src?: string | null;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly email?: string;
  readonly size?: keyof typeof SIZES;
  readonly className?: string;
}

function initialsOf(firstName?: string | null, lastName?: string | null, email?: string): string {
  const initials = [firstName, lastName]
    .map((part) => part?.trim().charAt(0) ?? '')
    .join('')
    .toUpperCase();
  return initials || email?.charAt(0).toUpperCase() || '?';
}

export function UserAvatar({
  src,
  firstName,
  lastName,
  email,
  size = 'md',
  className,
}: UserAvatarProps) {
  const name = [firstName, lastName].filter(Boolean).join(' ') || email || 'Your';

  return (
    <Avatar className={cn(SIZES[size], className)}>
      {src && <AvatarImage src={src} alt={`${name} profile photo`} className="object-cover" />}
      <AvatarFallback
        aria-hidden="true"
        className="bg-accent-rose-subtle font-semibold text-accent-rose"
      >
        {initialsOf(firstName, lastName, email)}
      </AvatarFallback>
    </Avatar>
  );
}

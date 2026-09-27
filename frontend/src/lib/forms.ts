const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function fieldDescribedBy(id: string, hasHint: boolean, hasError: boolean) {
  return (
    [hasError && `${id}-error`, hasHint && `${id}-hint`].filter(Boolean).join(' ') || undefined
  );
}

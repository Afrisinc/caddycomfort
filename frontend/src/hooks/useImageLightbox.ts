import { useCallback, useState } from 'react';

export function useImageLightbox() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const openAt = useCallback((i: number) => {
    setIndex(i);
    setOpen(true);
  }, []);
  return { open, index, openAt, setIndex, onOpenChange: setOpen };
}

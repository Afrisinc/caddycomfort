import { useMemo } from 'react';
import { useStoreSettings } from '@/store/useSettingsStore';
import { toContactInfo } from '@/lib/contactInfo';

export function useContactInfo() {
  const settings = useStoreSettings();
  return useMemo(() => toContactInfo(settings), [settings]);
}

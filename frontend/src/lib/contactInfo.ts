import type { StoreSettings } from '@/lib/storeSettings';

export interface ContactInfo {
  email: string;
  emailHref: string;
  phone: string;
  phoneHref: string;
  address: string;
  mapsHref: string;
  hours: string;
}

export function toContactInfo(settings: StoreSettings): ContactInfo {
  return {
    email: settings.email,
    emailHref: `mailto:${settings.email}`,
    phone: settings.phone,
    phoneHref: `tel:${settings.phone.replace(/[^\d+]/g, '')}`,
    address: settings.address,
    mapsHref: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`,
    hours: settings.openingHours,
  };
}

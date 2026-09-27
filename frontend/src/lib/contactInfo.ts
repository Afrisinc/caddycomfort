const ADDRESS = 'KN 4 Ave, Kigali, Rwanda';

export const CONTACT = {
  email: 'caddyumutoniwase@gmail.com',
  emailHref: 'mailto:caddyumutoniwase@gmail.com',
  phone: '+250 786 763 654',
  phoneHref: 'tel:+250786763654',
  address: ADDRESS,
  mapsHref: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`,
  hours: 'Mon–Sat: 9AM–8PM',
} as const;

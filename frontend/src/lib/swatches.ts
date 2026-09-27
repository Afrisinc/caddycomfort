const SWATCH_HEX: Record<string, string> = {
  black: '#111111',
  white: '#ffffff',
  red: '#dc2626',
  blue: '#2563eb',
  green: '#16a34a',
  pink: '#ec4899',
  tan: '#d2b48c',
  brown: '#78350f',
  cream: '#f5f0e6',
  grey: '#6b7280',
  gray: '#6b7280',
  navy: '#1e3a8a',
  burgundy: '#7f1d1d',
  beige: '#e8dcc4',
  gold: '#d4af37',
  silver: '#c0c0c0',
  yellow: '#facc15',
  orange: '#f97316',
  purple: '#7c3aed',
  maroon: '#800000',
  khaki: '#c3b091',
  olive: '#6b7c32',
};

const LIGHT_SWATCHES = new Set(['white', 'cream', 'beige', 'silver', 'yellow']);

export function swatchColor(name: string): string | undefined {
  const key = name.trim().toLowerCase();
  return SWATCH_HEX[key] ?? (CSS.supports('color', key) ? key : undefined);
}

export function isLightSwatch(name: string): boolean {
  return LIGHT_SWATCHES.has(name.trim().toLowerCase());
}

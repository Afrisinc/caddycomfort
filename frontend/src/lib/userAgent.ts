export type DeviceKind = 'mobile' | 'tablet' | 'desktop' | 'unknown';

export interface DeviceInfo {
  browser: string;
  os: string;
  kind: DeviceKind;
}

const BROWSERS: [RegExp, string][] = [
  [/Edg\//, 'Edge'],
  [/OPR\/|Opera/, 'Opera'],
  [/SamsungBrowser/, 'Samsung Internet'],
  [/Firefox\/|FxiOS/, 'Firefox'],
  [/Chrome\/|CriOS/, 'Chrome'],
  [/Safari\//, 'Safari'],
  [/curl|PostmanRuntime|axios|python-requests|node-fetch/i, 'Script / API client'],
];

const SYSTEMS: [RegExp, string][] = [
  [/iPhone|iPod/, 'iPhone'],
  [/iPad/, 'iPad'],
  [/Android/, 'Android'],
  [/Windows/, 'Windows'],
  [/Mac OS X|Macintosh/, 'macOS'],
  [/CrOS/, 'ChromeOS'],
  [/Linux/, 'Linux'],
];

const match = (ua: string, list: [RegExp, string][]) =>
  list.find(([pattern]) => pattern.test(ua))?.[1];

export function parseUserAgent(ua: string | null | undefined): DeviceInfo {
  if (!ua) return { browser: 'Unknown browser', os: 'Unknown device', kind: 'unknown' };
  const os = match(ua, SYSTEMS);
  let kind: DeviceKind = 'desktop';
  if (!os) kind = 'unknown';
  else if (/iPad|Tablet/.test(ua)) kind = 'tablet';
  else if (/Mobi|iPhone|Android/.test(ua)) kind = 'mobile';
  return {
    browser: match(ua, BROWSERS) ?? 'Unknown browser',
    os: os ?? 'Unknown device',
    kind,
  };
}

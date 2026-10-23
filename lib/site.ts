import type { Locale } from '~/lib/i18n';

// The address without www is the canonical one: www redirects to it.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://libertad.lat';

// The images show the address with www so people recognize it as a link, as ".lat" alone is uncommon.
const HOST = new URL(SITE_URL).host;

export const SITE_DISPLAY_HOST = HOST.startsWith('www.') ? HOST : `www.${HOST}`;

// Open Graph expects language_TERRITORY codes.
export const OG_LOCALES: Record<Locale, string> = {
  es: 'es_LA',
  pt: 'pt_BR',
  gn: 'gn_PY',
  fr: 'fr_FR',
  qu: 'qu_PE',
  ht: 'ht_HT',
};

export function getAbsoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

export const CONTACT_EMAIL = 'libertad.lat@proton.me';

// The subject tells the team which page the message is about.
export function getContactHref(pagePath = ''): string {
  const subject = `${new URL(SITE_URL).host}${pagePath}`;

  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

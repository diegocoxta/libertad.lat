import type { MetadataRoute } from 'next';

import { COUNTRY_CODES, getCountrySlug } from '~/lib/countries';
import { DEFAULT_LOCALE, LOCALES } from '~/lib/i18n';
import { getAbsoluteUrl } from '~/lib/site';

const PATHS = ['', '/2026', ...COUNTRY_CODES.map((code) => `/${getCountrySlug(code)}`)];

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.flatMap((locale) =>
    PATHS.map((path) => ({
      url: getAbsoluteUrl(`/${locale}${path}`),
      alternates: {
        languages: {
          ...Object.fromEntries(LOCALES.map((loc) => [loc, getAbsoluteUrl(`/${loc}${path}`)])),
          'x-default': getAbsoluteUrl(`/${DEFAULT_LOCALE}${path}`),
        },
      },
    })),
  );
}

import { DEFAULT_LOCALE, type Locale } from '~/lib/i18n';

export const COUNTRY_CODES = [
  'AR',
  'BO',
  'BR',
  'CL',
  'CO',
  'CU',
  'DO',
  'EC',
  'SV',
  'GT',
  'GY',
  'HT',
  'HN',
  'MX',
  'NI',
  'PA',
  'PY',
  'PR',
  'PE',
  'UY',
  'VE',
] as const;

export type CountryCode = (typeof COUNTRY_CODES)[number];

export type CountryType = {
  code: CountryCode;
  name: string;
};

// Intl has no region names for every locale (e.g. gn, ht); those fall back to the default locale.
function getRegionNames(locale: Locale) {
  return new Intl.DisplayNames([locale, DEFAULT_LOCALE], { type: 'region' });
}

export function getCountryName(code: CountryCode, locale: Locale): string {
  return getRegionNames(locale).of(code) ?? code;
}

// French needs the preposition that agrees with each country ("en Argentine", "au Brésil").
const FRENCH_PLACES: Record<CountryCode, string> = {
  AR: 'en Argentine',
  BO: 'en Bolivie',
  BR: 'au Brésil',
  CL: 'au Chili',
  CO: 'en Colombie',
  CU: 'à Cuba',
  DO: 'en République dominicaine',
  EC: 'en Équateur',
  SV: 'au Salvador',
  GT: 'au Guatemala',
  GY: 'au Guyana',
  HT: 'en Haïti',
  HN: 'au Honduras',
  MX: 'au Mexique',
  NI: 'au Nicaragua',
  PA: 'au Panama',
  PY: 'au Paraguay',
  PR: 'à Porto Rico',
  PE: 'au Pérou',
  UY: 'en Uruguay',
  VE: 'au Venezuela',
};

export function getCountryPlace(code: CountryCode, locale: Locale): string {
  return locale === 'fr' ? FRENCH_PLACES[code] : getCountryName(code, locale);
}

export function getCountries(locale: Locale): CountryType[] {
  const names = getRegionNames(locale);
  const collator = new Intl.Collator(locale);

  return COUNTRY_CODES.map((code) => ({ code, name: names.of(code) ?? code })).sort((a, b) =>
    collator.compare(a.name, b.name),
  );
}

export function getCountrySlug(code: CountryCode): string {
  return code.toLowerCase();
}

export function parseCountrySlug(slug: string): CountryCode | null {
  return COUNTRY_CODES.find((code) => getCountrySlug(code) === slug) ?? null;
}

export function getCountryStaticParams(): { country: string }[] {
  return COUNTRY_CODES.map((code) => ({ country: getCountrySlug(code) }));
}

import { COUNTRY_CONTENT } from '~/content/countries';
import type { CountryCode } from '~/lib/countries';
import type { Locale } from '~/lib/i18n';

export type LocalizedType = Record<Locale, string>;

export type CountrySourceType = {
  title: string;
  url: string;
  note?: LocalizedType;
};

export type GeneralSourcesType = {
  intro: LocalizedType;
  items: { title: LocalizedType; url: string; note: LocalizedType }[];
  outro: LocalizedType;
};

export type CountryEraType = {
  period: LocalizedType;
  summary: LocalizedType;
  happened: LocalizedType;
  usActions: { label: LocalizedType; text: LocalizedType }[];
  impact?: {
    items?: { label: LocalizedType; text: LocalizedType }[];
    text?: LocalizedType;
    context?: LocalizedType;
  };
  sources: CountrySourceType[];
};

export type CountryContentType = CountryEraType & {
  // A more recent chapter, shown above the main one.
  latest?: CountryEraType;
};

export function getCountryContent(code: CountryCode): CountryContentType | null {
  return COUNTRY_CONTENT[code] ?? null;
}

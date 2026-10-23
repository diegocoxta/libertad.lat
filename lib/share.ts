import { getCountryPlace, getCountrySlug, type CountryCode } from '~/lib/countries';
import { getTranslations, type Locale } from '~/lib/i18n';

const PLACEHOLDER = '{country}';

export type ShareHeadlineType = {
  lead: string;
  place: string;
  tail: string;
};

export function getSharePath(locale: Locale, code: CountryCode): string {
  return `/share/${locale}/${getCountrySlug(code)}.png`;
}

export function getOgImagePath(locale: Locale, name: string): string {
  return `/og/${locale}/${name}.png`;
}

export function getShareFileName(code: CountryCode): string {
  return `liberdade-${getCountrySlug(code)}.png`;
}

export function getShareLabel(locale: Locale, code: CountryCode): string {
  return getTranslations(locale)('page.share').replace(PLACEHOLDER, getCountryPlace(code, locale));
}

export function getShareText(locale: Locale, code: CountryCode): string {
  return getTranslations(locale)('page.discover').replace(PLACEHOLDER, getCountryPlace(code, locale));
}

// The image sets the place apart from the rest of the sentence, so it can be drawn larger. In some
// locales the sentence goes on after the place ("... {country}man chayarqan"): the suffix stays
// attached to the place and the remaining words become the tail.
export function getShareHeadline(locale: Locale, code: CountryCode): ShareHeadlineType {
  const [before, after = ''] = getTranslations(locale)('page.discover').split(PLACEHOLDER);
  const [suffix, ...rest] = after.split(' ');

  return {
    lead: before.trim().toLocaleUpperCase(locale),
    place: `${getCountryPlace(code, locale)}${suffix}`.toLocaleUpperCase(locale),
    tail: rest.join(' ').toLocaleUpperCase(locale),
  };
}

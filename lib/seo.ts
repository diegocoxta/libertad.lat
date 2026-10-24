import type { Metadata } from 'next';

import { OFFENSIVE_2026 } from '~/content/offensive-2026';
import { getCountryName, getCountrySlug, type CountryCode } from '~/lib/countries';
import { getCountryContent } from '~/lib/country-content';
import { DEFAULT_LOCALE, LOCALES, getTranslations, type Locale } from '~/lib/i18n';
import { getOgImagePath } from '~/lib/share';
import { OG_LOCALES, getAbsoluteUrl } from '~/lib/site';

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
export const ARTICLE_PUBLISHED_AT = '2026-10-23';

type PageMetadataParamsType = {
  locale: Locale;
  path?: string;
  title: string;
  description: string;
  image: string;
  type?: 'website' | 'article';
};

// Removes the mini markup used in the content: [label](url) links, **bold** and _italic_.
export function stripMarkup(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncate(text: string, max = 160): string {
  if (text.length <= max) {
    return text;
  }

  const cut = text.slice(0, max - 1);
  const end = cut.lastIndexOf(' ');

  return `${(end > 0 ? cut.slice(0, end) : cut).replace(/[\s,;:.–—-]+$/, '')}…`;
}

// Search engines cut titles at about 60 characters, so the site name only follows when it fits.
function composeTitle(title: string, locale: Locale): string {
  const full = `${title} — ${getTranslations(locale)('page.title')}`;

  return full.length <= 65 ? full : title;
}

export function getHomeDescription(locale: Locale): string {
  const t = getTranslations(locale);

  return `${t('page.title')} — ${t('page.soon')}`;
}

export function getCountrySeo(locale: Locale, code: CountryCode) {
  const slug = getCountrySlug(code);
  const name = getCountryName(code, locale);
  const content = getCountryContent(code);
  // The page opens with its latest chapter, so that is the one the description has to match.
  const lead = content?.latest ?? content;

  return {
    slug,
    name,
    title: composeTitle(name, locale),
    description: lead ? truncate(stripMarkup(lead.summary[locale])) : getHomeDescription(locale),
    image: getOgImagePath(locale, slug),
  };
}

export function getArticleSeo(locale: Locale) {
  const intro = OFFENSIVE_2026.blocks.find((block) => block.type === 'paragraph');
  const title = OFFENSIVE_2026.title[locale];

  return {
    title: composeTitle(title, locale),
    headline: title,
    description: intro ? truncate(stripMarkup(intro.text[locale]), 200) : getHomeDescription(locale),
    image: getOgImagePath(locale, '2026'),
  };
}

// Next merges metadata one field at a time, so each page has to give its own openGraph and twitter.
export function createPageMetadata({
  locale,
  path = '',
  title,
  description,
  image,
  type = 'website',
}: PageMetadataParamsType): Metadata {
  const url = `/${locale}${path}`;

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(LOCALES.map((loc) => [loc, `/${loc}${path}`])),
        'x-default': `/${DEFAULT_LOCALE}${path}`,
      },
    },
    openGraph: {
      type,
      url,
      siteName: getTranslations(locale)('page.title'),
      title,
      description,
      locale: OG_LOCALES[locale],
      alternateLocale: LOCALES.filter((loc) => loc !== locale).map((loc) => OG_LOCALES[loc]),
      images: [{ url: image, ...OG_IMAGE_SIZE, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

function createBreadcrumb(pageUrl: string, locale: Locale, name: string) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: getTranslations(locale)('page.title'), item: getAbsoluteUrl(`/${locale}`) },
      { '@type': 'ListItem', position: 2, name, item: pageUrl },
    ],
  };
}

export function createWebSiteJsonLd(locale: Locale, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: getTranslations(locale)('page.title'),
    url: getAbsoluteUrl(`/${locale}`),
    description,
    inLanguage: locale,
  };
}

type CountryJsonLdParamsType = {
  locale: Locale;
  slug: string;
  countryName: string;
  title: string;
  description: string;
  image: string;
};

export function createCountryJsonLd({ locale, slug, countryName, title, description, image }: CountryJsonLdParamsType) {
  const pageUrl = getAbsoluteUrl(`/${locale}/${slug}`);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': pageUrl,
        url: pageUrl,
        name: title,
        description,
        inLanguage: locale,
        image: getAbsoluteUrl(image),
        about: { '@type': 'Country', name: countryName },
        isPartOf: { '@type': 'WebSite', name: getTranslations(locale)('page.title'), url: getAbsoluteUrl(`/${locale}`) },
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      },
      createBreadcrumb(pageUrl, locale, countryName),
    ],
  };
}

type ArticleJsonLdParamsType = {
  locale: Locale;
  title: string;
  description: string;
  image: string;
};

export function createArticleJsonLd({ locale, title, description, image }: ArticleJsonLdParamsType) {
  const pageUrl = getAbsoluteUrl(`/${locale}/2026`);
  const siteName = getTranslations(locale)('page.title');

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': pageUrl,
        headline: title,
        description,
        inLanguage: locale,
        image: getAbsoluteUrl(image),
        datePublished: ARTICLE_PUBLISHED_AT,
        mainEntityOfPage: pageUrl,
        publisher: { '@type': 'Organization', name: siteName, url: getAbsoluteUrl(`/${locale}`) },
        breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
      },
      createBreadcrumb(pageUrl, locale, title),
    ],
  };
}

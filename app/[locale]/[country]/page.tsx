import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { CountryDetails } from '~/components/country-details';
import { CountryHistory } from '~/components/country-history';
import { EmblemLink } from '~/components/emblem-link';
import { SiteFooter } from '~/components/site-footer';
import { getCountryName, getCountrySlug, getCountryStaticParams, parseCountrySlug } from '~/lib/countries';
import { LOCALES, getTranslations, isSupportedLocale } from '~/lib/i18n';
import { getCountryContent } from '~/lib/country-content';

import styles from './page.module.css';

export const generateStaticParams = getCountryStaticParams;

export async function generateMetadata({ params }: PageProps<'/[locale]/[country]'>): Promise<Metadata> {
  const { locale, country } = await params;
  const code = parseCountrySlug(country);

  if (!isSupportedLocale(locale) || !code) {
    return {};
  }

  const slug = getCountrySlug(code);

  return {
    title: `${getCountryName(code, locale)} — ${getTranslations(locale)('page.title')}`,
    alternates: {
      canonical: `/${locale}/${slug}`,
      languages: Object.fromEntries(LOCALES.map((loc) => [loc, `/${loc}/${slug}`])),
    },
  };
}

type CountryParamsType = PageProps<'/[locale]/[country]'>['params'];

export default function CountryPage({ params }: PageProps<'/[locale]/[country]'>) {
  return (
    <Suspense fallback={<main className={styles.page} />}>
      <CountryContent params={params} />
    </Suspense>
  );
}

async function CountryContent({ params }: { params: CountryParamsType }) {
  const { locale, country } = await params;
  const code = parseCountrySlug(country);

  if (!isSupportedLocale(locale) || !code) {
    notFound();
  }

  const t = getTranslations(locale);
  const content = getCountryContent(code);

  return (
    <>
      <main className={styles.page}>
        <EmblemLink locale={locale} className={styles.emblem} />

        <CountryDetails code={code} locale={locale} />

        {content && <CountryHistory content={content} locale={locale} />}

        <Link href={`/${locale}`} className={styles.back}>
          ← {t('page.otherCountries')}
        </Link>
      </main>

      <SiteFooter locale={locale} path={`/${getCountrySlug(code)}`} />
    </>
  );
}

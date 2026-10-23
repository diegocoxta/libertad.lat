import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { CountryDetails } from '~/components/country-details';
import { CountryHistory } from '~/components/country-history';
import { EmblemLink } from '~/components/emblem-link';
import { JsonLd } from '~/components/json-ld';
import { SiteFooter } from '~/components/site-footer';
import { getCountrySlug, getCountryStaticParams, parseCountrySlug } from '~/lib/countries';
import { getTranslations, isSupportedLocale } from '~/lib/i18n';
import { getCountryContent } from '~/lib/country-content';
import { createCountryJsonLd, createPageMetadata, getCountrySeo } from '~/lib/seo';

import styles from './page.module.css';

export const generateStaticParams = getCountryStaticParams;

export async function generateMetadata({ params }: PageProps<'/[locale]/[country]'>): Promise<Metadata> {
  const { locale, country } = await params;
  const code = parseCountrySlug(country);

  if (!isSupportedLocale(locale) || !code) {
    return {};
  }

  const { slug, title, description, image } = getCountrySeo(locale, code);

  return createPageMetadata({ locale, path: `/${slug}`, title, description, image });
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
  const seo = getCountrySeo(locale, code);

  return (
    <>
      <JsonLd
        data={createCountryJsonLd({
          locale,
          slug: seo.slug,
          countryName: seo.name,
          title: seo.title,
          description: seo.description,
          image: seo.image,
        })}
      />

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

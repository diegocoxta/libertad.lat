import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { EmblemLink } from '~/components/emblem-link';
import { SiteFooter } from '~/components/site-footer';
import { getCountries, getCountrySlug } from '~/lib/countries';
import { getTranslations, isSupportedLocale } from '~/lib/i18n';
import { createPageMetadata, getSitemapSeo } from '~/lib/seo';

import styles from './page.module.css';

export async function generateMetadata({ params }: PageProps<'/[locale]/sitemap'>): Promise<Metadata> {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return {};
  }

  const { title, description, image } = getSitemapSeo(locale);

  // The XML sitemap is the one for search engines, so this page only needs its links followed.
  return {
    ...createPageMetadata({ locale, path: '/sitemap', title, description, image }),
    robots: { index: false, follow: true },
  };
}

type SitemapParamsType = PageProps<'/[locale]/sitemap'>['params'];

export default function SitemapPage({ params }: PageProps<'/[locale]/sitemap'>) {
  return (
    <Suspense fallback={<main className={styles.page} />}>
      <SitemapContent params={params} />
    </Suspense>
  );
}

// Plain anchors: a soft navigation to /[locale]/[segment] is intercepted by @modal/(.)[country].
async function SitemapContent({ params }: { params: SitemapParamsType }) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const t = getTranslations(locale);

  return (
    <>
      <main className={styles.page}>
        <EmblemLink locale={locale} className={styles.emblem} />

        <h1 className={styles.title}>{t('page.sitemap')}</h1>

        <div className={styles.sitemap}>
          <section>
            <h2>{t('page.pages')}</h2>
            <ul>
              <li>
                <a href={`/${locale}`}>{t('page.title')}</a>
              </li>
              <li>
                <a href={`/${locale}/2026`}>{t('page.banner')}</a>
              </li>
            </ul>
          </section>

          <section>
            <h2>{t('page.countries')}</h2>
            <ul className={styles.countries}>
              {getCountries(locale).map(({ code, name }) => (
                <li key={code}>
                  <a href={`/${locale}/${getCountrySlug(code)}`}>{name}</a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <Link href={`/${locale}`} className={styles.back}>
          ← {t('page.title')}
        </Link>
      </main>

      <SiteFooter locale={locale} path="/sitemap" />
    </>
  );
}

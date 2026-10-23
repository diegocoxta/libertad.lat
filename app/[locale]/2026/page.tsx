import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { ArticleContent } from '~/components/article-content';
import { EmblemLink } from '~/components/emblem-link';
import { SiteFooter } from '~/components/site-footer';
import { OFFENSIVE_2026 } from '~/content/offensive-2026';
import { LOCALES, getTranslations, isSupportedLocale } from '~/lib/i18n';

import styles from './page.module.css';

export async function generateMetadata({ params }: PageProps<'/[locale]/2026'>): Promise<Metadata> {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return {};
  }

  return {
    title: `${OFFENSIVE_2026.title[locale]} — ${getTranslations(locale)('page.title')}`,
    alternates: {
      canonical: `/${locale}/2026`,
      languages: Object.fromEntries(LOCALES.map((loc) => [loc, `/${loc}/2026`])),
    },
  };
}

type OffensiveParamsType = PageProps<'/[locale]/2026'>['params'];

export default function OffensivePage({ params }: PageProps<'/[locale]/2026'>) {
  return (
    <Suspense fallback={<main className={styles.page} />}>
      <OffensiveContent params={params} />
    </Suspense>
  );
}

async function OffensiveContent({ params }: { params: OffensiveParamsType }) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const t = getTranslations(locale);

  return (
    <>
      <main className={styles.page}>
        <EmblemLink locale={locale} className={styles.emblem} />

        <h1 className={styles.title}>{OFFENSIVE_2026.title[locale]}</h1>

        <ArticleContent blocks={OFFENSIVE_2026.blocks} locale={locale} />

        <Link href={`/${locale}`} className={styles.back}>
          ← {t('page.title')}
        </Link>
      </main>

      <SiteFooter locale={locale} path="/2026" />
    </>
  );
}

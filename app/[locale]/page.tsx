import { notFound } from 'next/navigation';

import { CondorHarpyEagle } from '~/components/condor-harpy-eagle';
import { InvertedAmerica } from '~/components/inverted-america';
import { LanguageSelector } from '~/components/language-selector';
import { getTranslations, isSupportedLocale } from '~/lib/i18n';

import styles from './page.module.css';

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const t = getTranslations(locale);

  return (
    <main className={styles.page}>
      <CondorHarpyEagle className={styles.emblem} />

      <div className={styles.heading}>
        <h1 className={styles.title}>{t('page.title')}</h1>
        <p className={styles.soon}>{t('page.soon')}</p>
      </div>

      <figure className={styles.quote}>
        <blockquote>
          <p>{t('page.quote')}</p>
        </blockquote>
        <figcaption>— {t('page.author')}</figcaption>
      </figure>

      <footer className={styles.footer}>
        <InvertedAmerica className={styles.logo} />

        <LanguageSelector locale={locale} label={t('page.languages')} className={styles.languages} />
      </footer>
    </main>
  );
}

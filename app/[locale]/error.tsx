'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { DEFAULT_LOCALE, getTranslations, isSupportedLocale } from '~/lib/i18n';

import styles from './error.module.css';

// Replaces the framework's own error message, which says what the site is built with.
export default function LocaleError() {
  const { locale } = useParams<{ locale?: string }>();
  const current = isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = getTranslations(current);

  return (
    <main className={styles.page}>
      <p className={styles.message}>{t('page.error')}</p>

      <Link href={`/${current}`} className={styles.back}>
        ← {t('page.title')}
      </Link>
    </main>
  );
}

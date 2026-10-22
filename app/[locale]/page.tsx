import { notFound } from 'next/navigation';

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
      <figure className={styles.quote}>
        <blockquote>
          <p>{t('page.quote')}</p>
        </blockquote>
        <figcaption>— {t('page.author')}</figcaption>
      </figure>
    </main>
  );
}

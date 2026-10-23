import Image from 'next/image';
import { Suspense } from 'react';

import { LanguageSelector } from '~/components/language-selector';
import { Quote } from '~/components/quote';
import { getTranslations, type Locale } from '~/lib/i18n';

import styles from './site-footer.module.css';

type SiteFooterProps = {
  locale: Locale;
  path?: string;
};

export function SiteFooter({ locale, path }: SiteFooterProps) {
  const t = getTranslations(locale);

  return (
    <footer className={styles.footer}>
      <Suspense fallback={<figure className={styles.quote} aria-hidden="true" />}>
        <Quote locale={locale} className={styles.quote} />
      </Suspense>

      <Image src="/inverted-america.svg" alt="" width={91} height={96} unoptimized className={styles.logo} />

      <LanguageSelector locale={locale} label={t('page.languages')} className={styles.languages} path={path} />
    </footer>
  );
}

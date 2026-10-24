import Image from 'next/image';

import { LanguageSelector } from '~/components/language-selector';
import { Quote } from '~/components/quote';
import { getTranslations, type Locale } from '~/lib/i18n';
import { getContactHref } from '~/lib/site';

import styles from './site-footer.module.css';

type SiteFooterProps = {
  locale: Locale;
  path?: string;
};

export function SiteFooter({ locale, path }: SiteFooterProps) {
  const t = getTranslations(locale);

  return (
    <footer className={styles.footer}>
      <Quote locale={locale} className={styles.quote} />

      <Image src="/inverted-america.svg" alt="" width={91} height={96} unoptimized className={styles.logo} />

      <LanguageSelector locale={locale} label={t('page.languages')} path={path} />

      <a href={getContactHref()} className={styles.contact}>
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
        {t('page.contact')}
      </a>
    </footer>
  );
}

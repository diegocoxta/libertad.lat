import type { Metadata } from 'next';
import { Geist } from 'next/font/google';

import { DEFAULT_LOCALE, LOCALES, LOCALE_NAMES, getTranslations } from '~/lib/i18n';

import '~/app/globals.css';

import styles from './global-not-found.module.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: getTranslations(DEFAULT_LOCALE)('page.notFound'),
  robots: { index: false, follow: false },
};

// No locale is known for an address that matches no page, so the message comes in every language.
export default function GlobalNotFound() {
  return (
    <html lang={DEFAULT_LOCALE} className={geistSans.variable}>
      <body>
        <main className={styles.page}>
          <h1 className={styles.code}>404</h1>

          <ul className={styles.list}>
            {LOCALES.map((locale) => (
              <li key={locale}>
                <a href={`/${locale}`} lang={locale} hrefLang={locale}>
                  <span>{getTranslations(locale)('page.notFound')}</span>
                  <small>
                    ← {LOCALE_NAMES[locale]}
                  </small>
                </a>
              </li>
            ))}
          </ul>
        </main>
      </body>
    </html>
  );
}

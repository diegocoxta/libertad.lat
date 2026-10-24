'use client';

import './globals.css';

import { ThemeProvider } from '~/components/theme-provider';
import { DEFAULT_LOCALE, LOCALES, LOCALE_NAMES, getTranslations } from '~/lib/i18n';

import styles from './global-error.module.css';

// Replaces the framework's own error page, which says what the site is built with. No locale is known
// here, so the message comes in every language.
export default function GlobalError() {
  return (
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <main className={styles.page}>
            <ul className={styles.list}>
              {LOCALES.map((locale) => (
                <li key={locale}>
                  <a href={`/${locale}`} lang={locale} hrefLang={locale}>
                    <span>{getTranslations(locale)('page.error')}</span>
                    <small>← {LOCALE_NAMES[locale]}</small>
                  </a>
                </li>
              ))}
            </ul>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}

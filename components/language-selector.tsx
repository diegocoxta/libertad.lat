import { LOCALES, LOCALE_NAMES, type Locale } from '~/lib/i18n';

import styles from './language-selector.module.css';

type LanguageSelectorProps = {
  locale: Locale;
  label: string;
  className?: string;
  path?: string;
};

// Plain anchors: a soft navigation to /[locale]/[segment] is intercepted by @modal/(.)[country].
export function LanguageSelector({ locale, label, className, path = '' }: LanguageSelectorProps) {
  return (
    <nav aria-label={label} className={className ? `${styles.languages} ${className}` : styles.languages}>
      <ul>
        {LOCALES.map((loc) => (
          <li key={loc}>
            <a href={`/${loc}${path}`} hrefLang={loc} lang={loc} aria-current={loc === locale ? 'page' : undefined}>
              {LOCALE_NAMES[loc]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

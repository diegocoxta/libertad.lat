import Link from 'next/link';

import { LOCALES, LOCALE_NAMES, type Locale } from '~/lib/i18n';

type LanguageSelectorProps = {
  locale: Locale;
  label: string;
  className?: string;
  path?: string;
};

export function LanguageSelector({ locale, label, className, path = '' }: LanguageSelectorProps) {
  return (
    <nav aria-label={label} className={className}>
      <ul>
        {LOCALES.map((loc) => (
          <li key={loc}>
            <Link href={`/${loc}${path}`} hrefLang={loc} lang={loc} aria-current={loc === locale ? 'page' : undefined}>
              {LOCALE_NAMES[loc]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

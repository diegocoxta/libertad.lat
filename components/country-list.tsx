import Link from 'next/link';

import { CountryFlag } from '~/components/country-flag';
import { getCountries, getCountrySlug } from '~/lib/countries';
import { getCountryContent } from '~/lib/country-content';
import type { Locale } from '~/lib/i18n';

import styles from './country-list.module.css';

type CountryListProps = {
  locale: Locale;
  className?: string;
};

export function CountryList({ locale, className }: CountryListProps) {
  return (
    <ul className={className}>
      {getCountries(locale).map(({ code, name }) => {
        const content = getCountryContent(code);
        const periods = [content?.latest?.period[locale], content?.period[locale]].filter(Boolean);

        return (
          <li key={code}>
            <Link href={`/${locale}/${getCountrySlug(code)}`}>
              <CountryFlag code={code} aria-hidden="true" focusable="false" />
              <span>{name}</span>
              <span className={styles.periods}>
                {periods.map((period) => (
                  <span key={period} className={styles.period}>
                    {period}
                  </span>
                ))}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

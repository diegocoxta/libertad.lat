import Link from 'next/link';

import { CountryFlag } from '~/components/country-flag';
import { getCountries, getCountrySlug } from '~/lib/countries';
import type { Locale } from '~/lib/i18n';

type CountryListProps = {
  locale: Locale;
  className?: string;
};

export function CountryList({ locale, className }: CountryListProps) {
  return (
    <ul className={className}>
      {getCountries(locale).map(({ code, name }) => (
        <li key={code}>
          <Link href={`/${locale}/${getCountrySlug(code)}`}>
            <CountryFlag code={code} aria-hidden="true" focusable="false" />
            <span>{name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

import { CountryFlag } from '~/components/country-flag';
import { getCountryName, type CountryCode } from '~/lib/countries';
import type { Locale } from '~/lib/i18n';

import styles from './country-details.module.css';

type CountryDetailsProps = {
  code: CountryCode;
  locale: Locale;
  heading?: 'h1' | 'h2';
};

export function CountryDetails({ code, locale, heading: Heading = 'h1' }: CountryDetailsProps) {
  return (
    <div className={styles.details}>
      <CountryFlag code={code} aria-hidden="true" focusable="false" className={styles.flag} />

      <Heading className={styles.title}>{getCountryName(code, locale)}</Heading>
    </div>
  );
}

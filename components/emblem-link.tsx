import Link from 'next/link';

import { CondorHarpyEagle } from '~/components/condor-harpy-eagle';
import { getTranslations, type Locale } from '~/lib/i18n';

import styles from './emblem-link.module.css';

type EmblemLinkProps = {
  locale: Locale;
  className?: string;
};

export function EmblemLink({ locale, className }: EmblemLinkProps) {
  const t = getTranslations(locale);

  return (
    <Link href={`/${locale}`} aria-label={`${t('page.joke')} ${t('page.title')}`} className={styles.link}>
      <CondorHarpyEagle
        topText={t('page.joke').toLocaleUpperCase(locale)}
        bottomText={t('page.title').toLocaleUpperCase(locale)}
        className={className}
      />
    </Link>
  );
}

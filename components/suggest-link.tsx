import { getTranslations, type Locale } from '~/lib/i18n';
import { getContactHref } from '~/lib/site';

import styles from './suggest-link.module.css';

type SuggestLinkProps = {
  locale: Locale;
  path: string;
};

export function SuggestLink({ locale, path }: SuggestLinkProps) {
  return (
    <a href={getContactHref(`/${locale}${path}`)} className={styles.link}>
      {getTranslations(locale)('page.suggest')}
    </a>
  );
}

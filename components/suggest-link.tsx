import { getTranslations, type Locale } from '~/lib/i18n';
import { getContactHref } from '~/lib/site';

import styles from './suggest-link.module.css';

type SuggestLinkProps = {
  locale: Locale;
};

export function SuggestLink({ locale }: SuggestLinkProps) {
  return (
    <a href={getContactHref()} className={styles.link}>
      {getTranslations(locale)('page.suggest')}
    </a>
  );
}

import { RichText } from '~/components/rich-text';
import { GENERAL_SOURCES } from '~/content/general-sources';
import type { CountryContentType } from '~/lib/country-content';
import { getTranslations, type Locale } from '~/lib/i18n';

import styles from './country-history.module.css';

type CountryHistoryProps = {
  content: CountryContentType;
  locale: Locale;
  heading?: 'h2' | 'h3';
};

export function CountryHistory({ content, locale, heading: Heading = 'h2' }: CountryHistoryProps) {
  const t = getTranslations(locale);
  const { impact } = content;

  return (
    <div className={styles.history}>
      <p className={styles.period}>{content.period[locale]}</p>
      <p className={styles.summary}>
        <RichText text={content.summary[locale]} />
      </p>

      <section>
        <Heading>{t('page.happened')}</Heading>
        <p>
          <RichText text={content.happened[locale]} />
        </p>
      </section>

      <section>
        <Heading>{t('page.usActions')}</Heading>
        <ul>
          {content.usActions.map((item, index) => (
            <li key={index}>
              <strong>{item.label[locale]}:</strong> <RichText text={item.text[locale]} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <Heading>{t('page.humanImpact')}</Heading>
        {impact.text && (
          <p>
            <RichText text={impact.text[locale]} />
          </p>
        )}
        {impact.items && (
          <ul>
            {impact.items.map((item, index) => (
              <li key={index}>
                <strong>{item.label[locale]}:</strong> <RichText text={item.text[locale]} />
              </li>
            ))}
          </ul>
        )}
        {impact.context && (
          <p>
            <RichText text={impact.context[locale]} />
          </p>
        )}
      </section>

      <section>
        <Heading>{t('page.sources')}</Heading>
        <ul className={styles.sources}>
          {content.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.title}
              </a>
              {source.note && (
                <>
                  {' — '}
                  <RichText text={source.note[locale]} />
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <Heading>{t('page.generalSources')}</Heading>
        <p>
          <RichText text={GENERAL_SOURCES.intro[locale]} />
        </p>
        <ul className={styles.sources}>
          {GENERAL_SOURCES.items.map((item) => (
            <li key={item.url}>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.title[locale]}
              </a>
              {' — '}
              <RichText text={item.note[locale]} />
            </li>
          ))}
        </ul>
        <p>
          <RichText text={GENERAL_SOURCES.outro[locale]} />
        </p>
      </section>
    </div>
  );
}

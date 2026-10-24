import { RichText } from '~/components/rich-text';
import { GENERAL_SOURCES } from '~/content/general-sources';
import type { CountryContentType, CountryEraType } from '~/lib/country-content';
import { getTranslations, type Locale } from '~/lib/i18n';

import styles from './country-history.module.css';

type HeadingType = 'h2' | 'h3';

type CountryEraProps = {
  era: CountryEraType;
  locale: Locale;
  heading: HeadingType;
};

type CountryHistoryProps = {
  content: CountryContentType;
  locale: Locale;
  heading?: HeadingType;
};

function CountryEra({ era, locale, heading: Heading }: CountryEraProps) {
  const t = getTranslations(locale);
  const { impact } = era;

  return (
    <div role="group" aria-label={era.period[locale]} className={styles.era}>
      <p className={styles.period}>{era.period[locale]}</p>
      <p className={styles.summary}>
        <RichText text={era.summary[locale]} />
      </p>

      <section>
        <Heading>{t('page.happened')}</Heading>
        <p>
          <RichText text={era.happened[locale]} />
        </p>
      </section>

      <section>
        <Heading>{t('page.usActions')}</Heading>
        <ul>
          {era.usActions.map((item, index) => (
            <li key={index}>
              <strong>{item.label[locale]}:</strong> <RichText text={item.text[locale]} />
            </li>
          ))}
        </ul>
      </section>

      {impact && (
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
      )}

      <section>
        <Heading>{t('page.sources')}</Heading>
        <ul className={styles.sources}>
          {era.sources.map((source) => (
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
    </div>
  );
}

export function CountryHistory({ content, locale, heading: Heading = 'h2' }: CountryHistoryProps) {
  const t = getTranslations(locale);

  return (
    <div className={styles.history}>
      {content.latest && <CountryEra era={content.latest} locale={locale} heading={Heading} />}

      <CountryEra era={content} locale={locale} heading={Heading} />

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

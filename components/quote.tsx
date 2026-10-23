import { CountryFlag } from '~/components/country-flag';
import { QuotePicker } from '~/components/quote-picker';
import { getTranslations, type Locale } from '~/lib/i18n';
import { QUOTES } from '~/lib/quotes';

type QuoteProps = {
  locale: Locale;
  className?: string;
};

export function Quote({ locale, className }: QuoteProps) {
  const t = getTranslations(locale);

  return (
    <QuotePicker className={className}>
      {QUOTES.map((quote) => (
        <figure key={quote.id} className={className}>
          <blockquote>
            <p>{t(`quote.${quote.id}.text`)}</p>
          </blockquote>
          <figcaption>
            <span>
              <CountryFlag code={quote.country} aria-hidden="true" focusable="false" />
              {quote.author}
            </span>
            {quote.hasSource && <small>{t(`quote.${quote.id}.source`)}</small>}
          </figcaption>
        </figure>
      ))}
    </QuotePicker>
  );
}

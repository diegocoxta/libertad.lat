import { connection } from 'next/server';

import { CountryFlag } from '~/components/country-flag';
import { getTranslations, type Locale } from '~/lib/i18n';
import { getRandomQuote } from '~/lib/quotes';

type QuoteProps = {
  locale: Locale;
  className?: string;
};

export async function Quote({ locale, className }: QuoteProps) {
  // Picks a different quote on every request instead of baking one into the static shell.
  await connection();

  const quote = getRandomQuote();
  const t = getTranslations(locale);

  return (
    <figure className={className}>
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
  );
}

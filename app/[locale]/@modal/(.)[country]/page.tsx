import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { CountryDetails } from '~/components/country-details';
import { CountryHistory } from '~/components/country-history';
import { Modal } from '~/components/modal';
import { getCountryName, getCountryStaticParams, parseCountrySlug } from '~/lib/countries';
import { getTranslations, isSupportedLocale } from '~/lib/i18n';
import { getCountryContent } from '~/lib/country-content';

export const generateStaticParams = getCountryStaticParams;

type CountryParamsType = PageProps<'/[locale]/[country]'>['params'];

export default function CountryModal({ params }: PageProps<'/[locale]/[country]'>) {
  return (
    <Suspense fallback={null}>
      <CountryModalContent params={params} />
    </Suspense>
  );
}

async function CountryModalContent({ params }: { params: CountryParamsType }) {
  const { locale, country } = await params;
  const code = parseCountrySlug(country);

  if (!isSupportedLocale(locale) || !code) {
    notFound();
  }

  const content = getCountryContent(code);

  return (
    <Modal label={getCountryName(code, locale)} closeLabel={getTranslations(locale)('page.close')}>
      <CountryDetails code={code} locale={locale} heading="h2" />

      {content && <CountryHistory content={content} locale={locale} heading="h3" />}
    </Modal>
  );
}

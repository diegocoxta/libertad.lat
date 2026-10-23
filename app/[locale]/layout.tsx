import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { notFound } from 'next/navigation';
import { preload } from 'react-dom';

import { SEAL_ART_PATH } from '~/components/condor-harpy-eagle';
import { LOCALES, getTranslations, isSupportedLocale } from '~/lib/i18n';
import { SITE_URL } from '~/lib/site';
import { STARTUP_IMAGES } from '~/lib/startup-images';

import '~/app/globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: '#d23336',
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, modal, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  // Every page draws the seal, so its artwork is requested with the document instead of after it.
  preload(SEAL_ART_PATH, { as: 'image', fetchPriority: 'high' });

  return (
    <html lang={locale} className={geistSans.variable}>
      <body>
        {children}
        {modal}
      </body>
    </html>
  );
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return {};
  }

  const title = getTranslations(locale)('page.title');

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: title,
    title,
    appleWebApp: {
      title,
      startupImage: STARTUP_IMAGES,
    },
  };
}

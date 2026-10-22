import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { notFound } from 'next/navigation';

import { LOCALES, getTranslations, isSupportedLocale } from '~/lib/i18n';
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

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return (
    <html lang={locale} className={geistSans.variable}>
      <body>{children}</body>
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
    title,
    appleWebApp: {
      title,
      startupImage: STARTUP_IMAGES,
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ...Object.fromEntries(LOCALES.map((loc) => [loc, `/${loc}`])),
        'x-default': `/${LOCALES[0]}`,
      },
    },
  };
}

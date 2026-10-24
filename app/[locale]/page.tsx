import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CountryList } from "~/components/country-list";
import { EmblemLink } from "~/components/emblem-link";
import { JsonLd } from "~/components/json-ld";
import { LanguageSelector } from "~/components/language-selector";
import { SiteFooter } from "~/components/site-footer";
import { getTranslations, isSupportedLocale } from "~/lib/i18n";
import { createPageMetadata, createWebSiteJsonLd, getHomeDescription } from "~/lib/seo";
import { getOgImagePath } from "~/lib/share";

import styles from "./page.module.css";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return {};
  }

  return createPageMetadata({
    locale,
    title: getTranslations(locale)("page.title"),
    description: getHomeDescription(locale),
    image: getOgImagePath(locale, "home"),
  });
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const t = getTranslations(locale);

  return (
    <>
      <JsonLd data={createWebSiteJsonLd(locale, getHomeDescription(locale))} />

      <main className={styles.page}>
        <LanguageSelector locale={locale} label={t("page.languages")} className={styles.languages} />

        <EmblemLink locale={locale} className={styles.emblem} />

        <div className={styles.heading}>
          <h1 className={styles.title}>{t("page.title")}</h1>
          <p className={styles.soon}>{t("page.soon")}</p>
        </div>

        <CountryList locale={locale} className={styles.countries} />
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}

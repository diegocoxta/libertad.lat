import { notFound } from "next/navigation";

import { CountryList } from "~/components/country-list";
import { EmblemLink } from "~/components/emblem-link";
import { SiteFooter } from "~/components/site-footer";
import { getTranslations, isSupportedLocale } from "~/lib/i18n";

import styles from "./page.module.css";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const t = getTranslations(locale);

  return (
    <>
      <main className={styles.page}>
        <EmblemLink locale={locale} className={styles.emblem} />

        <div className={styles.heading}>
          <h1 className={styles.title}>{t("page.title")}</h1>
          <p className={styles.soon}>{t("page.soon")}</p>
        </div>

        <CountryList locale={locale} className={styles.countries} />

        {/* Plain anchor: a soft navigation to /[locale]/2026 would be intercepted by @modal/(.)[country]. */}
        <a href={`/${locale}/2026`} className={styles.banner}>
          {t("page.banner")}
          <span aria-hidden="true">→</span>
        </a>
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}

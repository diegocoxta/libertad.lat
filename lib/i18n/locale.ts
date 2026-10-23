export const LOCALES = ['es', 'pt', 'en', 'gn', 'fr', 'qu', 'ht'] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  es: 'Español',
  pt: 'Português',
  en: 'English',
  gn: "Avañe'ẽ",
  fr: 'Français',
  qu: 'Runasimi',
  ht: 'Kreyòl ayisyen',
};

export const DEFAULT_LOCALE: Locale = LOCALES[0];

export function isSupportedLocale(value?: string | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function parseAcceptLanguage(header?: string | null): string[] {
  return (header ?? '')
    .split(',')
    .map((part) => {
      const [tag, ...modifiers] = part.trim().split(';');
      const weight = modifiers.map((modifier) => modifier.trim()).find((modifier) => modifier.startsWith('q='));
      const q = weight ? Number(weight.slice(2)) : 1;

      return { tag: tag.trim().slice(0, 2).toLowerCase(), q: Number.isFinite(q) ? q : 1 };
    })
    .filter((entry) => entry.tag)
    .sort((a, b) => b.q - a.q)
    .map((entry) => entry.tag);
}

export function negotiateLocale(acceptLanguage?: string | null): Locale {
  for (const tag of parseAcceptLanguage(acceptLanguage)) {
    if (isSupportedLocale(tag)) {
      return tag;
    }
  }

  return DEFAULT_LOCALE;
}

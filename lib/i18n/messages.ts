import { DEFAULT_LOCALE, type Locale } from '~/lib/i18n/locale';

import es from '~/lib/i18n/translations/es.json';
import pt from '~/lib/i18n/translations/pt.json';
import en from '~/lib/i18n/translations/en.json';

export type TranslatorType = (key: string) => string;

const DICTIONARIES: Record<Locale, Record<string, string>> = { es, pt, en };

export function getTranslations(locale: Locale): TranslatorType {
  return (key) => DICTIONARIES[locale][key] ?? DICTIONARIES[DEFAULT_LOCALE][key] ?? key;
}

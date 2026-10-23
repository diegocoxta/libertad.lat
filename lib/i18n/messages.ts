import { DEFAULT_LOCALE, type Locale } from '~/lib/i18n/locale';

import es from '~/lib/i18n/translations/es.json';
import pt from '~/lib/i18n/translations/pt.json';
import gn from '~/lib/i18n/translations/gn.json';
import fr from '~/lib/i18n/translations/fr.json';
import qu from '~/lib/i18n/translations/qu.json';
import ht from '~/lib/i18n/translations/ht.json';

export type TranslatorType = (key: string) => string;

const DICTIONARIES: Record<Locale, Record<string, string>> = { es, pt, gn, fr, qu, ht };

export function getTranslations(locale: Locale): TranslatorType {
  return (key) => DICTIONARIES[locale][key] ?? DICTIONARIES[DEFAULT_LOCALE][key] ?? key;
}

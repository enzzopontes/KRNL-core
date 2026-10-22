import { ptBR, enUS, TranslationKey } from './translations';

export function useI18n() {
  const lang: string = 'pt';
  const dict = lang === 'en' ? enUS : ptBR;

  return {
    t: (key: TranslationKey): string => (dict as any)[key] || key,
    lang,
  };
}

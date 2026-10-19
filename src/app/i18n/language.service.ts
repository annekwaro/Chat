import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { setLocale } from '../locale';

export type Lang = 'fr' | 'en';
export const LANGS: Lang[] = ['fr', 'en'];

// en-GB: day before month and a 24-hour clock, like France
const LOCALES: Record<Lang, string> = { fr: 'fr-FR', en: 'en-GB' };
const STORAGE_KEY = 'lang';

// The app's language: French by default, or English. The choice is kept on the device.
@Injectable({ providedIn: 'root' })
export class LanguageService {
  constructor(private transloco: TranslocoService) {}

  get lang(): Lang {
    return this.transloco.getActiveLang() as Lang;
  }

  // The language chosen earlier on this device, else the phone's language if the app has it, else French
  detect(): Lang {
    const saved = this.read();
    if (saved) return saved;
    const preferred = typeof navigator === 'undefined' ? [] : navigator.languages || [navigator.language];
    for (const tag of preferred) {
      const code = (tag || '').slice(0, 2).toLowerCase() as Lang;
      if (LANGS.includes(code)) return code;
    }
    return 'fr';
  }

  use(lang: Lang, remember = true) {
    setLocale(LOCALES[lang]);
    this.transloco.setActiveLang(lang);
    if (typeof document !== 'undefined') document.documentElement.lang = lang;
    if (remember) this.save(lang);
  }

  toggle() {
    this.use(this.lang === 'fr' ? 'en' : 'fr');
  }

  translate(key: string, params: Record<string, any> = {}): any {
    return this.transloco.translate(key, params);
  }

  // Counts: `key.one` or `key.other` with {{count}}. French uses the singular for 0 and 1, English only for 1.
  plural(key: string, count: number, params: Record<string, any> = {}): string {
    const rule = new Intl.PluralRules(LOCALES[this.lang]).select(count) === 'one' ? 'one' : 'other';
    return this.transloco.translate(`${key}.${rule}`, { count, ...params });
  }

  private read(): Lang | null {
    try {
      const value = localStorage.getItem(STORAGE_KEY) as Lang | null;
      return value && LANGS.includes(value) ? value : null;
    } catch {
      return null;
    }
  }

  private save(lang: Lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // storage unavailable (e.g. private mode): the choice lasts until the app is closed
    }
  }
}

// Dates, times and numbers are formatted for the app's language (set by LanguageService)
let locale = 'fr-FR';

export function currentLocale(): string {
  return locale;
}

export function setLocale(value: string) {
  locale = value;
}

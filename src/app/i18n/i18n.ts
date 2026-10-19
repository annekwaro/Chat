import { APP_INITIALIZER, Injectable, Pipe, PipeTransform, isDevMode } from '@angular/core';
import { TranslocoLoader, TranslocoService, provideTransloco } from '@jsverse/transloco';
import { of } from 'rxjs';
import { en } from './en';
import { fr } from './fr';
import { LanguageService } from './language.service';

const TRANSLATIONS: Record<string, any> = { fr, en };

// The text is bundled with the app, so it works offline and switching language is instant
@Injectable({ providedIn: 'root' })
export class BundledLoader implements TranslocoLoader {
  getTranslation(lang: string) {
    return of(TRANSLATIONS[lang] || fr);
  }
}

// detect: pick the saved or phone language at startup (the app); tests leave it off and run in French
export function provideI18n(options: { detect?: boolean } = {}) {
  return [
    provideTransloco({
      config: {
        availableLangs: ['fr', 'en'],
        defaultLang: 'fr',
        fallbackLang: 'fr',
        reRenderOnLangChange: true,
        missingHandler: { useFallbackTranslation: true, logMissingKey: isDevMode() },
        prodMode: !isDevMode(),
      },
      loader: BundledLoader,
    }),
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [TranslocoService, LanguageService],
      useFactory: (transloco: TranslocoService, language: LanguageService) => () => {
        // Loaded up front so translate() in code never sees a missing language
        transloco.setTranslation(fr, 'fr');
        transloco.setTranslation(en, 'en');
        language.use(options.detect ? language.detect() : 'fr', false);
      },
    },
  ];
}

// {{ 'explore.sessions' | plural: n }} -> "1 séance" / "3 séances"
@Pipe({ name: 'plural', standalone: true, pure: false })
export class PluralPipe implements PipeTransform {
  constructor(private language: LanguageService) {}

  transform(key: string, count: number, params: Record<string, any> = {}): string {
    return this.language.plural(key, count, params);
  }
}

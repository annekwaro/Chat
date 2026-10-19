import { TestBed } from '@angular/core/testing';
import { currentLocale } from '../locale';
import { en } from './en';
import { fr } from './fr';
import { LanguageService } from './language.service';

// Every key path in a translation file, with array lengths, e.g. "help.steps[3]"
function keys(obj: any, prefix = ''): string[] {
  const result: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (Array.isArray(v)) result.push(`${path}[${v.length}]`);
    else if (v && typeof v === 'object') result.push(...keys(v, path));
    else result.push(path);
  }
  return result;
}

describe('LanguageService', () => {
  let service: LanguageService;

  beforeEach(() => {
    localStorage.removeItem('lang');
    service = TestBed.inject(LanguageService);
  });

  afterEach(() => {
    service.use('fr', false); // the rest of the tests run in French
    localStorage.removeItem('lang');
  });

  it('has the same text in French and English', () => {
    expect(keys(en)).toEqual(keys(fr));
  });

  it('starts in French and switches to English', () => {
    expect(service.lang).toBe('fr');
    expect(service.translate('tabs.home')).toBe('Accueil');

    service.toggle();
    expect(service.lang).toBe('en');
    expect(service.translate('tabs.home')).toBe('Home');
    expect(service.translate('chat.hello', { name: 'Bob' })).toBe('Say hello to Bob 👋');
    expect(currentLocale()).toBe('en-GB');
    expect(document.documentElement.lang).toBe('en');
    expect(localStorage.getItem('lang')).toBe('en'); // remembered on this device
  });

  it('uses the saved choice, then the phone’s language, then French', () => {
    const languages = spyOnProperty(navigator, 'languages').and.returnValue(['de-DE', 'en-US']);
    expect(service.detect()).toBe('en');

    languages.and.returnValue(['de-DE']);
    expect(service.detect()).toBe('fr');

    localStorage.setItem('lang', 'fr');
    languages.and.returnValue(['en-GB']);
    expect(service.detect()).toBe('fr');
  });

  it('counts the French and English way', () => {
    expect(service.plural('explore.sessions', 0)).toBe('0 séance');
    expect(service.plural('explore.sessions', 2)).toBe('2 séances');
    service.use('en', false);
    expect(service.plural('explore.sessions', 0)).toBe('0 sessions');
    expect(service.plural('explore.sessions', 1)).toBe('1 session');
  });
});
